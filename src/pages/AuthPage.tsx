import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "seller">("admin");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleQuickFill = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      <div className="w-full max-w-md bg-[#1E293B] p-8 rounded-2xl shadow-2xl border border-slate-700/80">
        {/* Encabezado */}
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

        {/* Pestañas de Modo: Iniciar Sesión / Registrar Usuario */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl mb-6 border border-slate-700/60">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setError("");
              setSuccessMessage("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              !isRegisterMode
                ? "bg-orange-500 text-white shadow-sm"
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
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              isRegisterMode
                ? "bg-orange-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            + Registrar Usuario
          </button>
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Cuentas rápidas de prueba / emulador */}
        {!isRegisterMode && (
          <div className="mb-5 bg-slate-900/60 p-3 rounded-xl border border-slate-700/40 text-xs">
            <p className="text-slate-400 font-medium mb-2">Cuentas disponibles para prueba rápida:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("alo@1", "alo123")}
                className="px-2.5 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/40 font-mono text-[11px] transition-colors"
                title="Usuario del emulador de Firebase"
              >
                👤 alo@1 (alo123)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("demo@example.com", "123456")}
                className="px-2.5 py-1.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 font-mono text-[11px] transition-colors"
              >
                👤 demo@example.com (123456)
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer text-sm mt-2"
          >
            {isSubmitting
              ? "Procesando..."
              : isRegisterMode
              ? "Crear Cuenta e Ingresar"
              : "Ingresar al Mostrador"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;

