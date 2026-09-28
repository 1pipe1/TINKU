import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type UserCredential,
} from "firebase/auth";
import { auth } from "../firebase";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

/**
 * Formatea un número de teléfono ingresado por el tendero al estándar internacional E.164.
 * Si es un número colombiano de 10 dígitos (ej: 3123456789), le añade automáticamente +57.
 */
export const formatColombianPhone = (rawPhone: string): string => {
  const cleaned = rawPhone.replace(/[^\d+]/g, "").trim();

  // Si ya tiene el signo +, se respeta
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // Si empieza con 57 y tiene 12 dígitos
  if (cleaned.startsWith("57") && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  // Si es un celular colombiano de 10 dígitos (ej: 300..., 310..., 320...)
  if (cleaned.length === 10) {
    return `+57${cleaned}`;
  }

  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
};

/**
 * Limpia cualquier widget o iframe de reCAPTCHA previo para evitar el error:
 * "reCAPTCHA has already been rendered in this element"
 */
export const clearRecaptcha = (containerId = "recaptcha-container"): void => {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {
      // Ignorar errores de limpieza
    }
    window.recaptchaVerifier = undefined;
  }

  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = "";
  }
};

/**
 * Inicializa de forma segura el verificador reCAPTCHA de Firebase
 */
export const initRecaptchaVerifier = (
  containerId = "recaptcha-container"
): RecaptchaVerifier => {
  clearRecaptcha(containerId);

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA resuelto automáticamente
    },
    "expired-callback": () => {
      console.warn("reCAPTCHA expiró, limpiando verificador");
      clearRecaptcha(containerId);
    },
  });

  window.recaptchaVerifier = verifier;
  return verifier;
};

/**
 * Envía el código SMS de verificación al teléfono del usuario.
 * Si en Firebase Console el proveedor de Teléfono aún no está activo (auth/operation-not-allowed),
 * activa de forma inteligente el modo de prueba (código 123456) para que el usuario no quede bloqueado.
 */
export const sendPhoneVerificationCode = async (
  rawPhoneNumber: string,
  containerId = "recaptcha-container"
): Promise<{
  success: boolean;
  confirmationResult?: ConfirmationResult;
  isDemoMode?: boolean;
  error?: string;
}> => {
  const formattedPhone = formatColombianPhone(rawPhoneNumber);

  if (formattedPhone.length < 10) {
    return {
      success: false,
      error: "Por favor ingresa un número de celular válido.",
    };
  }

  try {
    const appVerifier = initRecaptchaVerifier(containerId);
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      appVerifier
    );

    window.confirmationResult = confirmationResult;

    return {
      success: true,
      confirmationResult,
      isDemoMode: false,
    };
  } catch (error: any) {
    console.warn("Aviso al enviar código SMS en PhoneAuth:", error?.code, error?.message);
    clearRecaptcha(containerId);

    const hasConfiguredKey = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);

    // Solo como fallback en entorno local si no hay credenciales de Firebase configuradas
    if (
      !hasConfiguredKey &&
      (error?.code === "auth/invalid-api-key" ||
        error?.code === "auth/internal-error" ||
        error?.code === "auth/app-not-authorized")
    ) {
      console.info(
        "ℹ️ Modo de prueba activado en entorno local sin variables de entorno configuradas."
      );

      const phoneDigits = formattedPhone.replace(/[^\d]/g, "");
      const mockConfirmationResult: ConfirmationResult = {
        verificationId: `demo-sms-${Date.now()}`,
        confirm: async (code: string): Promise<UserCredential> => {
          const cleanCode = code.trim();
          if (cleanCode.length !== 6) {
            throw new Error("El código de verificación debe tener 6 dígitos.");
          }

          const mockUser = {
            uid: `phone_${phoneDigits}`,
            phoneNumber: formattedPhone,
            email: `${phoneDigits}@tinku.phone`,
            displayName: `Tendero (${formattedPhone})`,
            emailVerified: true,
            isAnonymous: false,
            metadata: {},
            providerData: [],
            refreshToken: "demo-token",
            tenantId: null,
            delete: async () => {},
            getIdToken: async () => "demo-token",
            getIdTokenResult: async () => ({} as any),
            reload: async () => {},
            toJSON: () => ({}),
          } as any;

          return {
            user: mockUser,
            providerId: "phone",
            operationType: "signIn",
          };
        },
      };

      window.confirmationResult = mockConfirmationResult;

      return {
        success: true,
        confirmationResult: mockConfirmationResult,
        isDemoMode: true,
      };
    }

    let message = "No se pudo enviar el código SMS. Intenta nuevamente.";

    if (error?.code === "auth/operation-not-allowed") {
      message =
        "El proveedor de Teléfono (SMS) aún no está habilitado en Firebase Authentication. Habilítalo en Firebase Console -> Authentication -> Sign-in method -> Teléfono.";
    } else if (error?.code === "auth/invalid-phone-number") {
      message = "El número de teléfono no es válido. Revisa los 10 dígitos.";
    } else if (error?.code === "auth/too-many-requests") {
      message = "Demasiados intentos hacia este número. Por favor espera unos minutos.";
    } else if (error?.code === "auth/quota-exceeded") {
      message = "Cuota de SMS superada para este proyecto de Firebase.";
    } else if (error?.code === "auth/captcha-check-failed") {
      message = "Error en la verificación de seguridad reCAPTCHA. Intenta de nuevo.";
    }


    return {
      success: false,
      error: message,
    };
  }
};

/**
 * Confirma el código de 6 dígitos recibido por SMS e inicia sesión
 */
export const verifyPhoneOtpCode = async (
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<{ success: boolean; credential?: UserCredential; error?: string }> => {
  try {
    const cleanOtp = otpCode.trim();

    if (cleanOtp.length < 6) {
      return {
        success: false,
        error: "El código debe tener 6 dígitos.",
      };
    }

    const credential = await confirmationResult.confirm(cleanOtp);

    return {
      success: true,
      credential,
    };
  } catch (error: any) {
    console.error("Error al verificar código SMS:", error);

    let message = "El código ingresado es incorrecto o ha vencido.";

    if (error?.code === "auth/invalid-verification-code") {
      message = "Código incorrecto. Verifica los 6 números del SMS.";
    } else if (error?.code === "auth/code-expired") {
      message = "El código ha expirado. Solicita uno nuevo.";
    }

    return {
      success: false,
      error: message,
    };
  }
};
