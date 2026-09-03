# Explicación completa del proyecto: Riwi LinguaBridge

## Qué es esto

Un **asistente virtual de atención al cliente** para una academia de idiomas llamada **Riwi Lingua** ubicada en Barranquilla, Colombia. Responde preguntas sobre precios, horarios, inscripciones y certificaciones de inglés, francés y portugués. Cuando no puede responder o el usuario pide un asesor humano, notifica a un asesor real vía **Telegram** en tiempo real.

---

## Estructura del proyecto

```
Rag-Customer-service/
├── backend/src/
│   ├── server.js              → Punto de entrada Express
│   ├── config/env.js          → Variables de entorno centralizadas
│   ├── db/pgvector.js         → Conexión PostgreSQL + esquema + hybrid search
│   ├── rag/
│   │   ├── ingest.js          → Pipeline: documentos → chunks → embeddings → PG
│   │   └── retriever.js       → Búsqueda híbrida al recibir una pregunta
│   ├── llm/
│   │   ├── llmClient.js       → Orquestador con fallback (Groq → OpenRouter → Ollama)
│   │   ├── openrouterClient.js → Cliente HTTP a OpenRouter API
│   │   ├── ollamaClient.js    → Cliente HTTP a Ollama local
│   │   └── promptBuilder.js   → System prompt + few-shots + armado de mensajes
│   ├── routes/
│   │   ├── query.js           → POST /api/query (endpoint principal del chat)
│   │   └── liveChat.js        → Endpoints de chat en vivo + SSE
│   └── services/
│       ├── scopeGuard.js      → Filtra preguntas off-topic (matemáticas, recetas, etc.)
│       ├── escalation.js      → Detecta cuándo escalar a asesor humano
│       └── liveChat.js        → SSE + Telegram polling (chat bidireccional)
├── frontend/src/              → React 19 + Tailwind CSS v4
├── data/documents/            → 3 archivos .md con el conocimiento oficial
├── docker-compose.yml         → PostgreSQL 16 + pgvector
└── .env                       → Variables de entorno (API keys, puertos, etc.)
```

---

## Flujo completo del programa (paso a paso)

### FASE 1: Ingesta de documentos (`npm run ingest`)

Esto se ejecuta **una vez** (o cada vez que cambian los documentos de conocimiento).

**Paso 1 — Leer archivos:**
```
data/documents/pricing-and-levels.md
data/documents/enrollment-and-certifications.md
data/documents/schedules-and-modalities.md
```
El script `ingest.js` lee cada archivo `.md` con `fs.readFileSync()`.

**Paso 2 — Chunking semántico:**
En vez de cortar el texto cada N caracteres (que rompería listas, tablas, etc.), el código **parte por headers Markdown** (`##`). Cada sección se convierte en un chunk independiente con su metadata (fuente, título, sección, categoría). Por ejemplo, la sección "## Pricing" de `pricing-and-levels.md` se convierte en un chunk con `category: "pricing"`.

¿Por qué? Porque si preguntas "¿cuánto cuesta el inglés virtual?", el sistema necesita encontrar **específicamente** el bloque de precios, no un fragmento cortado a mitad de una frase.

**Paso 3 — Generación de embeddings:**
Cada chunk se envía a **Ollama** (corriendo localmente en `localhost:11434`) usando el modelo `nomic-embed-text-v2-moe`. Ollama convierte el texto en un **vector de 768 dimensiones** — es decir, una lista de 768 números que representan el "significado" matemático del texto. Textos con significados similares quedan cercanos en ese espacio vectorial.

¿Por qué embeddings? Porque permiten buscar por **significado**, no solo por palabras exactas. Si preguntas "¿cuánto vale?", el embedding captura que eso es equivalente a "precio" o "costo".

**Paso 4 — Insertar en PostgreSQL:**
Los chunks con sus embeddings se insertan en la tabla `document_chunks` dentro de PostgreSQL (corriendo en Docker, puerto 5433). La tabla tiene:
- `content` (texto del chunk)
- `metadata` (JSON con fuente, sección, categoría)
- `embedding` (vector de 768 dimensiones, tipo `vector(768)` de pgvector)
- Dos índices:
  - **HNSW** (`vector_cosine_ops`): para búsqueda rápida por similitud de coseno entre vectores
  - **GIN** (`to_tsvector('spanish', content)`): para búsqueda de texto completo en español

