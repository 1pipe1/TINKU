import { Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../components/organisms/AdminSidebar";
import useAuthStore from "../store/useAuthStore";

const AdminLayout = () => {
  const isAuthenticated = useAuthStore((state) =>
    Boolean((state as { isAuthenticated?: boolean }).isAuthenticated),
  );
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🚪 Función de Cierre de Sesión Blindada contra Clics por Error
  const handleSafeLogout = async () => {
    const confirmLogout = window.confirm(
      "⚠️ ¿Estás seguro de que deseas cerrar sesión de tu cuenta de TINKU?\n\nEsto bloqueará el mostrador hasta que vuelvas a ingresar tus datos de acceso.",
    );
    if (confirmLogout) {
      await logout();
      navigate("/login");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#F0F4F8] pb-20 md:pb-0">
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
          <span className="text-[11px] tracking-wide font-bold">Stock</span>
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

        {/* Salir (Con Confirmación Segura) */}
        <button
          onClick={handleSafeLogout}
          className="flex-1 flex flex-col items-center gap-1 min-h-14 justify-center text-gray-400 hover:text-red-500 font-semibold transition-all"
        >
          <span className="text-xl">🚪</span>
          <span className="text-[11px] tracking-wide font-bold">Salir</span>
        </button>
      </div>
    </div>
  );
};

export default AdminLayout;
