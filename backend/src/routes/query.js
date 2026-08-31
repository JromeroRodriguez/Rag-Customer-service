import { Router } from "express";
import { retrieveRelevantChunks } from "../rag/retriever.js";
import { buildMessages } from "../llm/promptBuilder.js";
import { generateAnswer } from "../llm/ollamaClient.js";
import { shouldEscalate } from "../services/escalation.js";
import { notifyAdvisorTelegram, isLiveSession, forwardStudentMessageToAdvisor } from "../services/liveChat.js";

export const queryRouter = Router();

// Deduplication window to prevent feedback loops between Web Chat and n8n
const recentEscalations = new Set();

queryRouter.post("/query", async (req, res) => {
  const { question, sessionId, studentName } = req.body ?? {};

  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "Field 'question' is required." });
  }

  // If the session is already in Live Advisor Mode, DO NOT query LLM
  if (sessionId && isLiveSession(sessionId)) {
    console.log(`[query] Session ${sessionId} is in LIVE ADVISOR MODE. Forwarding to Telegram (LLM bypassed).`);
    await forwardStudentMessageToAdvisor(sessionId, question);
    return res.json({
      answer: null,
      inLiveChat: true,
      forwardedToAdvisor: true,
      escalated: true,
    });
  }

  try {
    const isFromN8n =
      Boolean(req.headers["x-source"] === "n8n") ||
      Boolean(req.query.fromN8n) ||
      Boolean(req.headers["user-agent"]?.toLowerCase().includes("axios"));

    const { chunks, inScope } = await retrieveRelevantChunks(question);
    const messages = buildMessages(question, chunks);
    const { text, usage } = await generateAnswer(messages);

    const escalated = shouldEscalate(inScope, text, question);

    // If escalated and student name is already known, notify advisor immediately
    if (escalated && !isFromN8n && studentName) {
      const cacheKey = `${sessionId || "std"}:${question.trim().toLowerCase()}`;

      if (!recentEscalations.has(cacheKey)) {
        recentEscalations.add(cacheKey);
        setTimeout(() => recentEscalations.delete(cacheKey), 30000);

        const activeSession = sessionId || `guest_${Date.now()}`;
        console.log(`[query] Sending interactive escalation ticket to Telegram for student: ${studentName}`);
        notifyAdvisorTelegram({ sessionId: activeSession, studentName, question, answer: text });
      }
    }

    return res.json({
      answer: text,
      escalated,
      requiresName: escalated && !studentName,
      sources: chunks.map((c) => c.source),
      usage,
    });
  } catch (err) {
    console.error("[query] Error handling request:", err);
    return res.status(500).json({
      error: "Something went wrong while processing your question. Please try again.",
    });
  }
});
