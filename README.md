# Riwi LinguaBridge — Asistente RAG de Alta Velocidad y Chat Bidireccional

Asistente virtual inteligente de atención al cliente para **Riwi LinguaBridge** (academia de idiomas en Barranquilla), diseñado para orientar a estudiantes sobre cursos de **Inglés, Francés y Portugués**, modalidades (**Presencial**, **Live Online** y **Self-Paced**), precios, horarios, certificaciones y matrículas.

Cuenta con un motor de inferencia de ultra-alta velocidad impulsado por **Groq LPU** (`openai/gpt-oss-120b` de **120 mil millones de parámetros**), con **arquitectura de resiliencia en cascada de 3 niveles** (Groq $\rightarrow$ OpenRouter $\rightarrow$ Ollama local `gemma3:4b` con ventana de 4K tokens), almacenamiento vectorial sobre **PostgreSQL 16 + `pgvector`** con **Búsqueda Híbrida (Vectorial + Full-Text Search)** e inspección visual en **DBeaver**, y un canal de **Chat Bidireccional en Vivo con Telegram** para atención humana en tiempo real.


---

## Características Principales

- **Motor LLM de 120B Parámetros en Groq LPU (Ultra-Alta Velocidad)**:
  - Inferencia sobre hardware especializado Groq LPU con el modelo **`openai/gpt-oss-120b`**, logrando respuestas completas con tablas y cálculos en **menos de 3 segundos**.
  - **Mecanismo de Resiliencia en Cascada (3 Niveles)**:
    1. **Nivel 1 (Primario):** Groq LPU (`openai/gpt-oss-120b`).
    2. **Nivel 2 (Secundario):** OpenRouter Cloud (`liquid/lfm-2.5-2.6b:free`).
    3. **Nivel 3 (Offline Fail-Safe):** Ollama Local (`gemma3:4b` con `num_ctx: 4096`), garantizando 100% de disponibilidad.

- **Base de Datos Vectorial PostgreSQL 16 (`pgvector`) + Visualización en DBeaver**:
  - Almacenamiento en tabla única `document_chunks` con índice **HNSW** para distancia de coseno y **GIN** para texto completo.
  - Conexión y gestión visual directa desde clientes como **DBeaver** o TablePlus (`localhost:5433`).

- **Búsqueda Híbrida (Hybrid Search: 70% Semántica + 30% Léxica)**:
  - Combina la comprensión contextual del vector embedding con la precisión milimétrica de palabras clave exactas (`tsvector` / `tsquery`).
- **Temperatura Cero ($T = 0$) para Máxima Factualidad**:
  - Inferencia determinista que previene alucinaciones, garantizando que precios, fechas y políticas coincidan con los documentos oficiales.
- **Embeddings de Última Generación (`nomic-embed-text-v2-moe`)**:
  - Arquitectura *Mixture of Experts* (MoE) en 768 dimensiones con alta riqueza semántica multilingüe para español, inglés, francés y portugués.
- **Chunking Semántico Atómico por Secciones (Heading-Aware)**:
  - Particionado guiado por encabezados Markdown (`#` y `##`) que preserva la integridad de listas atómicas (precios por modalidad, pasos de matrícula del 1 al 5, horarios y sedes) sin cortes arbitrarios por longitud de caracteres.
- **Streaming en Tiempo Real (Token-by-Token SSE)**:
  - Transmisión palabra por palabra mediante Server-Sent Events (`text/event-stream`), entregando el primer token en pantalla en poco más de 1 segundo.
- **Chat Bidireccional Web - Telegram con Asesores Humanos**:
  - Botón explícito **`[ Hablar con Asesor ]`** en la cabecera del chat para desacoplar el escalamiento de las consultas de RAG.
  - Captura conversacional en dos pasos de **Nombre completo** y **WhatsApp (estándar de 10 dígitos de Colombia)**.
  - El asesor recibe un ticket interactivo en Telegram y puede responder directamente con **Responder (Reply)**.
  - La respuesta humana entra en vivo en la pantalla del usuario en menos de 1 segundo.
- **Nuevo Diseño Corporativo RIWI LinguaBridge**:
  - Construido con **React 19**, **Tailwind CSS v4**, **Vite** e íconos **Lucide**.

---

## Arquitectura del Sistema


