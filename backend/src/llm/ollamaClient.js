import { config } from "../config/env.js";

/**
 * Calls Ollama's Chat API with the given messages and returns both
 * the generated text and token usage metrics.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<{text: string, usage: {inputTokens: number, outputTokens: number}}>}
 */
export async function generateAnswer(messages) {
  const url = `${config.ollama.baseUrl}/api/chat`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.ollama.chatModel,
      messages,
      options: {
        temperature: config.llm.temperature,
        num_ctx: 4096,
      },

      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Ollama request failed with status ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();
  const text = data.message?.content?.trim() || "";
  const usage = {
    inputTokens: data.prompt_eval_count ?? 0,
    outputTokens: data.eval_count ?? 0,
  };

  return { text, usage };
}

/**
 * Calls Ollama's Chat API with stream enabled, calling onChunk for each incoming token
 * and returning the complete text and token metrics when finished.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {(token: string) => void} onChunk
 * @returns {Promise<{text: string, usage: {inputTokens: number, outputTokens: number}}>}
 */
export async function generateAnswerStream(messages, onChunk) {
  const url = `${config.ollama.baseUrl}/api/chat`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.ollama.chatModel,
      messages,
      options: {
        temperature: config.llm.temperature,
        num_ctx: 4096,
      },

      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Ollama stream request failed with status ${response.status}: ${errorText}`
    );
  }

  const decoder = new TextDecoder();
  let fullText = "";
  let usage = { inputTokens: 0, outputTokens: 0 };
  let buffer = "";

  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.message?.content) {
          const content = parsed.message.content;
          fullText += content;
          if (onChunk) {
            onChunk(content);
          }
        }
        if (parsed.done) {
          usage = {
            inputTokens: parsed.prompt_eval_count ?? 0,
            outputTokens: parsed.eval_count ?? 0,
          };
        }
      } catch (err) {
        console.warn("[ollamaClient] Error parsing stream chunk JSON:", err.message);
      }
    }
  }

  if (buffer.trim()) {
    try {
      const parsed = JSON.parse(buffer.trim());
      if (parsed.message?.content) {
        fullText += parsed.message.content;
        if (onChunk) onChunk(parsed.message.content);
      }
      if (parsed.done) {
        usage = {
          inputTokens: parsed.prompt_eval_count ?? 0,
          outputTokens: parsed.eval_count ?? 0,
        };
      }
    } catch {}
  }

  return { text: fullText.trim(), usage };
}