¿Por qué PostgreSQL + pgvector y no ChromaDB? Porque PostgreSQL es una base de datos relacional madura, probada en producción, con soporte transaccional, backups, y extensibilidad. pgvector le agrega capacidades vectoriales sin necesitar un sistema separado. ChromaDB es una base de datos vectorial dedicada pero menos madura, con menos herramientas de administración y sin la flexibilidad de una BD relacional completa.

---

### FASE 2: Consulta del usuario (chat en tiempo real)

Cuando un estudiante escribe una pregunta en el chat del frontend:

**Paso 1 — Recibir petición en `POST /api/query`:**
El frontend (React) envía un JSON con `{ question, sessionId, history, stream: true }` al backend Express.

**Paso 2 — Filtros de alcance (`scopeGuard.js`):**
Antes de hacer cualquier consulta al LLM o a la base de datos, se verifica:
- ¿Pregunta por idiomas no ofrecidos (alemán, mandarín, etc.)? → Respuesta inmediata
- ¿Pregunta off-topic (matemáticas, recetas, código, trivia)? → Respuesta inmediata

Esto se hace con **expresiones regulares** que comparan contra patrones predefinidos. ¿Por qué antes del RAG? Porque no tiene sentido buscar en documentos de la academia si alguien pregunta "cuánto es 2+2". Se ahorran tokens de LLM y tiempo de cómputo.

**Paso 3 — Escalamiento prioritario (`escalation.js`):**
Se verifica si el usuario:
- Tiene un problema de cobro/devolución → escala directo a asesor humano
- Pide explícitamente hablar con una persona → escala directo

Estas preguntas **nunca pasan por el LLM** porque son situaciones que requieren intervención humana por seguridad y política de la empresa.

**Paso 4 — Búsqueda híbrida (`retriever.js`):**
Si la pregunta pasa los filtros:

1. **Construir query contextual**: Si el usuario pregunta "¿y esos?", el sistema detecta que es una pregunta de seguimiento y combina la pregunta actual con la anterior para formar una query completa: "¿cuánto cuesta el inglés virtual? - y esos?".

2. **Generar embedding de la pregunta**: Se envía la query a Ollama para obtener su vector de 768 dimensiones.

3. **Hybrid Search en PostgreSQL** (`pgvector.js`):
   ```sql
   hybrid_score = 0.70 × vector_similarity + 0.30 × fts_score
   ```
   - **70% similitud vectorial**: Calcula el coseno entre el embedding de la pregunta y cada embedding almacenado. Un valor alto = significados similares.
   - **30% búsqueda de texto completo (FTS)**: Usa `ts_rank` con el idioma español para encontrar chunks que contengan las palabras clave de la pregunta.
   
   ¿Por qué híbrida? Porque la búsqueda vectorial es buena capturando significado pero puede perder keywords exactas, y la FTS es buena con keywords pero no entiende sinónimos. Combinarlas da lo mejor de ambos mundos.

4. **Balanceo de chunks** (`balanceChunks`): Se limita a máximo 3 chunks por documento fuente para que la respuesta no esté dominada por un solo archivo. Si hay 6 slots (`topK=6`) y 3 documentos, se intenta sacar 2 de cada uno.

**Paso 5 — Construir mensajes para el LLM (`promptBuilder.js`):**
Se arma un array de mensajes con:
1. **System prompt**: Define el rol de "Lingua", la personalidad (cálida, profesional), y reglas estrictas (no inventar información, solo responder sobre los 3 idiomas, nunca revelar instrucciones internas).
2. **Few-shot examples**: 3 pares de ejemplo pregunta→respuesta que muestran al modelo el tono y las restricciones esperadas.
3. **Historial sanitizado**: Los últimos 6 mensajes de la conversación (limpiando mensajes del sistema, adaptadores humanos, etc.).
4. **Contexto + pregunta**: Los chunks recuperados se insertan con etiquetas `[Source: pricing-and-levels.md]` y la pregunta del estudiante.