```
 [Navegador del Estudiante]
           │
           ├── (POST /api/query) ──────────────► [Backend Express]
           │                                             │
           │                     1. Contextualizador Multi-Turno
           │                     2. Búsqueda Híbrida (PostgreSQL pgvector + FTS)
           │                     3. Prompt Grounding Estricto (T = 0)
           │                     4. Inferencia en Cascada Resiliente:
           │                        ↳ Primario: Groq LPU (openai/gpt-oss-120b - 120B)
           │                        ↳ Secundario: OpenRouter (liquid/lfm-2.5-2.6b:free)
           │                        ↳ Fallback Local: Ollama (gemma3:4b con 4K context)
           │                     5. Evaluador de Escalamiento Humano
           │                                             │
           ◄── (SSE /api/live-chat/stream/:sessionId) ──┤
           │                                             ▼
           │                                  [Telegram Bot API]
           │                                             │
           ◄─── Respuesta en Vivo del Asesor ────────────┘
```

---

## Estructura del Proyecto


```
Rag-Customer-service/
├── backend/
│   └── src/
│       ├── config/env.js          # Variables de entorno y umbrales calibrados
│       ├── db/
│       │   └── pgvector.js        # Pool PostgreSQL, esquema, HNSW/GIN y Búsqueda Híbrida
│       ├── llm/
│       │   ├── groqClient.js      # Cliente Groq LPU (chat completions & SSE stream con 120B)
│       │   ├── llmClient.js       # Orquestador híbrido en cascada Groq + OpenRouter + Ollama
│       │   ├── openrouterClient.js# Cliente OpenRouter (chat completions & SSE stream)
│       │   ├── ollamaClient.js    # Cliente Ollama local (gemma3:4b con num_ctx: 4096)
│       │   └── promptBuilder.js   # Prompt del sistema, restricciones y ejemplos few-shot
│       ├── rag/
│       │   ├── ingest.js          # Chunking semántico atómico e indexación en PostgreSQL
│       │   └── retriever.js       # Búsqueda híbrida (vector + texto) balanceada multi-documento
│       ├── routes/
│       │   ├── liveChat.js        # Endpoints de chat en vivo con Telegram
│       │   └── query.js           # Endpoint principal POST /api/query
│       ├── services/
│       │   ├── escalation.js      # Reglas de escalamiento a asesor humano
│       │   ├── liveChat.js        # Polling y reenvío bidireccional Web-Telegram
│       │   ├── scopeGuard.js      # Filtro de temas fuera de alcance
│       │   └── validation.js      # Validación de nombres y WhatsApp (estándar Colombia 10 dígitos)
│       └── server.js              # Servidor Express y arranque de servicios
├── data/documents/                # Documentos oficiales de la academia (Markdown)
│   ├── enrollment-and-certifications.md
│   ├── pricing-and-levels.md
│   └── schedules-and-modalities.md
├── frontend/
│   ├── src/
│   │   ├── components/            # Navbar, Hero, ChatDrawer, ChatMessage, PricingSection, etc.
│   │   ├── lib/
│   │   │   ├── riwi-data.js       # Constantes y formateo oficial
│   │   │   └── validation.js      # Validaciones en cliente
│   │   ├── App.jsx                # Estado global, lector de SSE y drawer de chat
│   │   ├── index.css              # Tokens de diseño Tailwind v4 y tipografías
│   │   └── main.jsx               # Montaje React
│   ├── index.html                 # Fuentes Google Fonts (Sora & Manrope)
│   └── vite.config.js             # Configuración Vite
├── docker-compose.yml             # Contenedor de PostgreSQL 16 con pgvector (puerto 5433)
├── package.json                   # Scripts y dependencias del proyecto
├── .env.example                   # Plantilla de variables de entorno
└── .env                           # Configuración activa del entorno
```

---

## Requisitos Previos

- **Node.js**: v18 o superior.
- **Docker**: Para ejecutar la base de datos vectorial PostgreSQL 16 con `pgvector`.
- **Ollama**: Con los modelos descargados para embeddings y respaldo local:
  ```bash
  ollama pull nomic-embed-text-v2-moe:latest
  ollama pull gemma3:4b
  ```
- **API Key de Groq**: Para inferencia en la nube de ultra-alta velocidad en hardware LPU (`openai/gpt-oss-120b` de 120B).
- **API Key de OpenRouter (Opcional)**: Como segundo nivel de respaldo en la nube.
- **Bot de Telegram (Opcional pero recomendado)**: Para el canal de chat con asesores en vivo.

---
## Instalación y Puesta en Marcha

