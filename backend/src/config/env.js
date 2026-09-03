import "dotenv/config";

export const config = {
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    chatModel: process.env.OLLAMA_CHAT_MODEL || "gemma3:4b",


    embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text-v2-moe:latest",
  },
  server: {
    port: Number(process.env.PORT) || 3000,
  },
  postgres: {
    host: process.env.PG_HOST || "localhost",
    port: Number(process.env.PG_PORT) || 5433,
    database: process.env.PG_DATABASE || "linguabridge",
    user: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "postgres",
  },

  rag: {
    chunkSize: Number(process.env.CHUNK_SIZE) || 500,
    chunkOverlap: Number(process.env.CHUNK_OVERLAP) || 100,
    topK: Number(process.env.RETRIEVAL_TOP_K) || 6,
    relevanceScoreThreshold: Number(process.env.RELEVANCE_SCORE_THRESHOLD) || 0.25,
  },
  llm: {
    temperature: process.env.LLM_TEMPERATURE !== undefined ? Number(process.env.LLM_TEMPERATURE) : 0,
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || "",
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    baseUrl: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || "",
    model: process.env.OPENROUTER_MODEL || "liquid/lfm-2.5-2.6b:free",
    baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  },
};


