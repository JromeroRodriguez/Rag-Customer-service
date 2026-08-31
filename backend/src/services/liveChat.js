import dotenv from "dotenv";
dotenv.config();

// Active SSE client connections indexed by sessionId
const activeClients = new Map();

// Map linking telegram message ID -> sessionId
const ticketMap = new Map();

// Message history for polling fallback
const sessionHistory = new Map();

// Sessions currently in active Live Human Advisor mode (LLM bypassed)
const activeLiveSessions = new Set();

let pollerRunning = false;
let updateOffset = 0;

/**
 * Check if a session is currently in Live Human Advisor mode
 */
export function isLiveSession(sessionId) {
  return activeLiveSessions.has(sessionId);
}

/**
 * Enable or disable Live Human Advisor mode for a session
 */
export function setLiveSession(sessionId, active = true) {
  if (active) {
    activeLiveSessions.add(sessionId);
    console.log(`[liveChat] Session ${sessionId} entered LIVE ADVISOR MODE (LLM muted).`);
  } else {
    activeLiveSessions.delete(sessionId);
    console.log(`[liveChat] Session ${sessionId} exited Live Advisor Mode (LLM resumed).`);
  }
}

/**
 * Reset a session completely (clear history, advisor mode, and student name)
 */
export function resetSession(sessionId) {
  sessionHistory.delete(sessionId);
  activeLiveSessions.delete(sessionId);
  studentNames.delete(sessionId);
  console.log(`[liveChat] Session ${sessionId} completely reset.`);
}

/**
 * Register a client's Server-Sent Events (SSE) stream
 */
export function subscribeSession(sessionId, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable proxy buffering
  res.flushHeaders?.();

  activeClients.set(sessionId, res);
  console.log(`[liveChat] Client connected to SSE session: ${sessionId} (Active: ${activeClients.size})`);

  // Send initial connection event
  res.write(
    `data: ${JSON.stringify({ type: "connected", sessionId, inLiveMode: isLiveSession(sessionId) })}\n\n`
  );

  // Heartbeat interval to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 15000);

  res.on("close", () => {
    clearInterval(heartbeat);
    activeClients.delete(sessionId);
    console.log(`[liveChat] Client disconnected from SSE session: ${sessionId} (Active: ${activeClients.size})`);
  });
}

/**
 * Get message history for polling fallback
 */
export function getSessionMessages(sessionId) {
  return sessionHistory.get(sessionId) || [];
}

/**
 * Send an advisor message from Telegram to the student's browser session
 */
export function sendAdvisorMessage(sessionId, text) {
  // Ensure the session is marked as live
  setLiveSession(sessionId, true);

  const payload = {
    id: `advisor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    role: "human_advisor",
    content: text,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    isHumanAdvisor: true,
  };

  // Store in history for polling fallback
  if (!sessionHistory.has(sessionId)) {
    sessionHistory.set(sessionId, []);
  }
  sessionHistory.get(sessionId).push(payload);

  // Try delivering via SSE
  const clientRes = activeClients.get(sessionId);
  if (clientRes) {
    try {
      clientRes.write(`event: advisor_message\ndata: ${JSON.stringify(payload)}\n\n`);
      clientRes.write(`data: ${JSON.stringify(payload)}\n\n`);
      console.log(`[liveChat] Message delivered via SSE to session: ${sessionId}`);
      return true;
    } catch (err) {
      console.warn(`[liveChat] Failed SSE write to ${sessionId}:`, err.message);
    }
  }

  console.log(`[liveChat] Message saved to session history for polling: ${sessionId}`);
  return true;
}

// Store student names per session
const studentNames = new Map();

/**
 * Send an escalation lead to the Advisor's Telegram
 */
export async function notifyAdvisorTelegram({ sessionId, studentName, question, answer }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADVISOR_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[liveChat] Missing Telegram token or chat ID.");
    return false;
  }

  // Save student name if provided
  if (studentName) {
    studentNames.set(sessionId, studentName.trim());
  }

  const nameDisplay = studentNames.get(sessionId) || studentName || "Estudiante por confirmar";

  // Mark session as live
  setLiveSession(sessionId, true);

  const messageText = `🚨 *NUEVA ATENCIÓN HUMANA REQUERIDA*
🎫 *Ticket:* \`#${sessionId}\`
👤 *Estudiante:* *${nameDisplay}*

📝 *Pregunta del Estudiante:*
${question}

💡 *Diagnóstico de Lingua:*
${answer}

👉 *Para responderle a ${nameDisplay}:* Dale a *Responder (Reply)* a este mensaje con tu respuesta (o escribe: \`#${sessionId} Tu mensaje\`).`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();
    if (data.ok && data.result?.message_id) {
      ticketMap.set(data.result.message_id.toString(), sessionId);
      console.log(`[liveChat] Telegram escalation sent for ${nameDisplay}. Message ID: ${data.result.message_id}`);
      return true;
    }
  } catch (err) {
    console.error("[liveChat] Error sending Telegram alert:", err.message);
  }
  return false;
}

