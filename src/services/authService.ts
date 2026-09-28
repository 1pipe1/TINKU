import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type UserCredential,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  sendPhoneVerificationCode,
  verifyPhoneOtpCode,
  formatColombianPhone,
} from "./phoneAuthService";

export interface UserProfile {
  uid: string;
  email?: string | null;
  phoneNumber?: string | null;
  role: "admin" | "seller";
  nombreTienda?: string;
  createdAt?: string;
}

export const authService = {
  // Métodos de autenticación por teléfono (Phone Auth)
  sendPhoneVerificationCode,
  verifyPhoneOtpCode,
  formatColombianPhone,

  // Métodos de autenticación por correo/contraseña
  signInWithEmail: async (email: string, pass: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email.trim(), pass);
  },

  signUpWithEmail: async (email: string, pass: string): Promise<UserCredential> => {
    return createUserWithEmailAndPassword(auth, email.trim(), pass);
  },

  signOutUser: async (): Promise<void> => {
    return signOut(auth);
  },

  // Obtener o registrar perfil de usuario en Firestore (/usuarios/{uid})
  syncUserProfile: async (
    user: FirebaseUser,
    additionalData?: { role?: "admin" | "seller"; nombreTienda?: string }
  ): Promise<UserProfile> => {
    try {
      const userDocRef = doc(db, "usuarios", user.uid);
      const snapshot = await getDoc(userDocRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          uid: user.uid,
          email: data.email || user.email,
          phoneNumber: data.phoneNumber || user.phoneNumber,
          role: data.role || "admin",
          nombreTienda: data.nombreTienda || "Mi Tienda TINKU",
          createdAt: data.createdAt,
        };
      }

      // Si no existe en Firestore, crearlo
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || null,
        phoneNumber: user.phoneNumber || null,
        role: additionalData?.role || "admin",
        nombreTienda: additionalData?.nombreTienda || "Mi Tienda TINKU",
        createdAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, newProfile);
      return newProfile;
    } catch (error) {
      console.warn("No se pudo sincronizar perfil en Firestore (usando perfil local):", error);
      return {
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: additionalData?.role || "admin",
        nombreTienda: "Mi Tienda TINKU",
      };
    }
  },
};

export default authService;
