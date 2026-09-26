import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment00000000",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nexoio-dev.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nexoio-dev",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nexoio-dev.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:mockappid000",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ⚡ Suprimir avisos ruidosos de reintento/offline en consola
setLogLevel("error");

// ⚡ Habilitar caché persistente local (IndexedDB) y auto-detección de long polling:
// Evita consultar a los servidores de Firebase por documentos que ya están en el teléfono
// y permite conexión fluida incluso si los WebSockets son bloqueados por proxies o iframes.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
export const auth = getAuth(app);



