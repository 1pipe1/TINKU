import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import type { Product } from "../types/product";


type StockState = {
  products: Product[];
  fetchProducts: (uid: string, force?: boolean) => Promise<void>;
  clearProducts: () => void;
  updateProductLocally: (product: Product) => void;
  addProductLocally: (product: Product) => void;
  deleteProductLocally: (id: string) => void;
  deductStock: (items: { id: string; quantity: number }[]) => void;
};

const useStockStore = create<StockState>()(
  persist(
    (set, get) => ({
      products: [],
      clearProducts: () => set({ products: [] }),
      fetchProducts: async (uid: string, force = false) => {
        if (!uid) {
          set({ products: [] });
          return;
        }

        // Cache first: si ya existen productos en Zustand, evitamos consultar Firestore salvo recarga forzada
        const cached = get().products;
        if (!force && cached && cached.length > 0) {
          return;
        }

        try {
          // 1. Consulta estricta a la subcolección privada del usuario: usuarios/{uid}/productos
          const userProductsRef = collection(db, "usuarios", uid, "productos");
          const snapshot = await getDocs(userProductsRef);

          // 🌟 Estrategia Catálogo Maestro Just-in-Time:
          // Si el tendero no tiene productos aún, su inventario inicia en 0.
          // Los productos se activan desde el Catálogo Maestro a demanda al asignarles precio.
          if (snapshot.empty) {
            set({ products: [] });
            return;
          }

          // 2. Mapeo limpio de productos privados si Firestore respondió con datos
          const products = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              sku: data.sku || docSnap.id,
              title: data.nombre || data.title || "",
              name: data.nombre || data.name || "",
              price: data.precio ?? data.price ?? 0,
              cost: data.costo ?? 0,
              stock: data.stock ?? 0,
              category: data.categoria || "General",
              image: data.image || "",
              icono: data.icono || "",
              costPending: data.costPending ?? false,
              stockPending: data.stockPending ?? false,
            };
          }) as unknown as Product[];

          set({ products });
          return;
        } catch (error) {
          console.warn("Firestore offline o no configurado, usando inventario local:", error);
        }

        // Fallback resiliente: usar productos existentes en estado local
        set((state) => ({
          products: state.products || [],
        }));
      },


      updateProductLocally: (product: Product) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === product.id ? product : p)),
        }));
      },

      addProductLocally: (product: Product) => {
        set((state) => ({
          products: [product, ...state.products],
        }));
      },

      deleteProductLocally: (id: string) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      deductStock: (items: { id: string; quantity: number }[]) => {
        set((state) => ({
          products: state.products.map((p) => {
            const itemPurchased = items.find((it) => it.id === p.id);
            if (itemPurchased) {
              return {
                ...p,
                stock: Math.max(0, (p.stock ?? 0) - itemPurchased.quantity),
              };
            }
            return p;
          }),
        }));
      },
    }),
    {
      name: "stock-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useStockStore;
