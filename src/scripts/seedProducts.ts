import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, writeBatch } from "firebase/firestore";
import { DEFAULT_PRODUCTS } from "../data/defaultProducts";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.VITE_FIREBASE_APP_ID || "",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log(`🚀 Iniciando siembra de ${DEFAULT_PRODUCTS.length} productos predeterminados...`);

  // 1. Sembrar en la plantilla global "productos"
  const globalRef = collection(db, "productos");
  const batch = writeBatch(db);

  for (const prod of DEFAULT_PRODUCTS) {
    const docRef = doc(globalRef, prod.id);
    batch.set(docRef, {
      
      nombre: prod.name || prod.title,
      categoria: prod.category || "General",
      costo: prod.cost || 0,
      precio: prod.price || 0,
      stock: prod.stock ?? 20,
      image: prod.image || "",
    }, { merge: true });
  }

  await batch.commit();
  console.log(`✅ ¡Éxito! ${DEFAULT_PRODUCTS.length} productos sembrados en Firestore /productos`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error en seedProducts:", err);
  process.exit(1);
});
