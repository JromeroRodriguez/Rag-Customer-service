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
