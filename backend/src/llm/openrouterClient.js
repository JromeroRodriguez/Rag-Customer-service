import { config } from "../config/env.js";

/**
 * Calls OpenRouter Chat Completions API with the given messages
 * and returns generated text and usage metrics.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<{text: string, usage: {inputTokens: number, outputTokens: number}}>}
 */
export async function generateAnswerOpenRouter(messages) {
  const url = `${config.openrouter.baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openrouter.apiKey}`,
      "HTTP-Referer": "https://linguabridge.riwi.io",
      "X-Title": "Riwi LinguaBridge Assistant",
    },
    body: JSON.stringify({
      model: config.openrouter.model,
      messages,
      temperature: config.llm.temperature,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `OpenRouter request failed with status ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim() || "";
  const usage = {
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
  };

  return { text, usage };
}

/**
 * Calls OpenRouter Chat API with stream enabled, delivering each user-facing token chunk
 * via onChunk while filtering out reasoning tokens.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {(token: string) => void} onChunk
 * @returns {Promise<{text: string, usage: {inputTokens: number, outputTokens: number}}>}
 */
export async function generateAnswerStreamOpenRouter(messages, onChunk) {
  const url = `${config.openrouter.baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openrouter.apiKey}`,
      "HTTP-Referer": "https://linguabridge.riwi.io",
      "X-Title": "Riwi LinguaBridge Assistant",
    },
    body: JSON.stringify({
      model: config.openrouter.model,
      messages,
      temperature: config.llm.temperature,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `OpenRouter stream request failed with status ${response.status}: ${errorText}`
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
      if (!trimmed || !trimmed.startsWith("data:")) continue;

      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") continue;

      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta;

        if (delta?.content) {
          fullText += delta.content;
          if (onChunk) {
            onChunk(delta.content);
          }
        }

        if (parsed.usage) {
          usage = {
            inputTokens: parsed.usage.prompt_tokens ?? 0,
            outputTokens: parsed.usage.completion_tokens ?? 0,
          };
        }
      } catch (err) {
        // Ignore malformed chunk or keepalive comment
      }
    }
  }

  // Handle any remaining content in the buffer
  if (buffer.trim() && buffer.trim().startsWith("data:")) {
    const payload = buffer.trim().slice(5).trim();
    if (payload !== "[DONE]") {
      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta;
        if (delta?.content) {
          fullText += delta.content;
          if (onChunk) onChunk(delta.content);
        }
      } catch {}
    }
  }

  return { text: fullText.trim(), usage };
}
