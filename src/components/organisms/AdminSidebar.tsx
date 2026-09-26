import { useState, useEffect, useMemo, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import useStockStore from "../../store/useStockStore";
import { useDraftStore } from "../../store/useDraftStore";
import LogoutConfirmModal from "../molecules/LogoutConfirmModal";
import ConnectionBadge from "../atoms/ConnectionBadge";
import {
  collection,
  query,
  limit,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";

const AdminSidebar = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const draftCount = useDraftStore((state) => state.draftCount);
  const [pendingStockCount, setPendingStockCount] = useState(0);
  const user = useAuthStore((state) => state.user);
  const uid = user?.uid;
  const products = useStockStore((state) => state.products);

  // ⚡ Contador de Productos Express Pendientes de Registrar en Stock
  // Se calcula usando los productos que ya están en memoria (0 lecturas a productos)
  // y órdenes locales o una única consulta inicial limitada (máx 15 órdenes).
  const checkPendingExpress = useCallback(async () => {
    if (!uid) return;
    try {
      const officialTitles = new Set(
        products.map((p) =>
          (p.title || (p as any).nombre || (p as any).name || "").toLowerCase().trim()
        )
      );

      // 1. Primero intentar leer del almacenamiento local (0 lecturas de red)
      const localOrdersStr = localStorage.getItem(`tinku_orders_${uid}`);
      let ordersToInspect: any[] = [];
      if (localOrdersStr) {
        try {
          ordersToInspect = JSON.parse(localOrdersStr).slice(0, 20);
        } catch {
          ordersToInspect = [];
        }
      }

      // 2. Si no hay en local, consultar un máximo de 15 órdenes recientes de Firestore
      if (ordersToInspect.length === 0) {
        const ordersQ = query(
          collection(db, "usuarios", uid, "orders"),
          orderBy("createdAt", "desc"),
          limit(15)
        );
        const ordersSnap = await getDocs(ordersQ);
        ordersToInspect = ordersSnap.docs.map((d) => d.data());
      }

      const pendingSet = new Set<string>();
      ordersToInspect.forEach((orderData) => {
        const items = orderData.items || [];
        items.forEach((it: any) => {
          const isExpress =
            it.isExpress || String(it.id || "").startsWith("express-");
          const itemTitle = (it.title || it.name || "").trim();
          if (isExpress && itemTitle) {
            if (!officialTitles.has(itemTitle.toLowerCase())) {
              pendingSet.add(itemTitle.toLowerCase());
            }
          }
        });
      });

      setPendingStockCount(pendingSet.size);
    } catch (err) {
      console.warn("Verificación de productos express en sidebar:", err);
    }
  }, [uid, products]);

  useEffect(() => {
    checkPendingExpress();

    // Actualizar cuando se registre una nueva venta localmente (0 lecturas de Firestore)
    const handleOrderUpdate = () => checkPendingExpress();
    window.addEventListener("tinku_orders_updated", handleOrderUpdate);
    window.addEventListener("storage", handleOrderUpdate);

    return () => {
      window.removeEventListener("tinku_orders_updated", handleOrderUpdate);
      window.removeEventListener("storage", handleOrderUpdate);
    };
  }, [checkPendingExpress]);


  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
    navigate("/login");
  };

  const links = [
    { to: "/admin", label: "Dashboard", icon: "📊" },
    {
      to: "/admin/stock",
      label: "Stock",
      icon: "📦",
      badge: pendingStockCount > 0 ? pendingStockCount : undefined,
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    { to: "/admin/sales", label: "Ventas", icon: "💰" },
    {
      to: "/admin/drafts",
      label: "Ventas suspendidas",
      icon: "⏸️",
      badge: draftCount > 0 ? draftCount : undefined,
      badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    },
  ];

  return (
    <aside className="hidden md:flex w-64 min-h-screen bg-gray-900 text-white flex-col p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-8 px-2">
        <span className="text-3xl">🏪</span>
        <div>
          <h1 className="text-xl font-black text-orange-500 tracking-wide">
            TINKU
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Control Total
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/admin"}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                isActive
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </div>
            {!!link.badge && link.badge > 0 && (
              <span
                className={`border text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${link.badgeColor || "bg-orange-500/20 text-orange-400 border-orange-500/30"}`}
              >
                {link.to === "/admin/stock" ? "⚡ " : ""}
                {link.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-gray-800 space-y-3">
        <div className="px-2">
          <ConnectionBadge
            userEmail={user?.email}
            phoneNumber={user?.phoneNumber}
            role={user?.role}
            compact={false}
          />
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
        >
          <span className="text-lg">🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        userEmail={user?.email}
        phoneNumber={user?.phoneNumber}
      />
    </aside>
  );
};

export default AdminSidebar;
