import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import type { Product } from "../types/product";

type StockState = {
  products: Product[];
  fetchProducts: (uid: string) => Promise<void>;
  clearProducts: () => void;
};

const useStockStore = create<StockState>()(
  persist(
    (set) => ({
      products: [],
      clearProducts: () => set({ products: [] }),
      fetchProducts: async (uid: string) => {
        if (!uid) {
          set({ products: [] });
          return;
        }

        // 🛡️ BARRERA MULTI-TENANT: Vaciamos la memoria inmediatamente antes de consultar
        // para garantizar que NUNCA se muestren productos de otro usuario.
        set({ products: [] });

        try {
          // 1. Consulta estricta a la subcolección privada del usuario: usuarios/{uid}/productos
          const userProductsRef = collection(db, "usuarios", uid, "productos");
          let snapshot = await getDocs(userProductsRef);

          // 🌟 Si es la primera vez que entra este tendero, le clonamos la plantilla inicial a su espacio privado
          if (snapshot.empty) {
            console.log("🚀 ¡Inicializando inventario privado para el usuario:", uid);
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
            }
          }

          // 2. Mapeo limpio de productos privados
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
        } catch (error) {
          console.error("Error fetching multi-tenant products:", error);
        }
      },
    }),
    {
      name: "stock-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useStockStore;
