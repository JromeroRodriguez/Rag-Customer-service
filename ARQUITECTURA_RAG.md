# Arquitectura y Funcionamiento del Sistema RAG — Riwi LinguaBridge

Documento técnico explicativo sobre el funcionamiento del pipeline **RAG (Retrieval-Augmented Generation)**, la justificación de la selección tecnológica, la estructura del proyecto y el flujo de ejecución paso a paso a nivel de desarrollador junior.

---

## 1. ¿Qué es RAG y qué problema resuelve?

Un Modelo de Lenguaje Grande (LLM) tradicional como GPT o Llama posee dos limitaciones críticas para entornos corporativos:
1. **Carencia de conocimiento privado y local:** El modelo no conoce los precios, horarios, sedes ni reglamentos específicos de la academia **Riwi LinguaBridge en Barranquilla**.
2. **Riesgo de alucinación:** Si se le pregunta un dato que ignora, intentará generar una respuesta plausible pero falsa (inventando tarifas o fechas).

**RAG (*Retrieval-Augmented Generation* o Generación Aumentada por Recuperación)** soluciona esto mediante el principio del **"Examen a Libro Abierto"**:
* En lugar de obligar al modelo a responder de memoria, el sistema busca en la base de datos documental los fragmentos exactos donde se encuentra la verdad terreno (*ground truth*).
* Inyecta esos fragmentos en el prompt del sistema junto con la consulta del estudiante.
* El LLM actúa exclusivamente como motor de lectura, razonamiento, síntesis y redacción en lenguaje natural, garantizando **cero alucinaciones**.

---

