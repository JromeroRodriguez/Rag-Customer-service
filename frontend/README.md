# Riwi Lingua — Frontend & Design System Package

Este paquete contiene todos los archivos fuente de interfaz de usuario, componentes de React, estilos en **Tailwind CSS v4** y configuración de Vite para **Riwi Lingua**.

---

## 🎨 Sistema de Diseño (Design Tokens)

### 1. Tipografía
- **Fuente Principal**: `Plus Jakarta Sans`, sans-serif
- **Escala de pesos**: Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800), Black (900).

### 2. Paleta de Colores
- **Fondo Base**: `#020617` (Slate 950) / `#0f172a` (Slate 900)
- **Bordes & Separadores**: `#1e293b` (Slate 800) / `#334155` (Slate 700)
- **Acentos Primarios (RIWI / Lingua)**:
  - **Indigo/Violet**: `#4f46e5` / `#7c3aed` (Badge institucional RIWI)
  - **Blue**: `#2563eb` / `#3b82f6` (Botones de acción, CTAs primarios)
  - **Cyan**: `#06b6d4` / `#22d3ee` (Gradientes y detalles tecnológicos)
- **Estados Semánticos**:
  - **Éxito / Respuesta Automática**: `#10b981` (Emerald 500)
  - **Alerta / Escalación a Humano**: `#f59e0b` (Amber 500) / `#ea580c` (Orange 600)
  - **Destructivo / Reset**: `#f43f5e` (Rose 500)

### 3. Iconografía
- **Librería**: `lucide-react` (iconos vectoriales SVG limpios, sin emojis genéricos).

---

## 📂 Estructura de Componentes

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Barra superior responsive con branding RIWI y selector de modo
│   │   ├── HeroSection.jsx      # Hero banner con propuesta de valor, badges y CTAs
│   │   ├── ProgramsSection.jsx  # Tarjetas de cursos (Inglés, Francés, Portugués) con marco CEFR
│   │   ├── ModalitiesSection.jsx # Modalidades (Presencial Barranquilla, Live Zoom, Self-Paced 24/7)
│   │   ├── PricingSection.jsx   # Tabla de precios oficiales y calculadora interactiva de descuentos
│   │   ├── EnrollmentSteps.jsx  # Línea de tiempo de 5 pasos para matrícula y certificaciones
│   │   ├── Footer.jsx           # Pie de página con ubicación física en Barranquilla
│   │   ├── ChatDrawer.jsx       # Widget flotante lateral para consultar al Asistente IA
│   │   ├── ChatMessage.jsx      # Burbujas de chat con badges de estado, fuentes y tokens
│   │   ├── ChatInput.jsx        # Campo de texto multilínea con envío por Enter
│   │   └── SuggestedPrompts.jsx # Chips de preguntas frecuentes
│   ├── App.jsx                  # Vista principal (Homepage + Asistente Full)
│   ├── index.css                # Estilos globales con @import "tailwindcss";
│   └── main.jsx                 # Punto de montaje React DOM
├── index.html                   # Documento HTML SPA con favicon SVG
├── vite.config.js               # Configuración Vite con plugins React y Tailwind v4
└── dist/                        # Bundle de producción compilado (HTML, CSS, JS)
```

---

## 🚀 Cómo ejecutar en desarrollo

1. Instalar dependencias en el directorio raíz:
   ```bash
   npm install
   ```
2. Iniciar el servidor Vite con Hot Reload:
   ```bash
   npm run dev
   ```
   Abre en el navegador: `http://localhost:5173`
3. Compilar para producción:
   ```bash
   npm run build
   ```