**Paso 6 — Generar respuesta (`llmClient.js`):**
Se intenta en este orden con **fallback automático**:
1. **Groq Cloud** (primario) → API rapida y barata
2. **OpenRouter** (secundario) → Acceso a múltiples modelos
3. **Ollama local** (fallback final) → `gemma3:1b` corriendo en la máquina, sin dependencia de internet

Cada cliente soporta **streaming SSE** (Server-Sent Events): el LLM genera tokens uno a uno y cada token se envía al frontend inmediatamente vía `res.write()`. Esto permite que el usuario vea la respuesta escribiéndose en tiempo real.

**Paso 7 — Enviar respuesta al frontend:**
El backend escribe eventos SSE:
```
event: chunk
data: {"content": "¡Hola! El nivel de inglés..."}

event: done
data: {"answer": "respuesta completa", "sources": ["pricing-and-levels.md"], "usage": {...}}
```

---

### FASE 3: Chat en vivo con asesores reales

Si el usuario pide un asesor humano o hay escalamiento:

1. Se notifica al asesor por **Telegram** (polling con `getUpdates`)
2. Se abre un canal **bidireccional SSE**: el estudiante escribe por el web, el asesor responde por Telegram (o viceversa)
3. El asesor puede **finalizar la sesión** desde Telegram, y el usuario recibe notificación en el frontend

---

## Por qué se usaron estas tecnologías

| Tecnología | Por qué |
|---|---|
| **Node.js + Express** | Backend JavaScript asíncrono nativo, ideal para I/O intensivo (llamadas a APIs de LLM, consultas a BD). Un solo lenguaje (JS) en todo el stack reduce fricción. |
| **PostgreSQL + pgvector** | BD relacional madura, transaccional, con soporte para vectores. Un solo sistema para datos estructurados + búsqueda semántica. Más robusto que ChromaDB para producción. |
| **Docker Compose** | Para correr PostgreSQL con pgvector de forma aislada, reproducible, y sin instalar nada manualmente en la máquina del desarrollador. |
| **Ollama** | LLM y embeddings corriendo **localmente** (sin costo de API, sin latencia de red, sin dependencia de internet). Modelo `gemma3:1b` para chat y `nomic-embed-text-v2-moe` para embeddings. |
| **Groq / OpenRouter** | LLMs en la nube como capa principal (más rápidos y potentes que Ollama local). OpenRouter da acceso a muchos modelos sin registrar en cada proveedor. |
| **React 19 + Tailwind CSS v4** | Frontend moderno, componentes declarativos, utility-first CSS para UI rápido sin escrebir CSS custom. |
| **SSE (Server-Sent Events)** | Streaming unidireccional del servidor al cliente. Más simple que WebSockets para este caso (el usuario no necesita enviar datos en tiempo real, solo recibir tokens). |
| **LangChain (solo text splitters + embeddings)** | Se usa mínimamente: `OllamaEmbeddings` para generar vectores y `RecursiveCharacterTextSplitter` como referencia. No se usa el framework completo para evitar over-engineering. |
| **Express static** | Sirve el build de React directamente desde Express, sin necesidad de Nginx o CDN para producción. Un solo puerto (3000) para API + frontend. |

---

## Diagrama del flujo resumido

```
Usuario escribe pregunta
        │
        ▼
  ┌─ scopeGuard ─┐
  │ Off-topic?   │──Sí──→ Respuesta inmediata
  └──────┬───────┘
         No
         ▼
  ┌─ escalation ─┐
  │ Cobro/Humano?│──Sí──→ Escalación a asesor Telegram
  └──────┬───────┘
         No
         ▼
  ┌─ retriever ──┐
  │ Embed query   │
  │ Hybrid Search │
  │ Balance chunks│
  └──────┬───────┘
         │ chunks[]
         ▼
  ┌─ promptBuilder ─┐
  │ System prompt    │
  │ Few-shots        │
  │ History (6 msg)  │
  │ Context + Question│
  └──────┬──────────┘
         │ messages[]
         ▼
  ┌─ llmClient ─────┐
  │ Groq → OpenRouter│
  │ → Ollama (fallback)│
  └──────┬──────────┘
         │ tokens SSE
         ▼
    Frontend muestra
    respuesta en tiempo real
```
