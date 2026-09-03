export const formatCOP = (num) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(num);

export const PROGRAMS = [
  {
    id: "ingles",
    name: "Inglés Profesional & Conversacional",
    code: "EN",
    description:
      "Desarrolla fluidez para el mercado laboral global, entornos tech y certificación internacional.",
    levels: "A1, A2, B1, B2, C1, C2",
    duration: "8 semanas por nivel (12 semanas self-paced)",
    prices: { inPerson: 480000, liveOnline: 420000, selfPaced: 280000 },
    popular: true,
    features: [
      "Clubes de conversación semanales",
      "Prueba de nivelación gratis (20 min)",
      "Materiales digitales incluidos",
      "Certificado digital verificable",
    ],
  },
  {
    id: "frances",
    name: "Francés Dinámico",
    code: "FR",
    description:
      "Aprende el idioma de la diplomacia, cultura y procesos migratorios como Express Entry Quebec.",
    levels: "A1, A2, B1, B2, C1, C2",
    duration: "8 semanas por nivel (12 semanas self-paced)",
    prices: { inPerson: 520000, liveOnline: 460000, selfPaced: 300000 },
    popular: false,
    features: [
      "Enfoque en fonética y pronunciación",
      "Docentes nativos y bilingües",
      "Grupos reducidos por sesión",
      "Preparación base para DELF",
    ],
  },
  {
    id: "portugues",
    name: "Portugués de Negocios",
    code: "PT",
    description:
      "Conecta con el mercado de Brasil y América Latina con un aprendizaje ágil y práctico.",
    levels: "A1, A2, B1, B2, C1, C2",
    duration: "8 semanas por nivel (12 semanas self-paced)",
    prices: { inPerson: 500000, liveOnline: 440000, selfPaced: 290000 },
    popular: false,
    features: [
      "Inmersión comunicativa acelerada",
      "Prácticas aplicadas a negocios",
      "Horarios flexibles mañana y noche",
      "Plataforma virtual 24/7",
    ],
  },
];

export const MODALITIES = [
  {
    badge: "Sede Barranquilla",
    title: "Presencial",
    location: "Calle 45 #22-18, Barranquilla, Atlántico",
    duration: "8 semanas • 3 días por semana",
    slots: [
      "Grupo Mañana: 6:00 AM – 8:00 AM (L-V)",
      "Grupo Noche: 6:00 PM – 8:00 PM (L-V)",
      "Intensivo Sábados: 8:00 AM – 12:00 PM",
    ],
    features: [
      "Aulas climatizadas y multimedia",
      "Interacción cara a cara con docentes y compañeros",
      "Acceso a biblioteca y libros impresos opcionales",
      "Punto de atención física en recepción",
    ],
  },
  {
    badge: "En Vivo vía Zoom",
    title: "Live Online",
    location: "Desde cualquier lugar (Zoom con docente en vivo)",
    duration: "8 semanas • 3 sesiones semanales",
    slots: [
      "Franja Mañana: 7:00 AM – 9:00 AM (GMT-5)",
      "Franja Noche: 7:00 PM – 9:00 PM (GMT-5)",
      "Franja Sábados: 9:00 AM – 1:00 PM",
    ],
    features: [
      "Clases 100% en vivo con retroalimentación en tiempo real",
      "Grabaciones disponibles para repaso",
      "Material digital oficial incluido",
      "Misma intensidad académica que presencial",
    ],
  },
  {
    badge: "Plataforma 24/7",
    title: "Self-Paced Online",
    location: "Plataforma de aprendizaje LinguaBridge",
    duration: "Hasta 12 semanas a tu propio ritmo",
    slots: [
      "Estudia a cualquier hora del día o la noche",
      "Clubes de conversación semanales:",
      "Miércoles a las 6:00 PM (Hora Colombia)",
    ],
    features: [
      "Máxima flexibilidad horaria",
      "Ejercicios interactivos con autocorrección",
      "Club de conversación semanal con tutor",
      "Sin interrupciones por días festivos",
    ],
  },
];

export const PRICING_TABLE = [
  {
    language: "Inglés",
    inPerson: 480000,
    liveOnline: 420000,
    selfPaced: 280000,
    badge: "Más Demandado",
  },
  { language: "Francés", inPerson: 520000, liveOnline: 460000, selfPaced: 300000, badge: null },
  { language: "Portugués", inPerson: 500000, liveOnline: 440000, selfPaced: 290000, badge: null },
];

export const DISCOUNTS = [
  {
    title: "10% por 3 niveles",
    description: "Paga 3 niveles por adelantado y obtén un 10% de descuento en el valor total.",
  },
  {
    title: "15% por 6 niveles",
    description: "Paga 6 niveles por adelantado (ciclo completo) y ahorra un 15% sobre el total.",
  },
  {
    title: "COP 30,000 por Referidos",
    description:
      "Descuento de COP 30,000 para ti y para la persona que refieras, aplicable en su próximo nivel.",
  },
  {
    title: "12% Convenio Universitario",
    description:
      "Estudiantes activos de universidades aliadas reciben 12% de descuento presentando su carné vigente.",
  },
];

export const ENROLLMENT_STEPS = [
  {
    step: "01",
    title: "Test de Clasificación",
    description:
      "Toma el test gratuito de 20 minutos (online o presencial). Si eres principiante total (A1), lo omites directamente.",
  },
  {
    step: "02",
    title: "Selecciona Modalidad & Horario",
    description:
      "Elige entre Presencial (Barranquilla), Live Online (Zoom) o Self-Paced (24/7), y tu franja horaria preferida.",
  },
  {
    step: "03",
    title: "Formulario de Registro",
    description:
      "Completa tus datos en el portal web o de forma presencial en recepción en la Calle 45 #22-18.",
  },
  {
    step: "04",
    title: "Pago de Matrícula",
    description:
      "Realiza el pago por transferencia bancaria, tarjeta o efectivo para asegurar tu cupo antes del cierre.",
  },
  {
    step: "05",
    title: "Bienvenida e Inicio de Cohorte",
    description:
      "Recibe tu correo de confirmación con accesos, docente y horario en menos de 24 horas. ¡Iniciamos el 1.ᵉʳ lunes de cada mes!",
  },
];

export const SUGGESTIONS = [
  {
    label: "Precios de inglés virtual",
    prompt: "¿Cuánto cuesta el nivel de inglés en modalidad Live Online y qué descuentos hay?",
  },
  {
    label: "Sedes y horarios",
    prompt: "¿Dónde quedan las clases presenciales y qué horarios tienen?",
  },
  {
    label: "Requisitos de certificado",
    prompt: "¿Cuáles son los requisitos para obtener el certificado de nivel?",
  },
  {
    label: "Cursos de alemán (Out of Scope)",
    prompt: "¿Ofrecen cursos de alemán en la academia?",
  },
  {
    label: "Reclamo de pago (Escalación)",
    prompt: "Me cobraron dos veces la inscripción, quiero la devolución de mi dinero.",
  },
];

export const WELCOME_MESSAGE = {
  id: "welcome-1",
  role: "assistant",
  content:
    "¡Hola! Soy Lingua, la asistente virtual de **LinguaBridge Academy by RIWI** en Barranquilla.\n\nPuedo orientarte sobre nuestros programas de **Inglés, Francés y Portugués**, precios, modalidades (Presencial, Live Online y Self-Paced), horarios, requisitos de certificación y proceso de matrícula.\n\n¿En qué te puedo colaborar hoy?",
  timestamp: "Inicio",
  escalated: false,
  sources: ["schedules-and-modalities.md", "pricing-and-levels.md"],
};
