import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import type { Product } from "../types/product";

type StockState = {
  products: Product[];
  // 👇 AQUÍ ESTÁ EL TRUCO: Le decimos a TypeScript que 'uid' es un argumento opcional
  fetchProducts: (uid?: string) => Promise<void>;
};

const useStockStore = create<StockState>()(
  persist(
    (set) => ({
      products: [],
      fetchProducts: async (uid?: string) => {
        try {
          // Si no se recibe un UID, intenta obtenerlo del estado persistido de autenticación.
          let persistedUid: string | undefined;
          try {
            const authStorage = localStorage.getItem("auth-storage");
            const authState = authStorage ? JSON.parse(authStorage) : undefined;
            persistedUid = authState?.state?.user?.uid;
          } catch {
            // El UID recibido por parámetro sigue siendo válido aunque el storage no pueda leerse.
          }

          const activeUid = uid || persistedUid;

          if (!activeUid) {
            console.warn("No se encontró un UID válido para cargar productos.");
            return;
          }

          // Consultamos la subcolección del usuario activo en Firestore
          const snapshot = await getDocs(
            collection(db, "usuarios", activeUid, "productos"),
          );

          const products = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              sku: data.sku || docSnap.id,
              title: data.nombre || data.title || "",
              name: data.nombre || data.name || "",
              price: data.precio ?? data.price ?? 0,
              cost: data.costo ?? 0,
              stock: data.stock ?? 20,
              category: data.categoria || "General",
              image: data.image || "",
            };
          }) as unknown as Product[];

          set({ products });
        } catch (error) {
          console.error("Error fetching products from Firestore:", error);
        }
      },
    }),
    {
      name: "stock-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useStockStore;