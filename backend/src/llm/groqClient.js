import { config } from "../config/env.js";

/**
 * Calls Groq Chat Completions API with the given messages
 * and returns generated text and usage metrics.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<{text: string, usage: {inputTokens: number, outputTokens: number}}>}
 */
export async function generateAnswerGroq(messages) {
  const url = `${config.groq.baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.groq.apiKey}`,
    },
    body: JSON.stringify({
      model: config.groq.model,
      messages,
      temperature: config.llm.temperature,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Groq request failed with status ${response.status}: ${errorText}`
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
 * Calls Groq Chat API with stream enabled, delivering each user-facing token chunk
 * via onChunk.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {(token: string) => void} onChunk
 * @returns {Promise<{text: string, usage: {inputTokens: number, outputTokens: number}}>}
 */
export async function generateAnswerStreamGroq(messages, onChunk) {
  const url = `${config.groq.baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.groq.apiKey}`,
    },
    body: JSON.stringify({
      model: config.groq.model,
      messages,
      temperature: config.llm.temperature,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Groq stream request failed with status ${response.status}: ${errorText}`
    );
  }

  const decoder = new TextDecoder();
  let fullText = "";
  let inputTokens = 0;
  let outputTokens = 0;

  for await (const chunk of response.body) {
    const text = decoder.decode(chunk, { stream: true });
    const lines = text.split("\n");

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.startsWith("data:")) continue;

      const jsonStr = line.replace(/^data:\s*/, "");
      if (jsonStr === "[DONE]") break;

      try {
        const parsed = JSON.parse(jsonStr);

        if (parsed.usage) {
          inputTokens = parsed.usage.prompt_tokens ?? inputTokens;
          outputTokens = parsed.usage.completion_tokens ?? outputTokens;
        }

        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          onChunk(delta);
        }
      } catch {
        // Skip malformed chunks safely
      }
    }
  }

  return {
    text: fullText.trim(),
    usage: { inputTokens, outputTokens },
  };
}
