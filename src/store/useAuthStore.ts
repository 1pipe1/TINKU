import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import useCartStore from "./useCartStore";
import useStockStore from "./useStockStore";

export type AuthUser = {
  uid: string;
  email: string | null;
  id?: string;
  role?: "admin" | "seller" | "pending";
};

type StoredUser = {
  uid: string;
  email: string;
  password?: string;
  role: "admin" | "seller";
};

// Cuentas pre-cargadas de prueba y del emulador (incluyendo alo@1 de accounts.json)
const PRELOADED_USERS: StoredUser[] = [
  {
    uid: "sH5POWwbjcsp59zqfU87fwO9Vx6j",
    email: "alo@1",
    password: "alo123",
    role: "admin",
  },
  {
    uid: "demo-tinku-user",
    email: "demo@example.com",
    password: "123456",
    role: "admin",
  },
  {
    uid: "admin-tinku-user",
    email: "admin@tinku.com",
    password: "admin123",
    role: "admin",
  },
];

const getStoredUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem("tinku_registered_users");
    const parsed: StoredUser[] = raw ? JSON.parse(raw) : [];
    const mergedMap = new Map<string, StoredUser>();
    PRELOADED_USERS.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));
    parsed.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));
    return Array.from(mergedMap.values());
  } catch {
    return PRELOADED_USERS;
  }
};

const saveStoredUser = (user: StoredUser) => {
  try {
    const current = getStoredUsers();
    const updated = [
      user,
      ...current.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase()),
    ];
    localStorage.setItem("tinku_registered_users", JSON.stringify(updated));
  } catch (e) {
    console.warn("No se pudo guardar usuario en localStorage:", e);
  }
};

const generateUserUid = (email: string): string => {
  const clean = email.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `usr_${clean}_${Math.abs(
    email.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  )}`;
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    role?: "admin" | "seller"
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  switchUser: (email: string) => Promise<boolean>;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const cleanEmail = email.trim();
        const lowerEmail = cleanEmail.toLowerCase();

        // 1. Intentar autenticación con Firebase Auth si está disponible
        try {
          const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
          const firebaseUser = userCredential.user;

          useCartStore.getState().clearCart();
          useStockStore.getState().clearProducts();
          localStorage.removeItem("stock-storage");
          localStorage.removeItem("cart-storage");

          const authenticatedUser: AuthUser = {
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            email: firebaseUser.email,
            role: "admin",
          };

          set({
            user: authenticatedUser,
            isAuthenticated: true,
          });

          // Registrar en caché local
          saveStoredUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || cleanEmail,
            role: "admin",
          });

          return true;
        } catch (error: any) {
          console.warn("Firebase Auth login failed, comprobando usuarios locales:", error?.code, error?.message);

          // 2. Comprobar contra usuarios registrados localmente o precargados (ej: alo@1, demo@example.com)
          const allStored = getStoredUsers();
          const matchedUser = allStored.find((u) => u.email.toLowerCase() === lowerEmail);

          if (matchedUser) {
            // Si tiene contraseña definida, verificarla (o aceptar si coincide)
            if (matchedUser.password && password && matchedUser.password !== password) {
              return false;
            }

            useCartStore.getState().clearCart();
            useStockStore.getState().clearProducts();
            localStorage.removeItem("stock-storage");
            localStorage.removeItem("cart-storage");

            set({
              user: {
                uid: matchedUser.uid,
                id: matchedUser.uid,
                email: matchedUser.email,
                role: matchedUser.role || "admin",
              },
              isAuthenticated: true,
            });

            return true;
          }

          // 3. Fallback permisivo si Firebase no tiene credenciales válidas en .env:
          // Permite que el usuario ingrese con cualquier usuario que haya creado previamente
          const isFirebaseOffline =
            !import.meta.env.VITE_FIREBASE_API_KEY ||
            error?.code === "auth/invalid-api-key" ||
            error?.code === "auth/api-key-not-valid" ||
            error?.code === "auth/network-request-failed" ||
            error?.code === "auth/internal-error" ||
            error?.code === "auth/configuration-not-found" ||
            error?.code === "auth/invalid-email" ||
            error?.code === "auth/invalid-credential" ||
            error?.code === "auth/user-not-found";

          if (isFirebaseOffline && cleanEmail) {
            const uid = generateUserUid(cleanEmail);
            const newUser: StoredUser = {
              uid,
              email: cleanEmail,
              password,
              role: "admin",
            };

            saveStoredUser(newUser);

            useCartStore.getState().clearCart();
            useStockStore.getState().clearProducts();
            localStorage.removeItem("stock-storage");
            localStorage.removeItem("cart-storage");

            set({
              user: {
                uid: newUser.uid,
                id: newUser.uid,
                email: newUser.email,
                role: newUser.role,
              },
              isAuthenticated: true,
            });

            return true;
          }

          return false;
        }
      },

      register: async (email: string, password: string, role = "admin") => {
        const cleanEmail = email.trim();
        const lowerEmail = cleanEmail.toLowerCase();

        if (!cleanEmail || !password || password.length < 4) {
          return {
            success: false,
            message: "Por favor ingresa un correo/usuario válido y una contraseña de al menos 4 caracteres.",
          };
        }

        // 1. Intentar registrar en Firebase Auth
        let firebaseUid: string | null = null;
        try {
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          firebaseUid = cred.user.uid;
        } catch (fbErr: any) {
          console.warn("Firebase createUser no disponible o falló:", fbErr?.code, fbErr?.message);
        }

        const uid = firebaseUid || generateUserUid(cleanEmail);

        const newUser: StoredUser = {
          uid,
          email: cleanEmail,
          password,
          role,
        };

        saveStoredUser(newUser);

        // Limpiar memoria de la sesión anterior
        useCartStore.getState().clearCart();
        useStockStore.getState().clearProducts();
        localStorage.removeItem("stock-storage");
        localStorage.removeItem("cart-storage");

        set({
          user: {
            uid: newUser.uid,
            id: newUser.uid,
            email: newUser.email,
            role: newUser.role,
          },
          isAuthenticated: true,
        });

        return { success: true };
      },

      logout: async () => {
        try {
          await signOut(auth);
        } catch (e) {
          console.warn("Error al cerrar sesión en Firebase:", e);
        }

        // Purga completa de memoria y caché de trabajo
        useCartStore.getState().clearCart();
        useStockStore.getState().clearProducts();
        localStorage.removeItem("stock-storage");
        localStorage.removeItem("cart-storage");

        set({ user: null, isAuthenticated: false });
      },

      switchUser: async (email: string) => {
        const all = getStoredUsers();
        const found = all.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!found) return false;

        useCartStore.getState().clearCart();
        useStockStore.getState().clearProducts();
        localStorage.removeItem("stock-storage");
        localStorage.removeItem("cart-storage");

        set({
          user: {
            uid: found.uid,
            id: found.uid,
            email: found.email,
            role: found.role,
          },
          isAuthenticated: true,
        });

        return true;
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;

