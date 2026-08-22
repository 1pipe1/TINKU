import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

type AuthUser = {
  uid: string;
  email: string | null;
  role: "admin" | "seller" | "pending"; // optional role property
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  initAuth: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      initAuth: () => {
        onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            set({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: "admin"
              },
              isAuthenticated: true,
            });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        });
      },

      login: async (email: string, password: string) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        set({
          user: {
            uid: result.user.uid,
            email: result.user.email,
            role: "admin", // temporal para pruebas
          },
          isAuthenticated: true,
        });
        return true;
      },

      logout: async () => {
        await signOut(auth);
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: "auth-storage" },
  ),
);

export default useAuthStore;
