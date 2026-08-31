import "dotenv/config";

export const config = {
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    chatModel: process.env.OLLAMA_CHAT_MODEL || "gemma3:4b",
    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",
  },
  server: {
    port: Number(process.env.PORT) || 3000,
  },
  chroma: {
    url: process.env.CHROMA_URL || "http://localhost:8000",
    collectionName: process.env.CHROMA_COLLECTION_NAME || "linguabridge_docs",
  },
  rag: {
    chunkSize: Number(process.env.CHUNK_SIZE) || 500,
    chunkOverlap: Number(process.env.CHUNK_OVERLAP) || 100,
    topK: Number(process.env.RETRIEVAL_TOP_K) || 4,
    relevanceScoreThreshold: Number(process.env.RELEVANCE_SCORE_THRESHOLD) || 0.48,
  },
  llm: {
    temperature: Number(process.env.LLM_TEMPERATURE) || 0.2,
  },
};

