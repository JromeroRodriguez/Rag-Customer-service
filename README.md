# LinguaBridge RAG Assistant

An intelligent customer support assistant for **LinguaBridge Academy** (a fictional Colombian language academy), built for RIWI's Module 5.7 — AI Automatizador performance test.

The assistant answers questions about schedules, pricing, levels, enrollment, and certifications **using only the academy's own business documents**, and escalates to a human advisor whenever a question falls outside what those documents cover.

This version runs **100% locally and offline with $0 API costs** using **Ollama** (`gemma3:4b` + `nomic-embed-text`) and **ChromaDB**.

## Architecture

```
[Web Form] --POST /api/query--> [Express Backend]
                                       |
                          1. Retriever (Chroma + Ollama nomic-embed-text)
                          2. Prompt Builder (system prompt + few-shots + context)
                          3. Ollama Chat API (gemma3:4b generation)
                          4. Escalation check
                                       |
                                  JSON response
                                       |
                         [n8n workflow can call the same endpoint]
```

- **Entry channel**: Modern conversational interface built with **React 19**, **Tailwind CSS v4** and **Vite** (located in `frontend/`), compiled to `frontend/dist/` and served by the Express backend on `http://localhost:3000`.
- **RAG pipeline**: Business documents in `data/documents/` are chunked with overlap (`RecursiveCharacterTextSplitter`: 500 characters, 100 overlap), embedded with `nomic-embed-text` via Ollama, and stored in a local **Chroma** vector database (`hnsw:space: cosine`).
- **Generation**: Uses local **Ollama** (`gemma3:4b`) directly via `backend/src/llm/ollamaClient.js`, with exact input/output token tracking.
- **Escalation**: If retrieval finds no sufficiently relevant chunks (relevance threshold < 0.48), or the model detects sensitive complaints / out-of-scope requests, the response is flagged `escalated: true`.
- **Automation**: `n8n/workflow.json` exposes a webhook that forwards incoming questions to the backend and branches on `escalated` to route the answer (optionally notifying a human advisor channel).

## Project Structure

```
backend/
  src/
    config/env.js         # Centralized environment variable loading
    rag/ingest.js          # Loads docs, chunks (with overlap), embeds with Ollama, populates Chroma
    rag/retriever.js       # Semantic search + relevance filtering (cosine distance)
    llm/promptBuilder.js   # System prompt, brand personality, few-shot examples
    llm/ollamaClient.js    # Ollama Chat API client (gemma3:4b) with token usage metrics
    routes/query.js        # POST /api/query — main RAG endpoint
    services/escalation.js # Decides when to hand off to a human advisor
    server.js              # Express app entry point (serves API + frontend/dist)
frontend/
  src/
    components/          # React UI components (Header, ChatMessage, ChatInput, SuggestedPrompts)
    App.jsx              # Main conversational interface
    index.css            # Tailwind CSS v4 styling (@import "tailwindcss";)
    main.jsx             # React DOM root mounting
  index.html             # Vite HTML entry point
  vite.config.js         # Vite configuration with Tailwind CSS v4 & proxy
data/documents/          # The academy's business documents (3 files)
n8n/workflow.json        # Exported n8n automation workflow
```

## Prerequisites

- Node.js 18+
- Docker (to run the local Chroma vector database)
- [Ollama](https://ollama.com/) with `gemma3:4b` and `nomic-embed-text` installed:
  ```bash
  ollama pull nomic-embed-text
  ollama pull gemma3:4b
  ```

## Setup & Running

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   *(No OpenAI API key required; points to local Ollama on port 11434 by default)*

3. **Start the local vector database**
   ```bash
   docker compose up -d
   ```

4. **Ingest the business documents into Chroma**
   ```bash
   npm run ingest
   ```
   Re-run this command any time a document in `data/documents/` changes — it cleanly refreshes the collection, ensuring no stale or duplicate data.

5. **Build the React Frontend (Production)**
   ```bash
   npm run build
   ```

6. **Start the Application**
   ```bash
   npm start
   ```
   The web application is available at `http://localhost:3000`, and the API at `http://localhost:3000/api/query`.

---

### Development Mode (with Hot Module Replacement)

You can run the backend and frontend separately during active development:
- **Terminal 1 (Backend)**: `npm start` (Runs on `http://localhost:3000`)
- **Terminal 2 (Frontend Dev Server)**: `npm run dev` (Runs on `http://localhost:5173` with automatic API proxying to `:3000`)

---

## API

### `POST /api/query`

**Request**
```json
{ "question": "¿Cuánto cuesta el nivel de inglés en modalidad Live Online?" }
```

**Response**
```json
{
  "answer": "El nivel de inglés en modalidad Live Online cuesta COP 420,000.",
  "escalated": false,
  "sources": ["schedules-and-modalities.md", "pricing-and-levels.md"],
  "usage": { "inputTokens": 1157, "outputTokens": 20 }
}
```

When the question is out of scope or requires human attention (e.g. billing disputes, refund requests), `escalated` is `true` and `answer` contains the hand-off message.

## n8n Automation & Telegram Advisor Channel

1. Import `n8n/workflow.json` into your n8n instance.
2. **Web Entry Channel**: The webhook node accepts student queries at `/webhook/linguabridge-query` and forwards them to the RAG backend.
3. **Automated Classification**: Queries about schedules, pricing, and modalities are automatically answered.
4. **Human Advisor & Sales Escalation**: When a student asks about human enrollment, sales assistance, payment disputes, or out-of-scope topics, `escalated` is flagged as `true`.
5. **Instant Telegram Alert**: n8n sends an immediate alert to the human advisor's Telegram with the student's query, timestamp, and details so an advisor can follow up directly.

## Prompt Engineering & Escalation

- The system prompt (`backend/src/llm/promptBuilder.js`) defines the assistant's role ("Lingua"), brand personality, and strict restrictions (grounded exclusively in context, zero hallucination, polite escalation).
- Three few-shot examples demonstrate: in-scope responses, out-of-scope language queries, and billing complaints that require human escalation.
- Temperature is set to `0.2` by default (see `.env.example`) to maintain factual, consistent outputs.

## Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Endpoint for the local Ollama instance |
| `OLLAMA_CHAT_MODEL` | `gemma3:4b` | Ollama model used for text generation |
| `OLLAMA_EMBEDDING_MODEL` | `nomic-embed-text` | Ollama model used for document & query embeddings |
| `PORT` | `3000` | HTTP port for the Express server |
| `CHROMA_URL` | `http://localhost:8000` | ChromaDB vector database endpoint |
| `CHROMA_COLLECTION_NAME` | `linguabridge_docs` | Name of the Chroma collection |
| `CHUNK_SIZE` | `500` | Target character size for text splitter |
| `CHUNK_OVERLAP` | `100` | Character overlap between consecutive chunks |
| `RETRIEVAL_TOP_K` | `4` | Number of chunks retrieved per query |
| `RELEVANCE_SCORE_THRESHOLD` | `0.48` | Cosine similarity threshold for relevance |
| `LLM_TEMPERATURE` | `0.2` | Sampling temperature for LLM responses |


