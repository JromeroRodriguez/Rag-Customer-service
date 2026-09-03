/**
 * Normalizes text removing accents, diacritics, and excess whitespace.
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!]/g, " ")
    .trim();
}

/**
 * Patterns for other languages not offered by Riwi Lingua
 */
const OTHER_LANGUAGES_PATTERNS = [
  /\b(aleman|german|deutsch|italiano|italian|mandarin|chino|chinese|ruso|russian|japones|japanese|coreano|korean|arabe|arabic|holandes|polaco|turco|hebreo|latin|griego)\b/i,
];

/**
 * Patterns for completely off-topic topics (math, cooking, code, trivia, etc.)
 */
const OFF_TOPIC_PATTERNS = [
  // Math expressions and operations (e.g. "2+2", "cuanto es 2 mas 2", "10 / 5", "5 por 8")
  /\d+\s*[\+\-\*\/\^xX%]\s*\d+/,
  /\b(cuanto|que)\s+es\s+\d+/i,
  /\b\d+\s+(mas|menos|por|dividido|entre)\s+\d+\b/i,
  /\b(sumar?|restar?|multiplicar?|dividir?|calcula(r|me)?|ecuacion|algebra|trigonometria|geometria|raiz cuadrada|derivada|integral|teorema|matematicas?)\b/i,

  // Recipes and cooking
  /\b(receta|cocinar?|pizza|ingredientes?|como hacer|preparar comida|pastel|postre|arroz|sopa|horno|freir|salteado|almuerzo|cena|desayuno|comida tipica)\b/i,

  // Programming, software development, code
  /\b(codigo|javascript|python|react|html|css|sql|funcion|algoritmo|programa en|script|java|c\+\+|typescript|docker|compilar|backend|frontend|api rest)\b/i,

  // General world trivia / history / politics / geography
  /\b(presidente|capital de|quien invento|quien descubrio|quien es|quien fue|ano de la guerra|pais mas grande|poblacion de|rio mas largo|continente|historia de colombia|guerra mundial|politica)\b/i,

  // Entertainment / creative / casual
  /\b(chiste|poema|cancion|cuentame una historia|adivinanza|pelicula|serie|actor|cantante|anime|novela|cuento)\b/i,

  // General science / nature
  /\b(gravedad|fisica cuantica|velocidad de la luz|fotosintesis|atomo|planeta|universo|dinosaurio|quimica|biologia|astronomia)\b/i,

  // Weather / sports
  /\b(clima en|pronostico del tiempo|partido de futbol|mundial|campeon|liga|messi|ronaldo|estadio|nba|champions)\b/i,
];

/**
 * Keywords related to Riwi Lingua, language learning, enrollment, courses, schedules, or pricing
 */
const ACADEMY_KEYWORDS = [
  "lingua", "riwi", "curso", "clase", "idioma", "ingles", "english", "frances", "french",
  "portugues", "portuguese", "precio", "costo", "valor", "cuanto vale", "cuanto cuesta",
  "tarifa", "nivel", "horario", "modalidad", "presencial", "online", "virtual", "self-paced",
  "self paced", "matricula", "inscripci", "inscribir", "pagar", "pago", "descuento", "promocion",
  "certificado", "certificacion", "diploma", "profesor", "docente", "profesores", "sede",
  "barranquilla", "direccion", "ubicacion", "telefono", "contacto", "whatsapp", "asesor",
  "admision", "devolucion", "reembolso", "cobro", "reclamo", "queja", "estudiante", "requisito",
  "intensivo", "sabado", "sabatino", "nocturno", "manana", "tarde", "b1", "b2", "c1", "a1", "a2",
  "acreditacion", "examen", "nivelacion", "programa", "beca"
];

/**
 * Checks whether a question is related to the academy or language learning
 * @param {string} question
 * @returns {boolean}
 */
export function isAcademyRelated(question) {
  const normalized = normalizeText(question);
  return ACADEMY_KEYWORDS.some((kw) => normalized.includes(kw));
}

/**
 * Checks if a question is outside the scope of Riwi Lingua
 * @param {string} question
 * @returns {{ isOffTopic: boolean, isOtherLanguage: boolean, defaultAnswer?: string }}
 */
export function checkScope(question) {
  const normalized = normalizeText(question);

  // 1. Check for other languages not offered by Riwi Lingua
  for (const pattern of OTHER_LANGUAGES_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isOffTopic: true,
        isOtherLanguage: true,
        defaultAnswer:
          "En **Riwi Lingua** actualmente solo ofrecemos programas de formación oficial en **Inglés, Francés y Portugués**.\n\nNo contamos con cursos de ese idioma por el momento. ¿Te gustaría conocer las modalidades y horarios de alguno de nuestros tres idiomas?",
      };
    }
  }

  // 2. Check for completely off-topic queries (math, cooking, trivia, programming, etc.)
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isOffTopic: true,
        isOtherLanguage: false,
        defaultAnswer:
          "Como asistente virtual de **Riwi Lingua**, mi función es responder exclusivamente preguntas sobre nuestros programas de idiomas (**Inglés, Francés y Portugués**), horarios, precios, modalidades (Presencial, Live Online y Self-Paced), requisitos de certificación y admisiones en Barranquilla.\n\n¿En qué te puedo colaborar con respecto a nuestros cursos?",
      };
    }
  }

  return { isOffTopic: false, isOtherLanguage: false };
}

