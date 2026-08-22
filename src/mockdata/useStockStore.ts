import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import type { Product } from "../types/product";

type StockState = {
  products: Product[];
  fetchProducts: () => Promise<void>;
};

const useStockStore = create<StockState>()(
  persist(
    (set) => ({
      products: [],
      fetchProducts: async () => {
        try {
          // 1. Apuntamos a la colección 'productos' (en español)
          const snapshot = await getDocs(collection(db, "productos"));

          // 2. Mapeamos las llaves de Firestore al tipo Product de React
          const products = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              name: data.nombre || data.name || "",
              title: data.nombre || data.title || "",
              price: data.precio || data.price || 0,
              cost: data.costo || 0,
              stock: data.stock || 0,
              category: data.categoria || "General",
              sku: data.sku || docSnap.id,
              ...data, // Mantiene cualquier otro campo existente
            };
          }) as unknown as Product[];

          console.log("Productos cargados desde Firestore:", products);
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