## 2. Las 3 Fases del Pipeline RAG

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ FASE 1: INGESTA E INDEXACIÓN (Offline / Preparación)                        │
│                                                                             │
│ Documentos Markdown ──► Chunking Semántico ──► Embeddings MoE ──► PostgreSQL│
│ (data/documents/*.md)   (Heading-Aware)        (768 dims)         (pgvector)│
└─────────────────────────────────────────────────────────────────────────────┘
                                                                     │
┌─────────────────────────────────────────────────────────────────┐  │
│ FASE 2: RECUPERACIÓN HÍBRIDA (En tiempo de ejecución)           │  │
│                                                                 │  │
│ Pregunta del Usuario ──► Contextualizador ──► Vectorización ────┼──┘
│                          (Multi-Turno)        (nomic-embed)     │
│                                                                 ▼
│                          Búsqueda Híbrida: 70% Coseno + 30% FTS Rank
│                                                                 │
│                                    Top Chunks Seleccionados ────┘
└─────────────────────────────────────────────────────────────────┐
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FASE 3: AUMENTACIÓN Y GENERACIÓN (Inferencia)                               │
│                                                                             │
│ Prompt del Sistema + Chunks de Contexto + Pregunta                          │
│                                  │                                          │
│                                  ▼                                          │
│         Orquestador en Cascada de 3 Niveles (T = 0):                        │
│         ├── Nivel 1 (Primario): Groq LPU (openai/gpt-oss-120b)             │
│         ├── Nivel 2 (Secundario): OpenRouter Cloud (liquid/lfm-2.5-2.6b)    │
│         └── Nivel 3 (Offline Fail-Safe): Ollama Local (gemma3:4b - 4K)      │
│                                  │                                          │
│                                  ▼                                          │
│         Flujo Streaming SSE ──► React 19 + marked + DOMPurify               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Fase 1: Ingesta e Indexación (`npm run ingest`)

El objetivo es convertir documentos de texto en vectores matemáticos organizados y persistidos para búsquedas inmediatas.

1. **Documentos Oficiales (`data/documents/`):**
   - `pricing-and-levels.md`: Tarifas por idioma y modalidad, descuentos y niveles.
   - `schedules-and-modalities.md`: Horarios, intensidad semanal y sedes presenciales.
   - `enrollment-and-certifications.md`: Proceso de matrícula paso a paso, políticas de cancelación y certificaciones.
2. **Chunking Semántico Atómico por Encabezados (`backend/src/rag/ingest.js`):**
   - *Problema del chunking por caracteres:* Cortar cada 500 caracteres parte tablas y listas a la mitad, destruyendo la coherencia.
   - *Solución:* Particionado guiado por encabezados Markdown (`#` y `##`). Cada unidad temática (ej. *"Descuentos por pago anticipado"*) se convierte en un fragmento atómico indivisible con sus propios metadatos (`source`, `category`, `header`). Se generan exactamente **15 chunks semánticos**.
3. **Generación de Embeddings (`nomic-embed-text-v2-moe` en Ollama):**
   - Transforma cada fragmento de texto en un **vector numérico denso de 768 dimensiones**.
   - Cada dimensión representa una coordenada en un espacio semántico: textos sobre precios y dinero quedan matemáticamente próximos entre sí.
4. **Persistencia en PostgreSQL 16 con `pgvector` (`backend/src/db/pgvector.js`):**
   - La tabla `document_chunks` almacena el contenido, la metadata y la columna de tipo `vector(768)`.
   - Se crean dos índices complementarios:
     - **HNSW (Hierarchical Navigable Small World):** Índice en grafo que optimiza el cálculo de distancia de coseno (`vector_cosine_ops`).
     - **GIN (Generalized Inverted Index):** Índice inverso sobre el vector léxico en español (`to_tsvector('spanish', content)`).

---

### Fase 2: Recuperación Híbrida (*Hybrid Retrieval*)

Cuando el estudiante envía una consulta, el sistema realiza una búsqueda de alta fidelidad:

1. **Contextualizador Multi-Turno (`backend/src/rag/retriever.js`):**
   - Si el estudiante preguntó primero *"¿Cuánto cuesta inglés presencial?"* y luego envía *"¿Y en virtual?"*, el retriever analiza los últimos mensajes del historial e infiere la consulta completa: *"¿Cuánto cuesta inglés en modalidad virtual?"*.
2. **Búsqueda Híbrida (*Hybrid Search*):**
   Combina dos técnicas en una única consulta SQL ponderada:
   $$\text{Score Final} = (0.70 \times \text{Similitud Coseno}) + (0.30 \times \min(2 \times \text{Rank FTS}, 1.0))$$
   - **Componente Semántico (70%):** Entiende sinónimos, contexto e intenciones (si el usuario dice *"costo"*, *"valor"* o *"plata"*, recupera los chunks de precios).
   - **Componente Léxico (30%):** Coincidencia exacta de términos clave mediante Full-Text Search (direcciones exactas como *"Calle 45 #22-18"*, exámenes como *"TOEFL"*, etc.).
3. **Balanceo Multi-Documento:**
   Para preguntas compuestas (ej. *"¿Cuánto vale el francés y qué horarios hay?"*), el algoritmo balancea los chunks recuperados para que no provengan de un solo archivo, garantizando contexto de precios y de horarios a la vez.

---

### Fase 3: Aumentación y Generación

1. **Ensamblado del Prompt con Directiva Estricta (`backend/src/llm/promptBuilder.js`):**
   Se inyecta el `SYSTEM_PROMPT` con temperatura $T = 0$ (determinista) y los fragmentos recuperados en un bloque `CONTEXT:`.
   - Regla obligatoria: *"Responde basándote ÚNICAMENTE en el CONTEXT. Si la respuesta no está en el contexto, indícalo educadamente e invita a hablar con un asesor humano."*
2. **Orquestador en Cascada Resiliente (`backend/src/llm/llmClient.js`):**
   - **Nivel 1 (Primario):** **Groq Cloud LPU** con el modelo **`openai/gpt-oss-120b`** (120 mil millones de parámetros). Responde en streaming en **2.5 segundos** con tablas completas y cálculos precisos.
   - **Nivel 2 (Secundario):** **OpenRouter Cloud** (`liquid/lfm-2.5-2.6b:free`) como respaldo ante caídas externas.
   - **Nivel 3 (Offline Fail-Safe):** **Ollama Local** (`gemma3:4b`), configurado con una ventana de contexto ampliada a **`num_ctx: 4096`** para operar 100% desconectado de internet.
3. **Streaming y Renderizado en Cliente (`ChatMessage.jsx`):**
   Los fragmentos se transmiten token a token mediante Server-Sent Events (SSE). El cliente web procesa el Markdown con **`marked`** y lo sanitiza con **`DOMPurify`**, renderizando tablas de precios con bordes, cabeceras y estilos corporativos.

---

## 3. Justificación de Tecnologías y Trade-offs

| Tecnología | Rol en la Arquitectura | Justificación Técnica | Trade-off / Alternativa descartada |
| :--- | :--- | :--- | :--- |
| **PostgreSQL 16 + `pgvector`** | Base de Datos Vectorial | Motor relacional estándar ACID. Permite almacenar datos, metadatos y vectores en una sola tabla, soportando índices HNSW y FTS. | Se descartó ChromaDB por ser una base de datos aislada en memoria/SQLite, sin soporte SQL ni visualización estándar. |
| **DBeaver** | Interfaz Gráfica de BD | Cliente universal conectado a `localhost:5433` que permite inspeccionar visualmente los 15 chunks, vectores y puntuaciones. | Evitó desplegar contenedores pesados como pgAdmin, ahorrando más de 500 MB de memoria RAM. |
| **`nomic-embed-text-v2-moe`** | Modelo de Embeddings | Arquitectura Mixture of Experts (MoE) en 768 dimensiones con soporte multilingüe nativo para español, inglés, francés y portugués. | Corre localmente en Ollama sin costo de consumo de tokens por petición. |
| **Groq LPU (`openai/gpt-oss-120b`)** | Motor LLM Principal | Hardware LPU especializado en inferencia secuencial de ultra-alta velocidad (500+ tokens/seg) con un modelo masivo de 120B. | Mucho más rápido y capaz de razonar cálculos de descuentos que modelos pequeños de 1B o 2B. |
| **Ollama Local (`gemma3:4b`)** | Motor de Respaldo Offline | Modelo de 4B con `num_ctx: 4096`. Garantiza disponibilidad si se corta internet o fallan los proveedores de nube. | Aunque demora ~20s en CPU, proporciona tolerancia a fallos total. |
| **React 19 + Vite** | Frontend SPA | Renderizado reactivo rápido, empaquetado optimizado en menos de 300 ms y arquitectura de componentes desacoplada. | Mucho más ligero y modular que frameworks monolíticos tradicionales. |
| **`marked` + `DOMPurify`** | Motor de Markdown Web | Transforma tablas y encabezados del LLM en elementos HTML reales, bloqueando cualquier vulnerabilidad de inyección XSS. | Reemplazó analizadores manuales basados en regex que no reconocían tablas. |
| **Telegram Bot API** | Escalamiento Humano | Canal bidireccional en tiempo real con asesores humanos usando long polling y funciones de respuesta nativas de Telegram. | No requiere desarrollar un panel administrativo complejo para los agentes humanos. |

---

## 4. Estructura de Carpetas del Proyecto

```
Rag-Customer-service/
├── backend/
│   └── src/
│       ├── config/
│       │   └── env.js             # Variables de entorno y configuración centralizada
│       ├── db/
│       │   └── pgvector.js        # Pool PostgreSQL, esquema de document_chunks y Búsqueda Híbrida
│       ├── llm/
│       │   ├── groqClient.js      # Cliente Groq Cloud LPU con soporte de streaming SSE
│       │   ├── openrouterClient.js# Cliente secundario OpenRouter
│       │   ├── ollamaClient.js    # Cliente local Ollama con num_ctx: 4096
│       │   ├── llmClient.js       # Orquestador con patrón de resiliencia en cascada
│       │   └── promptBuilder.js   # Prompt de sistema, directivas de grounding y few-shot
│       ├── rag/
│       │   ├── ingest.js          # Ingesta: lectura Markdown -> chunking -> embedding -> INSERT
│       │   └── retriever.js       # Query Reformulation y balanceo multi-documento
│       ├── routes/
│       │   ├── query.js           # Endpoint principal POST /api/query
│       │   └── liveChat.js        # Endpoints SSE y mensajería en vivo
│       ├── services/
│       │   ├── escalation.js      # Detección de intenciones para escalamiento humano
│       │   ├── liveChat.js        # Polling bidireccional con Telegram y despacho de tickets
│       │   ├── scopeGuard.js      # Filtro de temas fuera de ámbito
│       │   └── validation.js      # Validación de nombres y teléfonos (estándar Colombia 10 dígitos)
│       └── server.js              # Servidor Express y arranque de servicios
├── data/documents/                # Fuente de verdad en Markdown oficial de la academia
│   ├── enrollment-and-certifications.md
│   ├── pricing-and-levels.md
│   └── schedules-and-modalities.md
├── frontend/
│   ├── src/
│   │   ├── components/            # ChatDrawer, ChatMessage, ChatInput, Navbar, etc.
│   │   ├── lib/                   # riwi-data.js y validaciones de cliente
│   │   ├── App.jsx                # Estado global del chat y lector SSE
│   │   ├── index.css              # Tokens Tailwind v4 y estilos para tablas Markdown
│   │   └── main.jsx               # Montaje React
│   └── vite.config.js             # Configuración de compilación Vite
├── docker-compose.yml             # Contenedor de PostgreSQL 16 con extensión pgvector (puerto 5433)
├── package.json                   # Dependencias y scripts
├── README.md                      # Documentación del repositorio
└── ARQUITECTURA_RAG.md            # Este documento técnico
```

---

## 5. Ciclo de Vida de una Consulta (Flujo de Ejecución)

```
1. Estudiante escribe: "¿Cuánto cuesta el inglés presencial y qué descuento hay por 3 niveles?"
   │
2. Frontend (App.jsx)
   └── Envía POST /api/query con { question, history, stream: true }
   │
3. Backend (routes/query.js)
   ├── 3.1 ScopeGuard: Verifica que el tema corresponda a la academia.
   ├── 3.2 Retriever: Reformula consulta y genera embedding con nomic-embed-text-v2-moe.
   ├── 3.3 PostgreSQL (pgvector): Ejecuta consulta híbrida (70% HNSW Coseno + 30% GIN FTS).
   │   └── Recupera 6 chunks relevantes con precios, modalidades y políticas de descuento.
   ├── 3.4 PromptBuilder: Inyecta los chunks en la sección CONTEXT con T = 0.
   └── 3.5 LLM Cascade Orchestrator:
       └── Llama a Groq LPU (openai/gpt-oss-120b).
   │
4. Groq LPU
   └── Genera la respuesta en streaming calculando los precios y estructurando la tabla Markdown.
   │
5. Backend Express
   └── Transmite los tokens por SSE (data: {"content": "..."}\n\n) a medida que llegan.
   │
6. Frontend (ChatMessage.jsx)
   └── marked + DOMPurify convierten los tokens en una tabla HTML en tiempo real (< 3 segundos).
```
