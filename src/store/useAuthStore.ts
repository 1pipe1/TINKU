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
  role: "admin" | "seller" | "pending";
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
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password,
          );
          const firebaseUser = userCredential.user;

          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: "admin",
            },
            isAuthenticated: true,
          });

          return true;
        } catch (error: any) {
          console.error(
            "Error exacto de Firebase Auth:",
            error.code,
            error.message,
          );
          return false;
        }
      },

      logout: async () => {
        await signOut(auth);
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);

export default useAuthStore;
