/**
 * Guard to identify questions that are completely off-topic from Riwi Lingua academy
 * (e.g. recipes, coding, world trivia, math, politics, poems, etc.)
 */

const OFF_TOPIC_PATTERNS = [
  // Recipes and cooking
  /\b(receta|cocinar|pizza|ingredientes|cómo hacer|preparar comida|pastel|postre)\b/i,
  // Programming and code
  /\b(código|javascript|python|react|html|css|sql|función|algoritmo|programa en|script)\b/i,
  // General world trivia / politics
  /\b(presidente|capital de|quién inventó|quién descubrió|año de la guerra|país más grande)\b/i,
  // Entertainment / creative
  /\b(chiste|poema|canción|cuéntame una historia|adivinanza|película)\b/i,
  // Math / science trivia
  /\b(cuánto es \d+|ecuación|gravedad|física cuántica|velocidad de la luz)\b/i,
  // Weather / sports
  /\b(clima en|pronóstico del tiempo|partido de fútbol|mundial|campeón)\b/i,
];

const OTHER_LANGUAGES_PATTERNS = [
  /\b(alemán|german|deutsch|italiano|italian|mandarín|chino|chinese|ruso|russian|japonés|japanese|coreano|korean|árabe|arabic)\b/i,
];

/**
 * Checks if a question is outside the scope of Riwi Lingua
 * @param {string} question
 * @returns {{ isOffTopic: boolean, isOtherLanguage: boolean, defaultAnswer?: string }}
 */
export function checkScope(question) {
  const cleanQ = question.trim().toLowerCase();

  // 1. Check for other languages not offered by Riwi Lingua
  for (const pattern of OTHER_LANGUAGES_PATTERNS) {
    if (pattern.test(cleanQ)) {
      return {
        isOffTopic: true,
        isOtherLanguage: true,
        defaultAnswer:
          "En **Riwi Lingua** actualmente solo ofrecemos programas de formación oficial en **Inglés, Francés y Portugués**.\n\nNo contamos con cursos de ese idioma por el momento. ¿Te gustaría conocer las modalidades y horarios de alguno de nuestros tres idiomas?",
      };
    }
  }

  // 2. Check for completely off-topic queries (cooking, trivia, programming, etc.)
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(cleanQ)) {
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