/**
 * Forward subsequent student messages directly to Telegram while in Live Advisor Mode (No LLM)
 */
export async function forwardStudentMessageToAdvisor(sessionId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADVISOR_CHAT_ID;

  if (!token || !chatId) return false;

  const nameDisplay = studentNames.get(sessionId) || "Estudiante";

  const messageText = `💬 *MENSAJE DE ${nameDisplay.toUpperCase()}* (Ticket \`#${sessionId}\`)

"${text}"

👉 *Para responderle:* Dale a *Responder (Reply)* a este mensaje.`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();
    if (data.ok && data.result?.message_id) {
      ticketMap.set(data.result.message_id.toString(), sessionId);
      console.log(`[liveChat] Student follow-up forwarded to Telegram. Message ID: ${data.result.message_id}`);
      return true;
    }
  } catch (err) {
    console.error("[liveChat] Error forwarding student message to Telegram:", err.message);
  }
  return false;
}

/**
 * Start Telegram Polling to catch advisor replies in real-time
 */
export function startTelegramListener() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("[liveChat] No TELEGRAM_BOT_TOKEN found. Listener disabled.");
    return;
  }

  if (pollerRunning) return;
  pollerRunning = true;
  console.log("[liveChat] Telegram advisor polling listener active.");

  async function pollLoop() {
    while (pollerRunning) {
      try {
        const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${updateOffset}&timeout=20`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            updateOffset = update.update_id + 1;
            const msg = update.message;

            if (!msg || !msg.text) continue;

            console.log(`[liveChat] Incoming message from Telegram chat ${msg.chat.id}: "${msg.text}"`);

            let targetSessionId = null;

            // 1. Check if it's a direct Reply to an escalation ticket
            if (msg.reply_to_message) {
              const repliedId = msg.reply_to_message.message_id.toString();
              targetSessionId = ticketMap.get(repliedId);

              // Fallback: extract ticket from replied text (#std_xxxx)
              if (!targetSessionId && msg.reply_to_message.text) {
                const match = msg.reply_to_message.text.match(/(std_[a-zA-Z0-9_\-]+)/);
                if (match) targetSessionId = match[1];
              }
            }

            // 2. Check if message manually specifies ticket: "#std_123 Hola..."
            if (!targetSessionId) {
              const match = msg.text.match(/#(std_[a-zA-Z0-9_\-]+)\s+(.+)/);
              if (match) {
                targetSessionId = match[1];
                msg.text = match[2];
              }
            }

            // 3. Smart Fallback: Route to the active connected student
            if (!targetSessionId) {
              const activeKeys = Array.from(activeClients.keys());
              if (activeKeys.length > 0) {
                targetSessionId = activeKeys[activeKeys.length - 1];
                console.log(`[liveChat] Auto-routed to active web session: ${targetSessionId}`);
              }
            }

            // Redirect if target session is not connected but another is
            if (targetSessionId && !activeClients.has(targetSessionId)) {
              const connectedSessions = Array.from(activeClients.keys());
              if (connectedSessions.length > 0) {
                console.log(`[liveChat] Target session ${targetSessionId} not connected, routing to live student: ${connectedSessions[0]}`);
                targetSessionId = connectedSessions[0];
              }
            }

            if (targetSessionId) {
              sendAdvisorMessage(targetSessionId, msg.text);

              // Confirmation back to Telegram
              await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: msg.chat.id,
                  text: `✅ *Mensaje entregado en vivo al estudiante en la web*\n💬 "${msg.text}"`,
                  reply_to_message_id: msg.message_id,
                  parse_mode: "Markdown",
                }),
              }).catch(() => {});
            }
          }
        }
      } catch (err) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  pollLoop().catch((err) => console.error("[liveChat] Poller loop error:", err));
}
