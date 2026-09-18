import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import type { Product } from "../types/product";
import { DEFAULT_PRODUCTS } from "../data/defaultProducts";

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
          let snapshot = await getDocs(userProductsRef);

          // 🌟 Si es la primera vez que entra este tendero, le clonamos la plantilla inicial a su espacio privado
          if (snapshot.empty) {
            console.log("🚀 Inicializando inventario para el usuario:", uid);
            try {
              const templateSnapshot = await getDocs(collection(db, "productos"));
              
              if (!templateSnapshot.empty) {
                const batch = writeBatch(db);
                
                templateSnapshot.docs.forEach((docSnap) => {
                  const data = docSnap.data();
                  const newDocRef = doc(userProductsRef, docSnap.id);
                  
                  batch.set(newDocRef, {
                    nombre: data.nombre || data.title || "",
                    categoria: data.categoria || data.category || "General",
                    precio: data.precio || data.price || 0,
                    costo: data.costo || 0,
                    stock: data.stock ?? 20,
                    image: data.image || "",
                    sku: data.sku || docSnap.id
                  });
                });

                await batch.commit();
                snapshot = await getDocs(userProductsRef);
              } else if (DEFAULT_PRODUCTS && DEFAULT_PRODUCTS.length > 0) {
                // Fallback automático: si la plantilla global de Firestore no existe,
                // sembramos el catálogo predeterminado de Tinku (41 productos)
                const batch = writeBatch(db);
                DEFAULT_PRODUCTS.forEach((prod) => {
                  const newDocRef = doc(userProductsRef, prod.id);
                  batch.set(newDocRef, {
                    nombre: prod.name || prod.title,
                    categoria: prod.category || "General",
                    precio: prod.price || 0,
                    costo: prod.cost || 0,
                    stock: prod.stock ?? 20,
                    image: prod.image || "",
                    sku: prod.sku || prod.id,
                  });
                });

                await batch.commit();
                snapshot = await getDocs(userProductsRef);
              }
            } catch (e) {
              console.warn("No se pudo clonar plantilla en Firestore, inicializando en local:", e);
            }
          }

          // 2. Mapeo limpio de productos privados si Firestore respondió con datos
          if (!snapshot.empty) {
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
                costPending: data.costPending ?? false,
                stockPending: data.stockPending ?? false,
              };
            }) as unknown as Product[];

            set({ products });
            return;
          }
        } catch (error) {
          console.warn("Firestore offline o no configurado, usando inventario local:", error);
        }

        // Fallback resiliente: usar productos existentes en localStorage o catálogo predeterminado
        set((state) => {
          if (state.products && state.products.length > 0) {
            return { products: state.products };
          }
          return { products: DEFAULT_PRODUCTS };
        });
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
