import { useState, useEffect } from "react";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import {
  sendPhoneVerificationCode,
  formatColombianPhone,
  clearRecaptcha,
} from "../services/phoneAuthService";
import type { ConfirmationResult } from "firebase/auth";


type AuthTab = "phone" | "email";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<AuthTab>("phone");

  // Estados para autenticación con celular (Phone Auth)
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneStep, setPhoneStep] = useState<"enter_phone" | "enter_code">("enter_phone");
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Estados para autenticación por correo/usuario
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "seller">("admin");

  // Estados compartidos
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = useAuthStore((state) => state.login);
  const loginWithPhone = useAuthStore((state) => state.loginWithPhone);
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  // Limpiar mensajes al cambiar de pestaña
  useEffect(() => {
    setError("");
    setSuccessMessage("");
    clearRecaptcha("recaptcha-container");
  }, [activeTab]);

  const handleQuickFill = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError("");
  };

  // Enviar SMS con código de verificación
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const clean = phoneNumber.trim();
    if (!clean || clean.length < 7) {
      setError("Por favor ingresa un número de celular válido (ej: 312 345 6789).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendPhoneVerificationCode(clean, "recaptcha-container");
      if (res.success && res.confirmationResult) {
        setConfirmationResult(res.confirmationResult);
        setPhoneStep("enter_code");
        setOtpCode(""); // Campo limpio: el usuario debe digitar el código que reciba en su celular
        setSuccessMessage(`Código enviado por SMS al ${formatColombianPhone(clean)}. Ingrésalo para continuar.`);
      } else {
        setError(res.error || "No se pudo enviar el código. Revisa el número ingresado.");
      }

    } catch (err: any) {
      setError(err?.message || "Error al solicitar código por SMS.");
    } finally {
      setIsSubmitting(false);
    }
  };


  // Verificar código de 6 dígitos ingresado
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!confirmationResult) {
      setError("Sesión de verificación expirada. Solicita un nuevo código.");
      setPhoneStep("enter_phone");
      return;
    }

    if (!otpCode || otpCode.trim().length < 6) {
      setError("Ingresa los 6 dígitos del código SMS.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithPhone(phoneNumber, otpCode.trim(), confirmationResult);
      if (res.success) {
        setSuccessMessage("¡Verificación exitosa! Entrando a tu mostrador...");
        setTimeout(() => {
          navigate("/");
        }, 300);
      } else {
        setError(res.message || "El código ingresado es incorrecto.");
      }
    } catch (err: any) {
      setError(err?.message || "Error al verificar el código.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Envío tradicional con correo y contraseña
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        const res = await register(email, password, role);
        if (res.success) {
          setSuccessMessage("¡Usuario registrado con éxito! Entrando al sistema...");
          setTimeout(() => {
            navigate("/");
          }, 300);
        } else {
          setError(res.message || "Error al crear la cuenta.");
        }
      } else {
        const ok = await login(email, password);
        if (ok) {
          navigate("/");
        } else {
          setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al procesar tu solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1E293B] p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-700/80">
        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-3xl mb-3 shadow-inner">
            🏪
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            TINKU Punto de Venta
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de mostrador, inventario y ventas
          </p>
        </div>

        {/* Pestañas Principales: Celular (PhoneAuth) vs Correo/Usuario */}
        <div className="flex bg-slate-900/90 p-1.5 rounded-2xl mb-6 border border-slate-700/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab("phone");
              setPhoneStep("enter_phone");
            }}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "phone"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📱</span>
            <span>Con Celular</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "email"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📧</span>
            <span>Con Correo</span>
          </button>
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3.5 rounded-xl mb-4 flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 text-xs p-3.5 rounded-xl mb-4 flex items-center gap-2">
            <span className="text-base">✅</span>
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        {/* Contenedor invisible de reCAPTCHA para Firebase Phone Auth */}
        <div id="recaptcha-container"></div>

        {/* ----------------- PESTAÑA 1: PHONE AUTH (CELULAR) ----------------- */}
        {activeTab === "phone" && (
          <div>
            {phoneStep === "enter_phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">
                    Número de Celular
                  </label>
                  <div className="flex items-center bg-slate-900/90 border border-slate-700 rounded-xl overflow-hidden focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
                    <span className="px-3.5 py-3 text-sm font-black text-slate-300 bg-slate-800/80 border-r border-slate-700 flex items-center gap-1 select-none">
                      <span>🇨🇴</span>
                      <span>+57</span>
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\s]/g, ""))}
                      className="w-full bg-transparent px-4 py-3 text-white text-base outline-none placeholder:text-slate-500 font-bold"
                      placeholder="312 345 6789"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Te enviaremos un código de seguridad de 6 dígitos por mensaje de texto (SMS).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || phoneNumber.trim().length < 7}
                  className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-black py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer text-sm mt-3 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Enviando código...</span>
                  ) : (
                    <>
                      <span>📩 Enviar código por SMS</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Código de Verificación (SMS)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        clearRecaptcha("recaptcha-container");
                        setPhoneStep("enter_phone");
                        setOtpCode("");
                        setError("");
                        setSuccessMessage("");
                      }}
                      className="text-[11px] text-orange-400 hover:underline font-bold"
                    >
                      Cambiar número
                    </button>

                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-center text-2xl font-mono tracking-widest outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-600 font-black"
                    placeholder="123456"
                    required
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400 mt-2 text-center">
                    Ingresa los 6 números enviados a tu celular
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otpCode.length < 6}
                  className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-black py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer text-sm mt-2 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Verificando...</span>
                  ) : (
                    <span>⚡ Verificar y Entrar</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSubmitting}
                    className="text-xs text-slate-400 hover:text-white underline font-bold"
                  >
                    ¿No te llegó el SMS? Reenviar código
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ----------------- PESTAÑA 2: CORREO Y CONTRASEÑA ----------------- */}
        {activeTab === "email" && (
          <div>
            {/* Sub-Pestañas: Iniciar Sesión / Registrar */}
            <div className="flex bg-slate-900/60 p-1 rounded-xl mb-4 border border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setError("");
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  !isRegisterMode
                    ? "bg-slate-700 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setError("");
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isRegisterMode
                    ? "bg-slate-700 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                + Registrar
              </button>
            </div>

            {/* Cuentas rápidas de prueba / emulador */}
            {!isRegisterMode && (
              <div className="mb-4 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40 text-xs">
                <p className="text-slate-400 font-medium mb-1.5 text-[11px]">Acceso rápido para prueba:</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill("alo@1", "alo123")}
                    className="px-2 py-1 rounded-lg bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/40 font-mono text-[10px] transition-colors"
                  >
                    👤 alo@1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("admin@tinku.com", "admin123")}
                    className="px-2 py-1 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 font-mono text-[10px] transition-colors"
                  >
                    👤 admin@tinku.com
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-300">
                  Usuario o Correo
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-500"
                  placeholder="Ej: alo@1 o correo@tinku.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-300">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-300">
                    Rol
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("admin")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        role === "admin"
                          ? "bg-orange-500/20 border-orange-500 text-orange-300"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      Administrador
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("seller")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        role === "seller"
                          ? "bg-orange-500/20 border-orange-500 text-orange-300"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      Vendedor
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-black py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer text-sm mt-2"
              >
                {isSubmitting
                  ? "Procesando..."
                  : isRegisterMode
                  ? "Crear Cuenta e Ingresar"
                  : "Ingresar al Mostrador"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
