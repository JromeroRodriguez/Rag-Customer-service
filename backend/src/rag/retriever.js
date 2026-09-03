import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { config } from "../config/env.js";
import { normalizeText } from "../services/scopeGuard.js";
import { hybridSearch } from "../db/pgvector.js";

let embeddingsInstance = null;

/**
 * Returns the singleton OllamaEmbeddings instance.
 */
function getEmbeddings() {
  if (!embeddingsInstance) {
    embeddingsInstance = new OllamaEmbeddings({
      baseUrl: config.ollama.baseUrl,
      model: config.ollama.embeddingModel,
    });
  }
  return embeddingsInstance;
}

/**
 * Constructs a contextualized search query when a follow-up question is detected.
 * Handles affirmative short answers ("si", "claro") by incorporating the assistant's previous offer.
 *
 * @param {string} query
 * @param {Array<{role: string, content: string}>} history
 * @returns {string}
 */
export function buildContextualSearchQuery(query, history = []) {
  if (!Array.isArray(history) || history.length === 0) {
    return query;
  }

  const userMessages = history.filter(
    (m) => m && m.role === "user" && typeof m.content === "string"
  );
  const assistantMessages = history.filter(
    (m) => m && m.role === "assistant" && typeof m.content === "string"
  );

  if (userMessages.length === 0) {
    return query;
  }

  const lastUserQuestion = userMessages[userMessages.length - 1].content.trim();
  const lastAssistantMsg = assistantMessages.length
    ? assistantMessages[assistantMessages.length - 1].content.trim()
    : "";

  const normalizedQuery = normalizeText(query);

  // Check if current query is already self-contained (explicitly mentions a language with sufficient length)
  const specifiesLanguage = /\b(ingles|english|frances|french|portugues|portuguese)\b/i.test(normalizedQuery);
  if (specifiesLanguage && query.length > 25) {
    return query;
  }

  // Check if user is responding affirmatively or with a short confirmation to what the assistant proposed
  const isAffirmativeOrBrief =
    /^(si|sí|claro|por favor|porfa|dale|ok|oka|yes|me interesa|cuentame|dime|de una|bueno|perfecto|adelante|quiero saber|obvio)\b/i.test(
      normalizedQuery
    ) || normalizedQuery.length <= 10;

  if (isAffirmativeOrBrief && lastAssistantMsg) {
    // Extract question or proposal from last assistant message
    const questionMatch = lastAssistantMsg.match(/¿([^?]+)\?/);
    const offerContext = questionMatch ? questionMatch[1] : lastAssistantMsg;
    return `${lastUserQuestion} ${offerContext} ${query}`.trim();
  }

  // Detect follow-up question indicators
  const isFollowUp =
    query.length < 70 ||
    /\b(ese|eso|esa|este|esta|aquel|aquella|primero|segundo|tercero|ambos|precio|costo|horario|modalidad|descuento|duracion|requisito|cuanto|como|donde|cuando|que vale|que cuesta|en esa|en este)\b/i.test(
      normalizedQuery
    );

  if (isFollowUp && lastUserQuestion && lastUserQuestion !== query) {
    return `${lastUserQuestion} - ${query}`;
  }

  return query;
}

/**
 * Balances chunk selection across source documents to prevent a single document
 * from crowding out other relevant sources in compound queries.
 */
function balanceChunks(rawResults, maxTotal, maxPerSource = 3) {
  const sourceCount = {};
  const selected = [];
  const overflow = [];

  for (const item of rawResults) {
    if (item.score < config.rag.relevanceScoreThreshold) continue;

    const source = item.source || "unknown";
    sourceCount[source] = (sourceCount[source] || 0) + 1;
    if (sourceCount[source] <= maxPerSource) {
      selected.push(item);
    } else {
      overflow.push(item);
    }

    if (selected.length >= maxTotal) break;
  }

  // If we have remaining slots, fill with overflow candidates
  while (selected.length < maxTotal && overflow.length > 0) {
    selected.push(overflow.shift());
  }

  return selected;
}

/**
 * Executes Hybrid Search on PostgreSQL (pgvector + FTS) and returns relevant chunks.
 *
 * @param {string} query
 * @param {Array<{role: string, content: string}>} [history=[]]
 * @returns {Promise<{chunks: Array<{content: string, source: string, section: string, category: string, title: string, score: number}>, inScope: boolean}>}
 */
export async function retrieveRelevantChunks(query, history = []) {
  const searchQuery = buildContextualSearchQuery(query, history);
  const embeddings = getEmbeddings();
  const queryEmbedding = await embeddings.embedQuery(searchQuery);

  const rawCandidates = await hybridSearch({
    queryText: searchQuery,
    queryEmbedding,
    topK: config.rag.topK,
    scoreThreshold: config.rag.relevanceScoreThreshold,
  });

  let relevantChunks = balanceChunks(rawCandidates, config.rag.topK);

  // Fallback to raw query if contextual query returned empty
  if (relevantChunks.length === 0 && searchQuery !== query) {
    const rawEmbedding = await embeddings.embedQuery(query);
    const rawCandidates2 = await hybridSearch({
      queryText: query,
      queryEmbedding: rawEmbedding,
      topK: config.rag.topK,
      scoreThreshold: config.rag.relevanceScoreThreshold,
    });
    relevantChunks = balanceChunks(rawCandidates2, config.rag.topK);
  }

  return {
    chunks: relevantChunks,
    inScope: relevantChunks.length > 0,
  };
}
