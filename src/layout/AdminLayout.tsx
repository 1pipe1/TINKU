import { useState, useEffect } from "react";
import { Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { LogOut } from "lucide-react";
import { db } from "../firebase";
import AdminSidebar from "../components/organisms/AdminSidebar";
import LogoutConfirmModal from "../components/molecules/LogoutConfirmModal";
import useAuthStore from "../store/useAuthStore";
import ConnectionBadge, { useNetworkStatus } from "../components/atoms/ConnectionBadge";

const AdminLayout = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [draftCount, setDraftCount] = useState<number>(0);
  const isAuthenticated = useAuthStore((state) =>
    Boolean((state as { isAuthenticated?: boolean }).isAuthenticated),
  );
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useNetworkStatus();
  const uid = user?.uid;

  // Escuchar en tiempo real la cantidad de ventas pausadas/suspendidas
  useEffect(() => {
    if (!uid) return;
    try {
      const q = query(
        collection(db, "draftOrders"),
        where("status", "==", "suspended"),
      );
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          setDraftCount(snapshot.size);
        },
        (err) => console.warn("Error leyendo ventas pausadas en AdminLayout:", err)
      );
      return () => unsub();
    } catch (e) {
      console.warn("Error setting up draft listener:", e);
    }
  }, [uid]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🚪 Función de Cierre de Sesión Seguro (Compatible con iframes)
  const handleSafeLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F0F4F8] pb-20 md:pb-0">
      {/* 📱 Encabezado superior en Móvil (Muestra Logo TINKU + Usuario + Estado En línea / Desconectado + Botón Salir) */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-2xs sticky top-0 z-40">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-base font-black text-[#0F172A] hover:text-orange-500 transition-colors"
        >
          <span className="text-xl">🏪</span>
          <span>TINKU</span>
        </button>

        <div className="flex items-center gap-2">
          <ConnectionBadge
            userEmail={user?.email}
            role={user?.role}
            compact={false}
          />
          <button
            type="button"
            onClick={handleSafeLogout}
            className="flex items-center justify-center w-8 h-8 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-all cursor-pointer"
            title="Cerrar sesión o cambiar de usuario"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ⚠️ Alerta de desconexión en móvil dentro de Admin */}
      {!isOnline && (
        <div className="md:hidden bg-rose-500 text-white text-xs font-bold py-1.5 px-3 flex items-center justify-center gap-2 animate-pulse shrink-0">
          <span>📡 Sin conexión a internet.</span>
          <span className="text-[11px] font-normal opacity-90">Modo sin conexión activo.</span>
        </div>
      )}

      {/* 💻 Sidebar en Desktop */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Cuerpo de la Página (Outlet para las subrutas de Admin) */}
      <div className="flex-1 overflow-auto p-3 md:p-8">
        <Outlet />
      </div>

      {/* 📱 BARRA DE NAVEGACIÓN MÓVIL PERSISTENTE EN ADMIN (LA MÁS CHIMBA - FIEL A TU BOCETO DE CUADERNO) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl px-4 py-2 flex justify-around items-center z-100 md:hidden">
        {/* Vender */}
        <button
          onClick={() => navigate("/")}
          aria-label="Registrar una nueva venta"
          className={`flex-[1.25] flex flex-col items-center gap-0.5 min-h-14 justify-center rounded-xl border-2 shadow-md transition-all active:scale-95 ${
            isActive("/")
              ? "text-white font-black bg-orange-500 border-orange-400"
              : "text-orange-600 font-black bg-orange-50 border-orange-200 hover:bg-orange-100"
          }`}
        >
          <span className="text-2xl leading-none">⚡</span>
          <span className="text-sm tracking-wide font-black">¡A vender!</span>
        </button>

        {/* Dashboard */}
        <button
          onClick={() => navigate("/admin")}
          className={`flex-1 flex flex-col items-center gap-1 min-h-14 justify-center transition-all ${
            isActive("/admin")
              ? "text-orange-500 font-black"
              : "text-gray-400 hover:text-orange-500 font-semibold"
          }`}
        >
          <span className="text-xl">📊</span>
          <span className="text-[11px] tracking-wide font-bold">
            Resumen
          </span>
        </button>

        {/* Stock */}
        <button
          onClick={() => navigate("/admin/stock")}
          className={`flex-1 flex flex-col items-center gap-1 min-h-14 justify-center transition-all ${
            isActive("/admin/stock")
              ? "text-orange-500 font-black"
              : "text-gray-400 hover:text-orange-500 font-semibold"
          }`}
        >
          <span className="text-xl">📦</span>
          <span className="text-[11px] tracking-wide font-bold">Inventario</span>
        </button>

        {/* Ventas */}
        <button
          onClick={() => navigate("/admin/sales")}
          className={`flex-1 flex flex-col items-center gap-1 min-h-14 justify-center transition-all ${
            isActive("/admin/sales")
              ? "text-orange-500 font-black"
              : "text-gray-400 hover:text-orange-500 font-semibold"
          }`}
        >
          <span className="text-xl">💰</span>
          <span className="text-[11px] tracking-wide font-bold">Ventas</span>
        </button>

        {/* Ventas Suspendidas / Pausadas */}
        <button
          onClick={() => navigate("/admin/drafts")}
          className={`flex-1 flex flex-col items-center gap-1 min-h-14 justify-center transition-all relative ${
            isActive("/admin/drafts") || isActive("/admin/suspendsales") || isActive("/admin/suspended")
              ? "text-orange-500 font-black"
              : "text-gray-400 hover:text-orange-500 font-semibold"
          }`}
        >
          <div className="relative">
            <span className="text-xl">⏸️</span>
            {draftCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-xs animate-pulse">
                {draftCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-wide font-bold">Pausadas</span>
        </button>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        userEmail={user?.email}
      />
    </div>
  );
};

export default AdminLayout;
