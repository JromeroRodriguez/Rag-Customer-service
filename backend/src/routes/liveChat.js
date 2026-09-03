import { Router } from "express";
import {
  subscribeSession,
  getSessionMessages,
  setLiveSession,
  notifyAdvisorTelegram,
  resetSession,
} from "../services/liveChat.js";
import { validateStudentName, validateStudentPhone } from "../services/validation.js";

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


// Trigger escalation with student name and phone/WhatsApp
liveChatRouter.post("/escalate", async (req, res) => {
  const { sessionId, studentName, studentPhone, question, answer } = req.body ?? {};
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required." });
  }

  const nameCheck = validateStudentName(studentName);
  if (!nameCheck.valid) {
    return res.status(400).json({ error: nameCheck.error });
  }

  const phoneCheck = validateStudentPhone(studentPhone);
  if (!phoneCheck.valid) {
    return res.status(400).json({ error: phoneCheck.error });
  }

  const sent = await notifyAdvisorTelegram({
    sessionId,
    studentName: nameCheck.sanitized,
    studentPhone: phoneCheck.sanitized,
    question,
    answer,
  });
  res.json({ success: sent, studentName: nameCheck.sanitized, studentPhone: phoneCheck.sanitized });
});


// End live advisor mode and return to LLM
liveChatRouter.post("/end/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  setLiveSession(sessionId, false);
  res.json({ success: true, liveMode: false });
});
