import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { config } from "../config/env.js";

let vectorStorePromise = null;

/**
 * Lazily connects to the existing Chroma collection (populated by
 * `npm run ingest`). Reused across requests instead of reconnecting
 * every time.
 */
async function getVectorStore() {
  if (!vectorStorePromise) {
    const embeddings = new OllamaEmbeddings({
      baseUrl: config.ollama.baseUrl,
      model: config.ollama.embeddingModel,
    });

    vectorStorePromise = Chroma.fromExistingCollection(embeddings, {
      collectionName: config.chroma.collectionName,
      url: config.chroma.url,
    }).catch((err) => {
      vectorStorePromise = null;
      throw err;
    });
  }
  return vectorStorePromise;
}

/**
 * Runs a similarity search and returns only the chunks that clear the
 * relevance threshold. If nothing clears it, the question is treated as
 * out of scope and the caller should escalate to a human.
 *
 * @param {string} query
 * @returns {Promise<{chunks: Array<{content: string, source: string, score: number}>, inScope: boolean}>}
 */
export async function retrieveRelevantChunks(query) {
  const store = await getVectorStore();

  const resultsWithScore = await store.similaritySearchWithScore(
    query,
    config.rag.topK
  );

  // Chroma (cosine space) returns distance, not similarity — convert so
  // higher = more relevant, matching the RELEVANCE_SCORE_THRESHOLD semantics.
  const chunks = resultsWithScore.map(([doc, distance]) => ({
    content: doc.pageContent,
    source: doc.metadata?.source ?? "unknown",
    score: 1 - distance,
  }));

  const relevantChunks = chunks.filter(
    (c) => c.score >= config.rag.relevanceScoreThreshold
  );

  return {
    chunks: relevantChunks,
    inScope: relevantChunks.length > 0,
  };
}
