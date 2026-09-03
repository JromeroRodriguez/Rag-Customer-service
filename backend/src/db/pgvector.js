import pg from "pg";
import { config } from "../config/env.js";

const { Pool } = pg;

let pool = null;

/**
 * Returns the singleton PostgreSQL connection pool.
 */
export function getPool() {
  if (!pool) {
    pool = new Pool({
      host: config.postgres.host,
      port: config.postgres.port,
      database: config.postgres.database,
      user: config.postgres.user,
      password: config.postgres.password,
      max: 10,
      idleTimeoutMillis: 30000,
    });

    pool.on("error", (err) => {
      console.error("[pgvector] Unexpected error on idle client:", err);
    });
  }
  return pool;
}

/**
 * Initializes the pgvector extension, document_chunks table,
 * and HNSW / FTS indexes.
 */
export async function initDatabase() {
  const client = await getPool().connect();
  try {
    console.log("[pgvector] Initializing database schema...");

    // 1. Enable pgvector extension
    await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // 2. Create document_chunks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS document_chunks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        metadata JSONB NOT NULL,
        embedding vector(768) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Create HNSW index for fast cosine vector similarity
    await client.query(`
      CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx 
      ON document_chunks USING hnsw (embedding vector_cosine_ops);
    `);

    // 4. Create GIN index for full-text search (keyword retrieval)
    await client.query(`
      CREATE INDEX IF NOT EXISTS document_chunks_fts_idx 
      ON document_chunks USING gin (to_tsvector('spanish', content));
    `);

    console.log("[pgvector] Database schema and indexes ready.");
  } finally {
    client.release();
  }
}

/**
 * Formats a JavaScript number array into pgvector literal format: '[0.1,0.2,...]'
 * @param {number[]} arr
 * @returns {string}
 */
function toVectorLiteral(arr) {
  return `[${arr.join(",")}]`;
}

/**
 * Idempotently inserts document chunks into PostgreSQL.
 * Clears the table first so running ingest always reflects the exact current state.
 *
 * @param {Array<{content: string, metadata: Object, embedding: number[]}>} chunks
 */
export async function insertDocumentChunks(chunks) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN;");
    await client.query("TRUNCATE TABLE document_chunks;");

    const insertQuery = `
      INSERT INTO document_chunks (content, metadata, embedding)
      VALUES ($1, $2, $3::vector);
    `;

    for (const chunk of chunks) {
      const vectorStr = toVectorLiteral(chunk.embedding);
      await client.query(insertQuery, [
        chunk.content,
        JSON.stringify(chunk.metadata),
        vectorStr,
      ]);
    }

    await client.query("COMMIT;");
    console.log(`[pgvector] Successfully stored ${chunks.length} chunks in PostgreSQL.`);
  } catch (err) {
    await client.query("ROLLBACK;");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Executes a Hybrid Search combining Semantic Vector Cosine Similarity (70%)
 * with Lexical Full-Text Keyword Search (30%).
 *
 * @param {Object} params
 * @param {string} params.queryText - The raw user question
 * @param {number[]} params.queryEmbedding - The 768-dim embedding vector
 * @param {number} [params.topK=6] - Max results to return
 * @param {number} [params.scoreThreshold=0.25] - Minimum hybrid score required
 * @returns {Promise<Array<{content: string, source: string, section: string, category: string, title: string, score: number, vectorScore: number, ftsScore: number}>>}
 */
export async function hybridSearch({
  queryText,
  queryEmbedding,
  topK = 6,
  scoreThreshold = 0.25,
}) {
  const client = await getPool().connect();
  try {
    const vectorStr = toVectorLiteral(queryEmbedding);

    // Hybrid query:
    // - 1 - (embedding <=> $1) = Cosine similarity [0 to 1]
    // - ts_rank = Lexical frequency relevance score
    // - hybrid_score = 0.70 * vector_similarity + 0.30 * min(fts_score * 2, 1.0)
    const sql = `
      WITH scored AS (
        SELECT
          id,
          content,
          metadata,
          (1 - (embedding <=> $1::vector)) AS vector_similarity,
          ts_rank(to_tsvector('spanish', content), plainto_tsquery('spanish', $2)) AS fts_score
        FROM document_chunks
      )
      SELECT
        id,
        content,
        metadata,
        vector_similarity,
        fts_score,
        (0.70 * vector_similarity + 0.30 * LEAST(COALESCE(fts_score * 2, 0), 1.0)) AS hybrid_score
      FROM scored
      WHERE (0.70 * vector_similarity + 0.30 * LEAST(COALESCE(fts_score * 2, 0), 1.0)) >= $3
         OR vector_similarity >= $3
      ORDER BY hybrid_score DESC
      LIMIT $4;
    `;

    const result = await client.query(sql, [
      vectorStr,
      queryText,
      scoreThreshold,
      topK * 2, // Fetch candidates for balanceChunks
    ]);

    return result.rows.map((row) => ({
      content: row.content,
      source: row.metadata?.source ?? "unknown",
      section: row.metadata?.section ?? "",
      category: row.metadata?.category ?? "",
      title: row.metadata?.title ?? "",
      score: parseFloat(row.hybrid_score),
      vectorScore: parseFloat(row.vector_similarity),
      ftsScore: parseFloat(row.fts_score || 0),
    }));
  } finally {
    client.release();
  }
}
