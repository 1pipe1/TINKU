import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { auth } from "../firebase";

/**
 * Normaliza un número telefónico a formato internacional E.164.
 * Por defecto asume prefijo de Colombia (+57) para números de 10 dígitos que empiezan por 3.
 */
export const formatPhoneNumber = (input: string): string => {
  const cleaned = input.trim().replace(/[\s\-().]/g, "");
  if (!cleaned) return "";

  // Si ya tiene el signo '+' (ej: +573001234567 o de otro país), respetarlo
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // Si el usuario escribe 573001234567 (12 dígitos comenzando con 57)
  if (/^57\d{10}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  // Celular típico de Colombia (10 dígitos, ej: 3001234567, 310..., 320...)
  if (/^\d{10}$/.test(cleaned)) {
    return `+57${cleaned}`;
  }

  // Si tiene menos dígitos o formato desconocido, anteponer +57 por defecto
  return cleaned.startsWith("+") ? cleaned : `+57${cleaned}`;
};

/**
 * Inicializa y configura el contenedor reCAPTCHA invisible para Firebase Auth.
 * Previene el error común de Firebase 'reCAPTCHA has already been rendered in this element'
 * asegurando la limpieza previa del widget y la recreación de un contenedor DOM limpio.
 */
export const setupInvisibleRecaptcha = (
  containerId = "recaptcha-container"
): RecaptchaVerifier => {
  // 1. Limpiar instancia anterior si existía
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.warn("Aviso al limpiar recaptchaVerifier anterior:", e);
    }
    window.recaptchaVerifier = null;
  }

  // 2. Si el contenedor ya existe y ya tiene nodos hijos inyectados por Google reCAPTCHA,
  // limpiarlo o recrearlo para evitar 'reCAPTCHA has already been rendered in this element'
  let container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = "";
  } else {
    container = document.createElement("div");
    container.id = containerId;
    container.setAttribute("aria-hidden", "true");
    document.body.appendChild(container);
  }

  const verifier = new RecaptchaVerifier(auth, container, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA resuelto automáticamente por el navegador
      console.log("🔒 reCAPTCHA invisible verificado exitosamente");
    },
    "expired-callback": () => {
      console.warn("⚠️ reCAPTCHA expiró, se requiere nuevo intento");
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {}
        window.recaptchaVerifier = null;
      }
    },
  });

  window.recaptchaVerifier = verifier;
  return verifier;
};

/**
 * Solicita el envío del código SMS a un celular real usando el reCAPTCHA invisible.
 */
export const sendPhoneSmsVerification = async (
  rawPhoneNumber: string,
  containerId = "recaptcha-container"
): Promise<{
  success: boolean;
  formattedPhoneNumber: string;
  confirmationResult: ConfirmationResult;
}> => {
  const formatted = formatPhoneNumber(rawPhoneNumber);

  if (!formatted || formatted.length < 9) {
    throw new Error(
      "Por favor ingresa un número de celular válido (ej: +57 300 123 4567 o 3001234567)"
    );
  }

  const verifier = setupInvisibleRecaptcha(containerId);

  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      formatted,
      verifier
    );
    window.confirmationResult = confirmationResult;

    return {
      success: true,
      formattedPhoneNumber: formatted,
      confirmationResult,
    };
  } catch (err: any) {
    // Si falla, limpiar el verifier para permitir un reintento limpio
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {}
      window.recaptchaVerifier = null;
    }
    throw err;
  }
};

/**
 * Confirma el código de 6 dígitos recibido por SMS en el celular.
 */
export const verifyPhoneCode = async (
  verificationCode: string
): Promise<User> => {
  const cleanCode = verificationCode.trim();
  if (!cleanCode || cleanCode.length < 4) {
    throw new Error("Por favor ingresa el código de verificación SMS.");
  }

  if (!window.confirmationResult) {
    throw new Error(
      "No hay una solicitud de verificación SMS activa. Solicita un nuevo código."
    );
  }

  const userCredential = await window.confirmationResult.confirm(cleanCode);
  return userCredential.user;
};

/**
 * Traduce los códigos de error comunes de Firebase Phone Auth y reCAPTCHA a español claro.
 */
export const getPhoneAuthErrorMessage = (error: any): string => {
  const code = error?.code || "";
  const msg = error?.message || "";

  switch (code) {
    case "auth/invalid-phone-number":
      return "Número de celular inválido. Asegúrate de incluir el código de país (ej: +57 300 123 4567).";
    case "auth/missing-phone-number":
      return "Debes ingresar un número de celular.";
    case "auth/quota-exceeded":
      return "Se ha superado la cuota de mensajes SMS de Firebase. Revisa tu consola de Firebase.";
    case "auth/too-many-requests":
      return "Demasiados intentos seguidos. Espera un momento antes de solicitar otro código SMS.";
    case "auth/captcha-check-failed":
      return "La validación invisible de reCAPTCHA no pudo completarse. Intenta nuevamente.";
    case "auth/invalid-verification-code":
      return "El código de verificación SMS es incorrecto. Revisa los 6 dígitos.";
    case "auth/code-expired":
      return "El código SMS ha expirado. Por favor solicita uno nuevo.";
    case "auth/app-not-authorized":
      return "Este dominio o URL no está autorizada en Firebase (Ve a Authentication > Settings > Authorized domains).";
    case "auth/network-request-failed":
      return "Error de conexión a internet. Revisa tu señal e intenta nuevamente.";
    case "auth/operation-not-allowed":
      if (msg.includes("region") || msg.includes("SMS unable to be sent")) {
        return "Firebase bloqueó el SMS: La región geográfica (+57 Colombia u otra) debe ser habilitada en Firebase Console > Authentication > Settings > SMS Region Policy (o activa el proveedor de Teléfono).";
      }
      return "El método de autenticación por Teléfono no está habilitado en la consola de Firebase (Authentication > Sign-in method > Teléfono).";
    case "auth/internal-error":
      if (msg.includes("already been rendered")) {
        return "El verificador reCAPTCHA se reinició. Por favor vuelve a pulsar el botón.";
      }
      return "Error interno de Firebase Auth. Verifica la configuración de tu proyecto.";
    default:
      return msg || "Ocurrió un error al procesar la verificación por SMS.";
  }
};
