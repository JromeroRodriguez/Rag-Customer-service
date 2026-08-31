import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChromaClient } from "chromadb";
import { config } from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCUMENTS_DIR = path.join(__dirname, "..", "..", "..", "data", "documents");

/**
 * Reads every .md/.txt file in data/documents and returns
 * { pageContent, metadata } pairs LangChain can work with.
 */
function loadRawDocuments() {
  const files = fs
    .readdirSync(DOCUMENTS_DIR)
    .filter((file) => file.endsWith(".md") || file.endsWith(".txt"));

  if (files.length < 3) {
    throw new Error(
      `Expected at least 3 business documents in ${DOCUMENTS_DIR}, found ${files.length}.`
    );
  }

  return files.map((file) => {
    const fullPath = path.join(DOCUMENTS_DIR, file);
    return {
      pageContent: fs.readFileSync(fullPath, "utf-8"),
      metadata: { source: file },
    };
  });
}

/**
 * Splits documents into overlapping chunks so the retriever can return
 * focused, relevant passages instead of whole documents.
 */
async function chunkDocuments(rawDocs) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: config.rag.chunkSize,
    chunkOverlap: config.rag.chunkOverlap,
    separators: ["\n## ", "\n### ", "\n\n", "\n", " ", ""],
  });

  return splitter.createDocuments(
    rawDocs.map((d) => d.pageContent),
    rawDocs.map((d) => d.metadata)
  );
}

/**
 * Embeds every chunk and (re)populates the Chroma collection.
 * Running this script again fully replaces the collection so ingestion
 * stays idempotent.
 */
export async function ingest() {
  console.log("[ingest] Loading business documents...");
  const rawDocs = loadRawDocuments();
  console.log(`[ingest] Loaded ${rawDocs.length} documents.`);

  console.log("[ingest] Splitting into overlapping chunks...");
  const chunks = await chunkDocuments(rawDocs);
  console.log(
    `[ingest] Created ${chunks.length} chunks (size=${config.rag.chunkSize}, overlap=${config.rag.chunkOverlap}).`
  );

  const embeddings = new OllamaEmbeddings({
    baseUrl: config.ollama.baseUrl,
    model: config.ollama.embeddingModel,
  });

  console.log(
    `[ingest] Embedding and storing chunks in Chroma collection "${config.chroma.collectionName}"...`
  );

  // Drop collection first if it exists to ensure clean cosine distance space
  try {
    const client = new ChromaClient({ path: config.chroma.url });
    await client.deleteCollection({ name: config.chroma.collectionName });
  } catch (_err) {
    // Collection didn't exist yet, proceed
  }

  // Chroma.fromDocuments creates the collection with cosine distance metadata
  await Chroma.fromDocuments(chunks, embeddings, {
    collectionName: config.chroma.collectionName,
    url: config.chroma.url,
    collectionMetadata: { "hnsw:space": "cosine" },
  });

  console.log("[ingest] Done. Vector store is ready.");
}

// Allow running this file directly: `npm run ingest`
if (import.meta.url === `file://${process.argv[1]}`) {
  ingest().catch((err) => {
    console.error("[ingest] Failed:", err);
    process.exit(1);
  });
}