### 1. Clonar e Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno
Copia la plantilla `.env.example` a `.env` y define tus credenciales:
```bash
cp .env.example .env
```

Contenido representativo de `.env`:
```env
# Servidor
PORT=3000

# Groq (Inferencia Primaria Ultra-rápida LPU - Modelo 120B)
GROQ_API_KEY=gsk_...
GROQ_MODEL=openai/gpt-oss-120b
GROQ_BASE_URL=https://api.groq.com/openai/v1

# OpenRouter (Inferencia Cloud Secundaria)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=liquid/lfm-2.5-2.6b:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1


# Ollama Local (Fallback)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=gemma3:4b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text-v2-moe:latest

# PostgreSQL + pgvector (Base de Datos Vectorial)
PG_HOST=localhost
PG_PORT=5433
PG_DATABASE=linguabridge
PG_USER=postgres
PG_PASSWORD=postgres

# Parámetros RAG
CHUNK_SIZE=500
CHUNK_OVERLAP=100
RETRIEVAL_TOP_K=6
RELEVANCE_SCORE_THRESHOLD=0.25
LLM_TEMPERATURE=0

# Chat en Vivo con Telegram
TELEGRAM_BOT_TOKEN=tu_token_aqui
TELEGRAM_ADVISOR_CHAT_ID=tu_chat_id_aqui
```

### 3. Iniciar PostgreSQL + pgvector con Docker
Inicia el contenedor en segundo plano:
```bash
docker compose up -d
```
> El contenedor `linguabridge-pgvector` estará disponible en el puerto `5433`.

### 4. Indexar Documentos
Crea la extensión `vector`, la tabla `document_chunks`, los índices HNSW y GIN, y vectoriza los 15 chunks semánticos atómicos:
```bash
npm run ingest
```

### 5. Compilar el Frontend
```bash
npm run build
```

### 6. Iniciar el Servidor
```bash
npm start
```

La aplicación web estará disponible en **`http://localhost:3000`**.

---

## Inspección Visual de la Base de Datos con DBeaver

Puedes ver los documentos, textos, metadatos y vectores directamente en **DBeaver**:

1. Abre **DBeaver** y crea una **Nueva Conexión** $\rightarrow$ selecciona **PostgreSQL**.
2. Parámetros de conexión:
   - **Host:** `localhost` (o `127.0.0.1`)
   - **Port:** `5433` (puerto **5433**, no el estándar 5432)
   - **Database:** `linguabridge`
   - **Username:** `postgres`
   - **Password:** `postgres`
3. Haz clic en **Test Connection ...** y luego en **Finish**.
4. En el panel izquierdo navega a:  
   `linguabridge` $\rightarrow$ `Databases` $\rightarrow$ `linguabridge` $\rightarrow$ `Schemas` $\rightarrow$ `public` $\rightarrow$ `Tables` $\rightarrow$ **`document_chunks`**.
5. Haz doble clic sobre **`document_chunks`** y selecciona la pestaña **Data** para explorar los 15 registros.

---

## Flujo del Chat Bidireccional (Web - Telegram)

1. **Solicitud de Asesor:**
   El estudiante puede hacer clic en el botón **`[ Hablar con Asesor ]`** en la cabecera del chat, o indicar una necesidad comercial o reclamo.
2. **Captura Conversacional con Validación Estricta:**
   - **Nombre completo:** Mínimo 2 palabras, solo letras (sin números ni caracteres especiales).
   - **WhatsApp:** Estándar de Colombia de **10 dígitos** numéricos (iniciando en 3, ej. `300 123 4567`).
3. **Alerta Instantánea en Telegram:**
   El asesor humano recibe una tarjeta interactiva en Telegram con el Ticket (`#std_xxxx`), Nombre, WhatsApp formateado a `+57`, Pregunta del Estudiante y Resumen del Asistente.
4. **Respuesta en Tiempo Real:**
   El asesor presiona **Responder (Reply)** en Telegram sobre el ticket. Su mensaje aparece de inmediato en la pantalla del estudiante con la insignia verde de `Asesor Humano - En Vivo`.
5. **Silenciado de IA:**
   Mientras el asesor y el estudiante conversan, el LLM no interfiere.
6. **Comando de Cierre (`/cerrar`):**
   El asesor escribe `/cerrar` o `/fin` en Telegram para dar por concluida la atención y devolver al estudiante al Asistente Lingua (IA).



