/**
 * Validates a student full name.
 * - Must be at least 3 characters.
 * - Must NOT contain numbers or invalid symbols.
 * - Must have at least 2 words (e.g. First and Last name).
 *
 * @param {string} name
 * @returns {{valid: boolean, error?: string, sanitized?: string}}
 */
export function validateStudentName(name) {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "Por favor escribe tu nombre para continuar." };
  }
  const clean = name.trim();
  if (clean.length < 3) {
    return { valid: false, error: "El nombre es muy corto. Por favor escribe tu nombre completo (mínimo 3 letras)." };
  }
  if (clean.length > 70) {
    return { valid: false, error: "El nombre es demasiado largo (máximo 70 caracteres)." };
  }
  if (/\d/.test(clean)) {
    return { valid: false, error: "El nombre no puede contener números. Por favor escribe tu nombre real usando solo letras." };
  }
  // Allow letters, accents, spaces, hyphens and apostrophes
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  if (!nameRegex.test(clean)) {
    return { valid: false, error: "El nombre contiene caracteres especiales o símbolos no válidos. Usa solo letras." };
  }
  // At least 2 words (Name and Surname)
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return { valid: false, error: "Por favor ingresa tu nombre y apellido (ejemplo: Carlos Pérez o María Gómez)." };
  }
  return { valid: true, sanitized: clean };
}

/**
 * Validates a WhatsApp or mobile phone number according to Colombian 10-digit standard.
 * - Exactly 10 digits starting with 3 (optionally preceded by +57 or 57).
 * - Must NOT contain letters or words.
 *
 * @param {string} phone
 * @returns {{valid: boolean, error?: string, sanitized?: string, raw?: string}}
 */
export function validateStudentPhone(phone) {
  if (!phone || typeof phone !== "string") {
    return { valid: false, error: "Por favor ingresa tu número de WhatsApp." };
  }
  const clean = phone.trim();

  // Check if it contains letters or words
  if (/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(clean)) {
    return {
      valid: false,
      error: "El número no debe contener letras. Ingresa los 10 dígitos de tu celular (ejemplo: 300 123 4567).",
    };
  }

  // Extract all digits
  const digits = clean.replace(/\D/g, "");

  // If user entered Colombian country code (57), extract the 10-digit mobile number
  let nationalDigits = digits;
  if (digits.length === 12 && digits.startsWith("57")) {
    nationalDigits = digits.slice(2);
  }

  // Colombian mobile standard: exactly 10 digits
  if (nationalDigits.length !== 10) {
    return {
      valid: false,
      error: `El WhatsApp debe tener exactamente 10 dígitos (estándar de Colombia). Ingresaste ${digits.length} dígitos. Ejemplo: 300 123 4567.`,
    };
  }

  // In Colombia, mobile numbers start with 3 (300, 301, 310, 320, 350, etc.)
  if (!nationalDigits.startsWith("3")) {
    return {
      valid: false,
      error: "Los números de WhatsApp en Colombia inician con el número 3 (ejemplo: 300 123 4567).",
    };
  }

  const formatted = `+57 ${nationalDigits.slice(0, 3)} ${nationalDigits.slice(3, 6)} ${nationalDigits.slice(6)}`;
  return { valid: true, sanitized: formatted, raw: nationalDigits };
}
