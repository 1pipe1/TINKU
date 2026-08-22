import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = useAuthStore(
    (state) =>
      (state as unknown as {
        login: (email: string, password: string) => Promise<void>;
      }).login,
  );
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Credenciales inválidas. Verifica tu email y contraseña.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
        <h2 className="text-3xl font-bold text-center mb-6 text-orange-500">
          Iniciar Sesión
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-orange-500/10 border border-orange-500/50 text-orange-500 text-[14px] py-1 px-2 rounded mb-4 text-center">
            Prueba Ingreso
            <br />
            Email: <strong>demo@example.com</strong>
            <br />
            Password: <strong>123456</strong>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white outline-none focus:border-orange-500 transition-all"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white outline-none focus:border-orange-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
