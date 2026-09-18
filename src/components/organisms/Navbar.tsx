import { useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import SearchBar from "../atoms/SearchBar";
import LogoutConfirmModal from "../molecules/LogoutConfirmModal";
import ConnectionBadge, { useNetworkStatus } from "../atoms/ConnectionBadge";

type NavbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onCheckout?: () => void;
};

const Navbar = ({ search, onSearchChange }: NavbarProps) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const role = user?.role ?? null;
  const isOnline = useNetworkStatus();

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-3 md:px-8 py-2.5 md:py-3.5 flex flex-col gap-2 shadow-xs">
        {/* Fila principal */}
        <div className="flex items-center justify-between gap-2 md:gap-3">
          {/* Logo TINKU */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-lg md:text-2xl font-black text-[#0F172A] tracking-tight hover:text-orange-500 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span className="text-xl">🏪</span>
            <span>TINKU</span>
          </button>

          {/* Buscador en Pantallas Medianas / Grandes */}
          <div className="hidden sm:flex flex-1 justify-center items-center max-w-md mx-2">
            <SearchBar value={search} onChange={onSearchChange} />
          </div>

          {/* Indicador de Usuario y Estado de Conexión + Botón Salir */}
          <div className="flex items-center gap-1.5 md:gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 md:gap-2">
                {/* 📡 Indicador de Conexión en Línea / Desconectado + Usuario (Visible en Celular y PC) */}
                <ConnectionBadge
                  userEmail={user?.email}
                  role={role}
                  compact={false}
                />

                {/* Botón Salir / Cambiar Usuario */}
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-all cursor-pointer select-none"
                  title="Cerrar sesión o cambiar de usuario"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>

        {/* Barra de búsqueda en Móvil (Fila dedicada para comodidad táctil) */}
        <div className="sm:hidden w-full pt-1">
          <SearchBar value={search} onChange={onSearchChange} />
        </div>

        {/* ⚠️ Banner de advertencia offline si el celular pierde conexión */}
        {!isOnline && (
          <div className="bg-rose-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 animate-bounce shadow-md">
            <span>📡 Sin señal de internet.</span>
            <span className="font-normal text-[11px] opacity-90">
              Tranquilo(a), tus ventas siguen guardándose en el celular.
            </span>
          </div>
        )}
      </nav>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        userEmail={user?.email}
      />
    </>
  );
};

export default Navbar;

