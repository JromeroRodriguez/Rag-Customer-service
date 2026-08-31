const ESCALATION_PATTERNS = [
  "connecting you with one of our human advisors",
  "conectar con un asesor humano",
  "conectar con un asesor",
  "conectar con una asesora",
  "asesor humano",
  "asesora humana",
  "human advisor",
  "human advisors",
  "connecting you with",
  "asesor de ventas",
  "equipo de admisiones",
];

const DIRECT_HUMAN_REQUESTS = [
  "hablar con un asesor",
  "hablar con una persona",
  "atencion humana",
  "asesor de ventas",
  "asesor humano",
  "quiero inscribirme con un asesor",
  "contacto humano",
  "speak with an advisor",
  "talk to a human",
  "human agent",
  "sales advisor",
];

/**
 * A request is escalated when:
 *  - the question explicitly requests human sales / advisor attention, or
 *  - retrieval found no relevant context (out of scope), or
 *  - the model decided to hand off to an advisor.
 *
 * @param {boolean} inScope
 * @param {string} answerText
 * @param {string} questionText
 */
export function shouldEscalate(inScope, answerText, questionText = "") {
  if (!inScope) return true;

  const lowerQ = questionText.toLowerCase().replace(/[’']/g, "'");
  if (DIRECT_HUMAN_REQUESTS.some((pattern) => lowerQ.includes(pattern))) {
    return true;
  }

  const lowerA = answerText.toLowerCase().replace(/[’']/g, "'");
  return ESCALATION_PATTERNS.some((pattern) => lowerA.includes(pattern));
}
