import { Router } from "express";
import { retrieveRelevantChunks } from "../rag/retriever.js";
import { buildMessages } from "../llm/promptBuilder.js";
import { generateAnswer } from "../llm/ollamaClient.js";
import { shouldEscalate } from "../services/escalation.js";

export const queryRouter = Router();

// Deduplication window to prevent feedback loops between Web Chat and n8n
const recentEscalations = new Set();

queryRouter.post("/query", async (req, res) => {
  const { question } = req.body ?? {};

  if (!question || typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "Field 'question' is required." });
  }

  try {
    const { chunks, inScope } = await retrieveRelevantChunks(question);
    const messages = buildMessages(question, chunks);
    const { text, usage } = await generateAnswer(messages);

    const escalated = shouldEscalate(inScope, text, question);

    // If escalated, trigger n8n automation so the advisor receives the Telegram alert
    if (escalated) {
      const cacheKey = question.trim().toLowerCase();
      if (!recentEscalations.has(cacheKey)) {
        recentEscalations.add(cacheKey);
        setTimeout(() => recentEscalations.delete(cacheKey), 20000);

        const n8nWebhook =
          process.env.N8N_WEBHOOK_URL ||
          "http://localhost:5678/webhook/linguabridge-query";

        fetch(n8nWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Source": "web-chat" },
          body: JSON.stringify({ question }),
        }).catch((err) => {
          // Non-blocking: log silently if n8n is offline or busy
          console.warn("[escalation] n8n trigger notice:", err.message);
        });
      }
    }

    return res.json({
      answer: text,
      escalated,
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
