import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import LogoutConfirmModal from "../molecules/LogoutConfirmModal";
import ConnectionBadge from "../atoms/ConnectionBadge";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";

const AdminSidebar = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [draftCount, setDraftCount] = useState(0);
  const [pendingStockCount, setPendingStockCount] = useState(0);
  const user = useAuthStore((state) => state.user);
  const uid = user?.uid || user?.uid;

  // 1. Contador de Ventas Suspendidas
  useEffect(() => {
    if (!uid) return;
    try {
      const q = query(
        collection(db, "draftOrders"),
        where("createdByUid", "==", uid),
        where("status", "==", "suspended"),
      );
      const unsub = onSnapshot(q, (snapshot) => {
        setDraftCount(snapshot.size);
      });
      return () => unsub();
    } catch (e) {
      console.error("Error subscribing to draftOrders:", e);
    }
  }, [uid]);

  // 2. Contador de Productos Express Pendientes de Registrar en Stock ⚡ (Notificación)
  useEffect(() => {
    if (!uid) return;
    const checkPendingExpress = async () => {
      try {
        // Obtener productos oficiales
        const prodSnap = await getDocs(
          collection(db, "usuarios", uid, "productos"),
        );
        const officialTitles = new Set(
          prodSnap.docs.map((d) =>
            (d.data().nombre || d.data().title || "").toLowerCase().trim(),
          ),
        );

        // Obtener órdenes recientes
        const ordersQ = query(
          collection(db, "usuarios", uid, "orders"),
          orderBy("createdAt", "desc"),
          limit(25),
        );
        const ordersSnap = await getDocs(ordersQ);

        const pendingSet = new Set<string>();
        ordersSnap.docs.forEach((docSnap) => {
          const items = docSnap.data().items || [];
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
        console.error("Error checking pending express items for badge:", err);
      }
    };

    checkPendingExpress();

    // Re-verificar solo al enfocar la ventana o cada 5 minutos para minimizar lecturas en Firestore
    const handleFocus = () => checkPendingExpress();
    window.addEventListener("focus", handleFocus);
    const interval = setInterval(checkPendingExpress, 300000); // 5 minutos

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [uid]);

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
      />
    </aside>
  );
};

export default AdminSidebar;
