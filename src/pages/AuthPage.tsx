import { useState, useEffect } from "react";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import {
  Smartphone,
  Mail,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { formatPhoneNumber } from "../services/phoneAuth";

type AuthTab = "phone" | "email";
type PhoneStep = "enter_phone" | "enter_otp";

const AuthPage = () => {
  const [authTab, setAuthTab] = useState<AuthTab>("phone");

  // Estados para autenticación por teléfono / SMS
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sentPhoneNumber, setSentPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("enter_phone");
  const [countdown, setCountdown] = useState(0);

  // Estados para autenticación tradicional por correo
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Rol seleccionado
  const [role, setRole] = useState<"admin" | "seller">("admin");

  // Feedback y carga
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const sendPhoneOtp = useAuthStore((state) => state.sendPhoneOtp);
  const verifyPhoneOtp = useAuthStore((state) => state.verifyPhoneOtp);
  const navigate = useNavigate();

  // Temporizador para reenvío de SMS
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleQuickFill = (quickEmail: string, quickPass: string) => {
    setAuthTab("email");
    setEmail(quickEmail);
    setPassword(quickPass);
    setError("");
  };

  // 1. Envío de SMS mediante reCAPTCHA invisible
  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const cleanInput = phoneNumber.trim();
      if (!cleanInput) {
        setError("Por favor ingresa tu número de celular.");
        setIsSubmitting(false);
        return;
      }

      const formatted = formatPhoneNumber(cleanInput);
      const res = await sendPhoneOtp(formatted);

      if (res.success) {
        setSentPhoneNumber(res.formattedPhone || formatted);
        setPhoneStep("enter_otp");
        setCountdown(60);
        setSuccessMessage(
          `Código SMS enviado a ${res.formattedPhone || formatted}. Ingrésalo a continuación.`
        );
      } else {
        setError(res.message || "No se pudo enviar el SMS de verificación.");
      }
    } catch (err: any) {
      setError(err?.message || "Error al solicitar código por SMS.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Verificación del código OTP de 6 dígitos
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      if (!otpCode || otpCode.trim().length < 4) {
        setError("Por favor ingresa el código de 6 dígitos recibido por SMS.");
        setIsSubmitting(false);
        return;
      }

      const res = await verifyPhoneOtp(otpCode.trim(), role);
      if (res.success) {
        setSuccessMessage("¡Número verificado! Ingresando a TINKU POS...");
        setTimeout(() => {
          navigate("/");
        }, 350);
      } else {
        setError(res.message || "Código inválido o expirado.");
      }
    } catch (err: any) {
      setError(err?.message || "Error al verificar el código SMS.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reenviar código SMS
  const handleResendSms = async () => {
    if (countdown > 0 || isSubmitting) return;
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const res = await sendPhoneOtp(sentPhoneNumber || phoneNumber);
      if (res.success) {
        setCountdown(60);
        setSuccessMessage("Se ha reenviado un nuevo código SMS a tu celular.");
      } else {
        setError(res.message || "No se pudo reenviar el SMS.");
      }
    } catch (err: any) {
      setError(err?.message || "Error al reenviar código.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Autenticación tradicional por usuario/correo
  const handleEmailSubmit = async (e: React.FormEvent) => {
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
          }, 400);
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
        {/* Encabezado Principal */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-3xl mb-3">
            🏪
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            TINKU Punto de Venta
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de mostrador, inventario y ventas
          </p>
        </div>

        {/* Pestañas Principales: Celular (SMS) vs Correo/Usuario */}
        <div className="grid grid-cols-2 bg-slate-900/90 p-1.5 rounded-2xl mb-6 border border-slate-700/60 gap-1">
          <button
            type="button"
            onClick={() => {
              setAuthTab("phone");
              setError("");
              setSuccessMessage("");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authTab === "phone"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Celular (SMS)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthTab("email");
              setError("");
              setSuccessMessage("");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authTab === "email"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Correo / Usuario</span>
          </button>
        </div>

        {/* Mensajes de Alerta y Notificación */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3.5 rounded-2xl mb-4 flex items-start gap-2.5 animate-in fade-in">
            <span className="text-base shrink-0">⚠️</span>
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-xs p-3.5 rounded-2xl mb-4 flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* ========================================================= */}
        {/* FLUJO 1: AUTENTICACIÓN CON NÚMERO DE CELULAR Y SMS        */}
        {/* ========================================================= */}
        {authTab === "phone" && (
          <div className="space-y-4">
            {/* Notificación de protección con reCAPTCHA invisible */}
            <div className="bg-slate-900/70 border border-slate-700/70 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span>reCAPTCHA Invisible Activo</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Valida en segundo plano que la petición viene de un celular real antes de despachar el SMS con el código.
                </p>
              </div>
            </div>

            {/* Contenedor gestionado dinámicamente por setupInvisibleRecaptcha */}

            {/* PASO 1: Ingreso de número de celular */}
            {phoneStep === "enter_phone" && (
              <form onSubmit={handleSendSms} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">
                    Número de Celular
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-slate-400 border-r border-slate-700 pr-2 pointer-events-none select-none">
                      <span>🇨🇴</span>
                      <span>+57</span>
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-22 pr-4 py-3 text-white text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-500 font-mono tracking-wide"
                      placeholder="300 123 4567"
                      required
                      autoComplete="tel"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 ml-1">
                    Solo ingresa los 10 dígitos (ej: 300 123 4567). El prefijo 🇨🇴 +57 se incluye automáticamente.
                  </p>
                </div>

                {/* Rol de usuario para la sesión */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">
                    Ingresar como
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("admin")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        role === "admin"
                          ? "bg-orange-500/20 border-orange-500 text-orange-300 shadow-xs"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      👑 Administrador
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("seller")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        role === "seller"
                          ? "bg-orange-500/20 border-orange-500 text-orange-300 shadow-xs"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      💼 Vendedor
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Validando reCAPTCHA y enviando SMS...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Código SMS</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* PASO 2: Verificación de código OTP */}
            {phoneStep === "enter_otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">SMS enviado al número:</span>
                    <strong className="text-orange-400 font-mono text-sm">
                      {sentPhoneNumber}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneStep("enter_phone");
                      setOtpCode("");
                      setError("");
                    }}
                    className="text-slate-400 hover:text-white underline text-xs font-medium cursor-pointer"
                  >
                    Cambiar
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">
                    Código de Verificación (6 dígitos)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white text-center text-xl font-mono tracking-[0.4em] outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-600"
                      placeholder="••••••"
                      required
                      autoComplete="one-time-code"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                    Ingresa los 6 números que recibiste por mensaje de texto.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otpCode.length < 4}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Verificando código...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirmar Código e Ingresar</span>
                    </>
                  )}
                </button>

                {/* Botón para Reenviar SMS */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleResendSms}
                    disabled={countdown > 0 || isSubmitting}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-orange-400 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>
                      {countdown > 0
                        ? `Reenviar SMS en ${countdown}s`
                        : "¿No llegó el SMS? Reenviar código"}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* FLUJO 2: AUTENTICACIÓN TRADICIONAL POR CORREO / USUARIO   */}
        {/* ========================================================= */}
        {authTab === "email" && (
          <div>
            {/* Pestañas de Modo: Iniciar Sesión / Registrar Usuario */}
            <div className="flex bg-slate-900/80 p-1 rounded-xl mb-4 border border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setError("");
                  setSuccessMessage("");
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
                  setSuccessMessage("");
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isRegisterMode
                    ? "bg-slate-700 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                + Registrar Usuario
              </button>
            </div>

            {/* Cuentas rápidas de prueba / emulador */}
            {!isRegisterMode && (
              <div className="mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-700/40 text-xs">
                <p className="text-slate-400 font-medium mb-2">
                  Cuentas de prueba rápida:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill("alo@1", "alo123")}
                    className="px-2.5 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/40 font-mono text-[11px] transition-colors cursor-pointer"
                    title="Usuario del emulador de Firebase"
                  >
                    👤 alo@1 (alo123)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("demo@example.com", "123456")}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 font-mono text-[11px] transition-colors cursor-pointer"
                  >
                    👤 demo@example.com (123456)
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">
                  Usuario o Correo Electrónico
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-500"
                  placeholder="Ej: alo@1 o tu@correo.com"
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-500"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Selección de rol si está registrando */}
              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-300">
                    Rol del Usuario
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("admin")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer text-sm mt-2"
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
