import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const AdminSidebar = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    { to: "/admin", label: "Dashboard", icon: "📊" },
    { to: "/admin/stock", label: "Inventario", icon: "📦" },
    { to: "/admin/sales", label: "Ventas", icon: "💰" },
    { to: "/admin/drafts", label: "Ventas suspendidas", icon: "⏸️" },
  ];

  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    try {
      const q = query(
        collection(db, "draftOrders"),
        where("status", "==", "suspended"),
      );
      const unsub = onSnapshot(q, (snapshot) => {
        setDraftCount(snapshot.size);
      });
      return () => unsub();
    } catch (e) {
      console.error("Error subscribing to draftOrders:", e);
    }
  }, []);

  return (
    <>
      {/* Sidebar — solo desktop */}
      <aside className="hidden md:flex w-64 min-h-screen bg-gray-900 text-white flex-col p-6">
        <h1 className="text-xl font-bold text-orange-500 mb-4">
          🛒 Nexo Admin
        </h1>

        {/* Acción principal: registrar una venta */}
        <NavLink
          to="/"
          className="flex items-center justify-center gap-2 min-h-14 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-black shadow-lg transition-all active:scale-95 mb-6"
        >
          <span className="text-2xl">⚡</span>
          <span>Nueva venta</span>
        </NavLink>

        <nav className="flex flex-col gap-2 flex-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/admin"}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-orange-500 text-white font-semibold"
                    : "hover:bg-gray-700 text-gray-300"
                }`
              }
            >
              <span className="flex items-center gap-2">
                <span className="relative inline-flex items-center justify-center">
                  <span>{link.icon}</span>
                  {link.to === "/admin/drafts" && draftCount > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[1.1rem] h-4 text-[9px] leading-none inline-flex items-center justify-center rounded-full bg-red-600 text-white px-1">
                      {draftCount}
                    </span>
                  )}
                </span>
                <span>{link.label}</span>
              </span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="px-4 py-3 rounded-lg bg-gray-700 hover:bg-red-600 transition-colors text-gray-300 text-left"
        >
          🚪 Cerrar Sesión
        </button>
      </aside>

    </>
  );
};

export default AdminSidebar;
