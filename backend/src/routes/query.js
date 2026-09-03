import { Router } from "express";
import { retrieveRelevantChunks } from "../rag/retriever.js";
import { buildMessages } from "../llm/promptBuilder.js";
import { generateAnswer, generateAnswerStream } from "../llm/llmClient.js";
import { shouldEscalate, isBillingOrComplaint, isDirectHumanRequest } from "../services/escalation.js";
import { notifyAdvisorTelegram, isLiveSession, forwardStudentMessageToAdvisor } from "../services/liveChat.js";
import { checkScope, isAcademyRelated } from "../services/scopeGuard.js";

export const queryRouter = Router();

// Deduplication window to prevent feedback loops between Web Chat and n8n
const recentEscalations = new Set();

queryRouter.post("/query", async (req, res) => {
  const { question, sessionId, studentName, studentPhone, history = [], stream = false } = req.body ?? {};

  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "Field 'question' is required." });
  }

  const isFromN8n =
    Boolean(req.headers["x-source"] === "n8n") ||
    Boolean(req.query.fromN8n) ||
    Boolean(req.headers["user-agent"]?.toLowerCase().includes("axios"));

  // Helper for SSE responses
  const sendSSE = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  if (stream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();
  }

  // 1. If the session is already in Live Advisor Mode, DO NOT query LLM
  if (sessionId && isLiveSession(sessionId)) {
    console.log(`[query] Session ${sessionId} is in LIVE ADVISOR MODE. Forwarding to Telegram (LLM bypassed).`);
    await forwardStudentMessageToAdvisor(sessionId, question);

    const livePayload = {
      answer: null,
      inLiveChat: true,
      forwardedToAdvisor: true,
      escalated: true,
    };

    if (stream) {
      sendSSE("done", livePayload);
      return res.end();
    }
    return res.json(livePayload);
  }

  // 2. Strict Scope Guard: Filter out general knowledge, recipes, code, and math
  const scopeResult = checkScope(question);
  if (scopeResult.isOffTopic) {
    const scopePayload = {
      answer: scopeResult.defaultAnswer,
      escalated: false,
      requiresName: false,
      sources: [],
      usage: null,
    };

    if (stream) {
      sendSSE("chunk", { content: scopeResult.defaultAnswer });
      sendSSE("done", scopePayload);
      return res.end();
    }
    return res.json(scopePayload);
  }

  // 3. Billing, Double Charges, Refunds, and Complaints Priority Escalation
  if (isBillingOrComplaint(question)) {
    const complaintAnswer =
      "Lamento mucho el inconveniente con tu pago o cobro. Para revisar tu caso de forma prioritaria y segura, te voy a conectar con un asesor humano de admisiones y administración.";

    if (studentName && !isFromN8n) {
      const activeSession = sessionId || `guest_${Date.now()}`;
      notifyAdvisorTelegram({ sessionId: activeSession, studentName, studentPhone, question, answer: complaintAnswer });
    }

    const complaintPayload = {
      answer: complaintAnswer,
      escalated: true,
      requiresName: !studentName,
      sources: ["pricing-and-levels.md"],
      usage: null,
    };

    if (stream) {
      sendSSE("chunk", { content: complaintAnswer });
      sendSSE("done", complaintPayload);
      return res.end();
    }
    return res.json(complaintPayload);
  }

  // 4. Direct Human Request Priority Escalation
  if (isDirectHumanRequest(question)) {
    const humanAnswer =
      "¡Con gusto! Te voy a comunicar de inmediato con uno de nuestros asesores humanos de admisiones y ventas para brindarte atención personalizada.";

    if (studentName && !isFromN8n) {
      const activeSession = sessionId || `guest_${Date.now()}`;
      notifyAdvisorTelegram({ sessionId: activeSession, studentName, studentPhone, question, answer: humanAnswer });
    }

    const humanPayload = {
      answer: humanAnswer,
      escalated: true,
      requiresName: !studentName,
      sources: [],
      usage: null,
    };

    if (stream) {
      sendSSE("chunk", { content: humanAnswer });
      sendSSE("done", humanPayload);
      return res.end();
    }
    return res.json(humanPayload);
  }

  try {
    // 5. Retrieve chunks from official documents considering multi-turn conversation history
    const { chunks, inScope } = await retrieveRelevantChunks(question, history);

    // 6. Document Filter: If no relevant chunks found in documents
    if (!chunks || chunks.length === 0) {
      const isRelated = isAcademyRelated(question);

      if (!isRelated) {
        const offTopicRefusal =
          "Como asistente virtual de **Riwi Lingua**, mi función es responder exclusivamente preguntas sobre nuestros programas de idiomas (**Inglés, Francés y Portugués**), horarios, precios, modalidades, requisitos de certificación y admisiones en Barranquilla.\n\n¿En qué te puedo colaborar con respecto a nuestros cursos?";
        
        const noChunksPayload = {
          answer: offTopicRefusal,
          escalated: false,
          requiresName: false,
          sources: [],
          usage: null,
        };

        if (stream) {
          sendSSE("chunk", { content: offTopicRefusal });
          sendSSE("done", noChunksPayload);
          return res.end();
        }
        return res.json(noChunksPayload);
      }

      // Legitimate academy question not in docs -> Escalate to human advisor
      const notInDocsRefusal =
        "No encontré información sobre esa consulta en los documentos oficiales de **Riwi Lingua**.\n\nPara brindarte una respuesta precisa y personalizada, te puedo conectar con un asesor humano de admisiones.";

      const escalationPayload = {
        answer: notInDocsRefusal,
        escalated: true,
        requiresName: !studentName,
        sources: [],
        usage: null,
      };

      if (stream) {
        sendSSE("chunk", { content: notInDocsRefusal });
        sendSSE("done", escalationPayload);
        return res.end();
      }
      return res.json(escalationPayload);
    }

    // 7. Generate answer grounded strictly on retrieved chunks and multi-turn history
    const messages = buildMessages(question, chunks, history);

    if (stream) {
      const { text, usage } = await generateAnswerStream(messages, (tokenChunk) => {
        sendSSE("chunk", { content: tokenChunk });
      });

      const isExplicitHuman = isDirectHumanRequest(question) || isBillingOrComplaint(question);

      if (isExplicitHuman && !isFromN8n && studentName) {
        const cacheKey = `${sessionId || "std"}:${question.trim().toLowerCase()}`;

        if (!recentEscalations.has(cacheKey)) {
          recentEscalations.add(cacheKey);
          setTimeout(() => recentEscalations.delete(cacheKey), 30000);

          const activeSession = sessionId || `guest_${Date.now()}`;
          console.log(`[query] Sending interactive escalation ticket to Telegram for student: ${studentName}`);
          notifyAdvisorTelegram({ sessionId: activeSession, studentName, studentPhone, question, answer: text });
        }
      }

      sendSSE("done", {
        answer: text,
        escalated: isExplicitHuman,
        requiresName: isExplicitHuman && !studentName,
        sources: chunks.map((c) => c.source),
        usage,
      });
      return res.end();
    }

    // Standard non-streaming branch (e.g. for n8n)
    const { text, usage } = await generateAnswer(messages);
    const isExplicitHuman = isDirectHumanRequest(question) || isBillingOrComplaint(question);

    if (isExplicitHuman && !isFromN8n && studentName) {
      const cacheKey = `${sessionId || "std"}:${question.trim().toLowerCase()}`;

      if (!recentEscalations.has(cacheKey)) {
        recentEscalations.add(cacheKey);
        setTimeout(() => recentEscalations.delete(cacheKey), 30000);

        const activeSession = sessionId || `guest_${Date.now()}`;
        console.log(`[query] Sending interactive escalation ticket to Telegram for student: ${studentName}`);
        notifyAdvisorTelegram({ sessionId: activeSession, studentName, studentPhone, question, answer: text });
      }
    }

    return res.json({
      answer: text,
      escalated: isExplicitHuman,
      requiresName: isExplicitHuman && !studentName,
      sources: chunks.map((c) => c.source),
      usage,
    });

  } catch (err) {
    console.error("[query] Error handling request:", err);
    if (stream) {
      sendSSE("error", {
        error: "Something went wrong while processing your question. Please try again.",
      });
      return res.end();
    }
    return res.status(500).json({
      error: "Something went wrong while processing your question. Please try again.",
    });
  }
});


