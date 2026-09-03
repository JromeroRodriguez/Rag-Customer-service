import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { config } from "../config/env.js";
import { initDatabase, insertDocumentChunks } from "../db/pgvector.js";


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
 * Splits Markdown documents into atomic semantic section chunks based on headers.
 * Preserves complete lists (pricing, schedules, enrollment steps) intact without
 * character-based fragmentation, and enriches metadata with document title, section,
 * and category.
 *
 * @param {Array<{pageContent: string, metadata: {source: string}}>} rawDocs
 * @returns {Array<{pageContent: string, metadata: Object}>}
 */
export function chunkDocumentsSemantically(rawDocs) {
  const chunks = [];

  for (const doc of rawDocs) {
    const filename = doc.metadata?.source || "unknown";
    const lines = doc.pageContent.split("\n");

    let docTitle = filename;
    const sections = [];
    let currentHeader = "";
    let currentLines = [];

    for (const line of lines) {
      if (line.startsWith("# ")) {
        docTitle = line.replace("# ", "").trim();
      } else if (line.startsWith("## ")) {
        if (currentLines.length > 0 && currentLines.join("").trim().length > 0) {
          sections.push({
            header: currentHeader || "General",
            content: currentLines.join("\n").trim(),
          });
          currentLines = [];
        }
        currentHeader = line.replace("## ", "").trim();
      } else {
        currentLines.push(line);
      }
    }

    if (currentLines.length > 0 && currentLines.join("").trim().length > 0) {
      sections.push({
        header: currentHeader || "General",
        content: currentLines.join("\n").trim(),
      });
    }

    for (const s of sections) {
      let category = "general";
      const h = s.header.toLowerCase();
      if (h.includes("price") || h.includes("pricing")) category = "pricing";
      else if (h.includes("discount")) category = "discounts";
      else if (h.includes("payment")) category = "payments";
      else if (h.includes("level")) category = "levels";
      else if (
        h.includes("in-person") ||
        h.includes("live online") ||
        h.includes("self-paced") ||
        h.includes("schedule")
      ) {
        category = "schedules_modalities";
      } else if (h.includes("enroll") || h.includes("registration")) {
        category = "enrollment";
      } else if (h.includes("certif")) {
        category = "certifications";
      } else if (
        h.includes("cancellation") ||
        h.includes("transfer") ||
        h.includes("holiday")
      ) {
        category = "policies";
      }

      const headerPrefix = s.header === "General" ? "" : `## ${s.header}\n`;
      const fullText = `# ${docTitle}\n${headerPrefix}${s.content}`;

      chunks.push({
        pageContent: fullText,
        metadata: {
          source: filename,
          title: docTitle,
          section: s.header,
          category,
        },
      });
    }
  }

  return chunks;
}

/**
 * Embeds every chunk and populates the PostgreSQL document_chunks table.
 * Running this script again fully replaces the table so ingestion
 * stays idempotent.
 */
export async function ingest() {
  console.log("[ingest] Loading business documents...");
  const rawDocs = loadRawDocuments();
  console.log(`[ingest] Loaded ${rawDocs.length} documents.`);

  console.log("[ingest] Splitting documents into atomic semantic sections (Option C)...");
  const rawChunks = chunkDocumentsSemantically(rawDocs);
  console.log(`[ingest] Created ${rawChunks.length} atomic semantic chunks.`);

  console.log("[ingest] Initializing PostgreSQL schema and pgvector extension...");
  await initDatabase();

  const embeddings = new OllamaEmbeddings({
    baseUrl: config.ollama.baseUrl,
    model: config.ollama.embeddingModel,
  });

  console.log(
    `[ingest] Generating embeddings for ${rawChunks.length} chunks with "${config.ollama.embeddingModel}"...`
  );

  const textsToEmbed = rawChunks.map((c) => c.pageContent);
  const embeddedVectors = await embeddings.embedDocuments(textsToEmbed);

  const chunksToInsert = rawChunks.map((c, i) => ({
    content: c.pageContent,
    metadata: c.metadata,
    embedding: embeddedVectors[i],
  }));

  console.log("[ingest] Storing chunks and vectors in PostgreSQL document_chunks table...");
  await insertDocumentChunks(chunksToInsert);

  console.log("[ingest] Done. PostgreSQL + pgvector store is ready.");
}


import { pathToFileURL } from "node:url";

// Allow running this file directly: `npm run ingest`
const isDirectRun =
  process.argv[1] &&
  (pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url ||
    process.argv[1].endsWith("ingest.js"));

if (isDirectRun) {
  ingest().catch((err) => {
    console.error("[ingest] Failed:", err);
    process.exit(1);
  });
}

