import { Router } from "express";
import {
  subscribeSession,
  getSessionMessages,
  sendAdvisorMessage,
  setLiveSession,
  notifyAdvisorTelegram,
  resetSession,
} from "../services/liveChat.js";

export const liveChatRouter = Router();

// Reset session completely
liveChatRouter.post("/reset/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  resetSession(sessionId);
  res.json({ success: true, reset: true });
});

// Server-Sent Events stream
liveChatRouter.get("/stream/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required." });
  }

  subscribeSession(sessionId, res);
});

// Polling fallback endpoint
liveChatRouter.get("/messages/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required." });
  }

  const messages = getSessionMessages(sessionId);
  res.json({ messages });
});

// Broadcast / send endpoint
liveChatRouter.post("/send", (req, res) => {
  const { sessionId, text } = req.body ?? {};
  if (!text) {
    return res.status(400).json({ error: "Text is required." });
  }

  sendAdvisorMessage(sessionId, text);
  res.json({ success: true });
});

// Trigger escalation with student name and phone/WhatsApp
liveChatRouter.post("/escalate", async (req, res) => {
  const { sessionId, studentName, studentPhone, question, answer } = req.body ?? {};
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required." });
  }

  const sent = await notifyAdvisorTelegram({ sessionId, studentName, studentPhone, question, answer });
  res.json({ success: sent, studentName, studentPhone });
});

// End live advisor mode and return to LLM
liveChatRouter.post("/end/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  setLiveSession(sessionId, false);
  res.json({ success: true, liveMode: false });
});
