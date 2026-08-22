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
          // 1. CAMBIO CLAVE: Apuntar a 'productos' (en español)
          const snapshot = await getDocs(collection(db, "productos"));

          // 2. MAPEO: Convertir los datos de Firestore al formato de tu ProductCard
          const products = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id, // TNK-001, TNK-004...
              sku: data.sku || docSnap.id,
              title: data.nombre || data.title || "", // Mapea 'nombre' a 'title'
              name: data.nombre || data.name || "",
              price: data.precio ?? data.price ?? 0, // Mapea 'precio' a 'price'
              cost: data.costo ?? 0,
              stock: data.stock ?? 20,
              category: data.categoria || "General",
              image: data.image || "",
            };
          }) as unknown as Product[];

          console.log(
            "¡15 Productos reales de TINKU cargados desde Firestore!",
            products,
          );
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
