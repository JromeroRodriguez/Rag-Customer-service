# Riwi Lingua — Asistente RAG y Chat Bidireccional en Vivo

Asistente virtual inteligente para **Riwi Lingua** (academia de idiomas en Barranquilla), diseñado para orientar a estudiantes sobre cursos de **Inglés, Francés y Portugués**, modalidades (Presencial, Live Online y Self-Paced), precios, horarios, certificaciones y matrículas.

Cuenta con un canal de **Chat Bidireccional en Vivo con Telegram** que permite transferir prospectos y consultas complejas a asesores humanos en tiempo real.

Funciona de forma **100% local y con $0 costos de API** utilizando **Ollama** (`gemma3:4b` + `nomic-embed-text`) y **ChromaDB**.

---

## 🚀 Características Principales

- **Base de Conocimiento RAG Oficial**: Respuestas fundamentadas exclusivamente en los documentos de la academia (`data/documents/`), evitando alucinaciones.
- **Chat Bidireccional en Tiempo Real (Web ⟷ Telegram)**:
  - Cuando un estudiante solicita atención humana o ventas, se genera un ticket en vivo.
  - El asesor recibe la alerta en Telegram y puede responder directamente con **Responder (Reply)**.
  - La respuesta del asesor aparece en vivo en la pantalla del estudiante en menos de 1 segundo mediante **Server-Sent Events (SSE)** y sondeo de respaldo.
- **Captura Conversacional de Leads (Nombre + WhatsApp)**:
  - Antes de alertar al asesor, Lingua solicita de manera natural el **Nombre completo** y el **Número de WhatsApp/Teléfono** del estudiante para no perder el prospecto.
- **Silenciado Inteligente de IA (LLM Bypass)**:
  - Una vez iniciada la atención con el asesor humano, la IA no interrumpe la conversación. Los mensajes subsiguientes del estudiante se envían directamente al Telegram del asesor.
- **Comandos de Gestión para el Asesor (`/cerrar` o `/fin`)**:
  - El asesor puede escribir `/cerrar` en Telegram para finalizar la atención y devolver al estudiante al Asistente Lingua (IA) automáticamente.
- **Detección de Desconexión del Estudiante**:
  - Si el estudiante cierra la ventana del navegador, el bot le avisa al asesor en Telegram junto con el WhatsApp del estudiante para seguimiento.
- **Interfaz Moderna**:
  - Landing page completa construida con **React 19**, **Tailwind CSS v4**, **Vite** y **Lucide Icons**.
  - Modal de chat centrado, soporte de Markdown enriquecido (negritas, viñetas, enlaces clickeables), y diseño responsive para móviles y escritorio.
- **Automatización con n8n**:
  - Flujo exportado en `n8n/workflow.json` para integración con webhooks externos.

---

## 🏗️ Arquitectura del Sistema

```
 [Navegador del Estudiante]
           │
           ├── (POST /api/query) ──────────────► [Backend Express]
           │                                             │
           │                                 1. Retriever (ChromaDB + nomic-embed-text)
           │                                 2. Prompt Builder (Contexto estricto + Grounding)
           │                                 3. LLM Ollama (gemma3:4b)
           │                                 4. Evaluador de Escalamiento Humano
           │                                             │
           ◄── (SSE /api/live-chat/stream/:sessionId) ──┤
           │                                             ▼
           │                                  [Telegram Bot API]
           │                                             │
           ◄─── Respuesta en Vivo del Asesor ────────────┘
```

---

## 📁 Estructura del Proyecto

```
academia-idiomas-rag/
├── backend/
│   └── src/
│       ├── config/env.js          # Variables de entorno
│       ├── llm/
│       │   ├── ollamaClient.js    # Cliente Ollama con métricas de tokens
│       │   └── promptBuilder.js   # Prompt de sistema y personalidad de Lingua
│       ├── rag/
│       │   ├── ingest.js          # Ingesta, chunking y vectorización en ChromaDB
│       │   └── retriever.js       # Búsqueda semántica con umbral de similitud coseno
│       ├── routes/
│       │   ├── liveChat.js        # Endpoints SSE, sondeo y comandos del chat en vivo
│       │   └── query.js           # Endpoint principal POST /api/query
│       ├── services/
│       │   ├── escalation.js      # Detección de intención de asesor / ventas
│       │   └── liveChat.js        # Orquestador Web-Telegram, polling y sesiones
│       └── server.js              # Servidor Express y arranque del listener Telegram
├── data/documents/                # Documentos Markdown oficiales de la academia
│   ├── enrollment-and-certifications.md
│   ├── pricing-and-levels.md
│   └── schedules-and-modalities.md
├── frontend/
│   ├── src/
│   │   ├── components/            # Navbar, Hero, ChatDrawer, ChatMessage, ChatInput, etc.
│   │   ├── App.jsx                # Estado principal, conexión SSE y ciclo de chat
│   │   ├── index.css              # Estilos Tailwind CSS v4
│   │   └── main.jsx               # Montaje React
│   ├── index.html                 # HTML principal
│   └── vite.config.js             # Configuración Vite y proxy
├── n8n/
│   └── workflow.json              # Flujo exportado de n8n
├── docker-compose.yml             # Contenedor de ChromaDB
├── package.json                   # Scripts y dependencias
└── .env.example                   # Plantilla de variables de entorno
```

---

## ⚙️ Requisitos Previos

- **Node.js**: v18 o superior.
- **Docker**: Para ejecutar la base de datos vectorial ChromaDB.
- **Ollama**: Con los modelos instalados:
  ```bash
  ollama pull nomic-embed-text
  ollama pull gemma3:4b
  ```

---

## 🛠️ Instalación y Puesta en Marcha

### 1. Clonar e Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Copia la plantilla y configura tus credenciales de Telegram:
```bash
cp .env.example .env
```

Configura en tu `.env`:
```env
TELEGRAM_BOT_TOKEN=tu_token_de_bot_aqui
TELEGRAM_ADVISOR_CHAT_ID=tu_chat_id_aqui
```

### 3. Iniciar ChromaDB
```bash
docker compose up -d
```

### 4. Indexar Documentos en ChromaDB
```bash
npm run ingest
```
*(Ejecuta este comando cada vez que edites o agregues archivos en `data/documents/`).*

### 5. Compilar el Frontend
```bash
npm run build
```

### 6. Iniciar la Aplicación
```bash
npm start
```
La aplicación web estará disponible en **`http://localhost:3000`**.

---

## 📱 Flujo del Chat Bidireccional (Web ⟷ Telegram)

1. **Solicitud de Asesor:**
   El estudiante escribe en la web: *"Quiero inscribirme en el curso de inglés intensivo"*.
2. **Captura de Contacto:**
   - Lingua solicita su **nombre completo**: *"¿Cuál es tu nombre completo?"*.
   - Luego solicita su **WhatsApp**: *"¿A qué número de WhatsApp podemos contactarte?"*.
3. **Alerta en Telegram:**
   El asesor recibe una ficha en Telegram con el Ticket, Nombre, Celular y Diagnóstico.
4. **Respuesta en Vivo:**
   El asesor responde en Telegram usando **Responder (Reply)**.
   Su respuesta aparece de inmediato en la pantalla del estudiante con la insignia `👤 Asesor Humano • En Vivo`.
5. **Finalización:**
   El asesor escribe `/cerrar` en Telegram para dar por concluida la atención y regresar al estudiante al modo IA.

---

## 📦 Paquetes de Distribución

El proyecto incluye archivos comprimidos listos para desplegar:
- **`riwi-lingua-proyecto-completo.zip`**: Código fuente completo y optimizado (sin `node_modules`).
