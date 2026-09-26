import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, type ComponentType } from "react";
import { Toaster } from "sonner";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "./firebase";
import useAuthStore from "./store/useAuthStore";
import useCartStore from "./store/useCartStore"; // 🔥 1. IMPORTA EL STORE DEL CARRITO
import { useDraftStore } from "./store/useDraftStore";
import AuthPage from "./pages/AuthPage";
import AdminLayout from "./layout/AdminLayout";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import StockPage from "./pages/StockPage";
import SalesPage from "./pages/SalesPage";
import CheckoutPage from "./pages/CheckoutPage";
import SuspendedSalesPage from "./pages/SuspendedSalesPage";
import ProtectedRoute from "./layout/ProtectedRoute";

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user); // 🔥 2. SACA EL USUARIO ACTIVO
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const [hydrated, setHydrated] = useState(false);

  // 🔥 3. EL TRUCO SÚPER INTELIGENTE PARA SEPARAR LOS CARRITOS:
  // Cada vez que el 'user' cambie (Login, Logout o cambies de cuenta de prueba),
  // este efecto obliga a Zustand a volver a leer el LocalStorage con el UID correcto.
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, [user?.uid]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // ⚡ 4. OYENTE ÚNICO GLOBAL PARA VENTAS PAUSADAS (DRAFTS):
  // Solo un listener activo para toda la app (en vez de 3 duplicados en cada página).
  useEffect(() => {
    const uid = user?.uid;
    if (!uid) {
      useDraftStore.getState().setDraftCount(0);
      return;
    }

    // 1. Conteo inmediato desde almacenamiento local
    const localDraftsStr = localStorage.getItem(`tinku_drafts_${uid}`);
    if (localDraftsStr) {
      try {
        const parsed = JSON.parse(localDraftsStr);
        if (Array.isArray(parsed)) {
          useDraftStore.getState().setDraftCount(parsed.length);
        }
      } catch {}
    }

    // 2. Solo consultar Firestore si Firebase Auth está listo y autenticado
    if (!isAuthReady || !auth.currentUser || auth.currentUser.uid !== uid) {
      return;
    }

    let unsub: (() => void) | undefined;
    try {
      const q = query(
        collection(db, "draftOrders"),
        where("createdByUid", "==", uid),
        where("status", "==", "suspended")
      );
      unsub = onSnapshot(
        q,
        (snapshot) => {
          useDraftStore.getState().setDraftCount(snapshot.size);
        },
        (err) => {
          if (err.code === "permission-denied") {
            // Manejo silencioso: opera en modo local sin bloquear ni ensuciar la consola
          } else {
            console.warn("Aviso al leer draftOrders en App:", err);
          }
        }
      );
    } catch (e) {
      console.warn("Error configurando listener de draftOrders:", e);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [user?.uid, isAuthReady]);

  if (!hydrated) return null;


  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors closeButton duration={2500} />
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />}
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="stock" element={<StockPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="drafts" element={<SuspendedSalesPage />} />
          <Route path="suspendsales" element={<SuspendedSalesPage />} />
          <Route path="suspended" element={<SuspendedSalesPage />} />
        </Route>
        <Route
          path="/suspendsales"
          element={isAuthenticated ? <Navigate to="/admin/drafts" replace /> : <Navigate to="/login" />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/checkout"
          element={
            isAuthenticated ? <CheckoutPage /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
