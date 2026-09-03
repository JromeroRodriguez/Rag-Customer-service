import { normalizeText } from "./scopeGuard.js";

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
  "asesor de admisiones",
  "equipo de admisiones",
  "equipo administrativo",
  "no cuento con esa informacion",
  "no cuento con esa información",
  "no tengo esa informacion",
  "no tengo esa información",
  "para confirmarte este detalle",
];


const DIRECT_HUMAN_REQUESTS = [
  "hablar con un asesor",
  "hablar con una persona",
  "hablar con un humano",
  "hablar con alguien",
  "atencion humana",
  "asesor de ventas",
  "asesor humano",
  "asesora humana",
  "asesor comercial",
  "asesor de admisiones",
  "agente humano",
  "quiero inscribirme con un asesor",
  "contacto humano",
  "comunicarme con un asesor",
  "pasar con un asesor",
  "transferir con un asesor",
  "speak with an advisor",
  "talk to a human",
  "human agent",
  "sales advisor",
];

const BILLING_COMPLAINT_PATTERNS = [
  "devolucion",
  "devolver",
  "reembolso",
  "reembolsar",
  "me cobraron",
  "cobro doble",
  "doble cobro",
  "cobro indebido",
  "cobro de mas",
  "cobraron dos veces",
  "cobraron doble",
  "me descontaron",
  "reclamo",
  "reclamacion",
  "queja",
  "inconformidad",
  "problema con el pago",
  "pago no reflejado",
  "pago duplicado",
  "devolver el dinero",
  "devolucion de mi dinero",
  "devolver mi plata",
  "estafa",
  "fraude",
];

/**
 * Checks if question is a billing issue, double charge, refund, or complaint
 * @param {string} question
 * @returns {boolean}
 */
export function isBillingOrComplaint(question) {
  const norm = normalizeText(question);
  return BILLING_COMPLAINT_PATTERNS.some((p) => norm.includes(p));
}

/**
 * Checks if question explicitly asks for human support / advisor
 * @param {string} question
 * @returns {boolean}
 */
export function isDirectHumanRequest(question) {
  const norm = normalizeText(question);
  return DIRECT_HUMAN_REQUESTS.some((p) => norm.includes(p));
}

/**
 * A request is escalated when:
 *  - the question is a billing dispute or refund claim, or
 *  - the question explicitly requests human sales / advisor attention, or
 *  - retrieval found no relevant context (out of scope), or
 *  - the model decided to hand off to an advisor.
 *
 * @param {boolean} inScope
 * @param {string} answerText
 * @param {string} questionText
 */
export function shouldEscalate(inScope, answerText, questionText = "") {
  if (isBillingOrComplaint(questionText)) return true;
  if (isDirectHumanRequest(questionText)) return true;
  if (!inScope) return true;

  const lowerA = (answerText || "").toLowerCase().replace(/[’']/g, "'");
  return ESCALATION_PATTERNS.some((pattern) => lowerA.includes(pattern));
}

