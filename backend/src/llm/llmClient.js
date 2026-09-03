import { config } from "../config/env.js";
import {
  generateAnswerGroq,
  generateAnswerStreamGroq,
} from "./groqClient.js";
import {
  generateAnswerOpenRouter,
  generateAnswerStreamOpenRouter,
} from "./openrouterClient.js";
import {
  generateAnswer as generateAnswerOllama,
  generateAnswerStream as generateAnswerStreamOllama,
} from "./ollamaClient.js";

/**
 * Generates an answer using Groq (primary) or OpenRouter,
 * falling back gracefully to local Ollama if any error occurs.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<{text: string, usage: {inputTokens: number, outputTokens: number}}>}
 */
export async function generateAnswer(messages) {
  // 1. Try Groq Cloud (Primary)
  if (config.groq.apiKey) {
    try {
      return await generateAnswerGroq(messages);
    } catch (err) {
      console.warn(
        `[llmClient] Groq failed (${err.message}). Trying OpenRouter/Ollama fallback...`
      );
    }
  }

  // 2. Try OpenRouter (Secondary)
  if (config.openrouter.apiKey) {
    try {
      return await generateAnswerOpenRouter(messages);
    } catch (err) {
      console.warn(
        `[llmClient] OpenRouter failed (${err.message}). Falling back to local Ollama...`
      );
    }
  }

  // 3. Fallback to Local Ollama
  return generateAnswerOllama(messages);
}

/**
 * Streams an answer using Groq (primary) or OpenRouter,
 * falling back to local Ollama if cloud stream initialization fails.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {(token: string) => void} onChunk
 * @returns {Promise<{text: string, usage: {inputTokens: number, outputTokens: number}}>}
 */
export async function generateAnswerStream(messages, onChunk) {
  // 1. Try Groq Cloud (Primary)
  if (config.groq.apiKey) {
    try {
      return await generateAnswerStreamGroq(messages, onChunk);
    } catch (err) {
      console.warn(
        `[llmClient] Groq stream failed (${err.message}). Trying OpenRouter/Ollama fallback...`
      );
    }
  }

  // 2. Try OpenRouter (Secondary)
  if (config.openrouter.apiKey) {
    try {
      return await generateAnswerStreamOpenRouter(messages, onChunk);
    } catch (err) {
      console.warn(
        `[llmClient] OpenRouter stream failed (${err.message}). Falling back to local Ollama...`
      );
    }
  }

  // 3. Fallback to Local Ollama
  return generateAnswerStreamOllama(messages, onChunk);
}

