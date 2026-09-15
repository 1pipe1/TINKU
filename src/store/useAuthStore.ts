import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import useCartStore from "./useCartStore";
import useStockStore from "./useStockStore";

type AuthUser = {
  uid: string;
  email: string | null;
  id?: string;
  role?: "admin" | "seller" | "pending";
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
          const firebaseUser = userCredential.user;

          // 🛡️ BARRERA MULTI-TENANT: Limpieza preventiva de memoria al cambiar de cuenta
          useCartStore.getState().clearCart();
          useStockStore.getState().clearProducts();
          localStorage.removeItem("stock-storage");
          localStorage.removeItem("cart-storage");

          set({
            user: {
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              email: firebaseUser.email,
              role: "admin",
            },
            isAuthenticated: true,
          });

          return true;
        } catch (error: any) {
          console.error("Error en Firebase Auth login:", error.code, error.message);
          return false;
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
        } catch (e) {
          console.error("Error al cerrar sesión:", e);
        }

        // 🛡️ PURGA COMPLETA MULTI-TENANT: Borra carrito, stock en memoria y caché de localStorage
        useCartStore.getState().clearCart();
        useStockStore.getState().clearProducts();
        
        localStorage.removeItem("stock-storage");
        localStorage.removeItem("cart-storage");

        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
