import { create } from "zustand";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import type { Product } from "../types/product";

type StockState = {
  products: Product[];
  fetchProducts: (uid: string) => Promise<void>; 
};

// 🌟 TIENDA DEFINITIVA SIN PERSISTENCIA (Inmune a cruce de caché entre usuarios)
const useStockStore = create<StockState>((set) => ({
  products: [],
  fetchProducts: async (uid: string) => {
    if (!uid) {
      console.warn("Se requiere un UID válido para cargar productos.");
      return;
    }

    try {
      // 1. Apuntamos a la subcolección privada de productos del usuario
      const userProductsRef = collection(db, "usuarios", uid, "productos");
      let snapshot = await getDocs(userProductsRef);

      // 🌟 Si el usuario es nuevo y su inventario privado está vacío, clonamos la plantilla global
      if (snapshot.empty) {
        console.log("🚀 ¡Nuevo tendero detectado! Inicializando su tienda con la plantilla global...");
        
        // Traemos los productos de la colección global "productos"
        const templateSnapshot = await getDocs(collection(db, "productos"));
        
        if (!templateSnapshot.empty) {
          const batch = writeBatch(db);
          
          templateSnapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            // Creamos cada producto dentro de su subcolección privada usando su mismo ID o SKU
            const newDocRef = doc(userProductsRef, docSnap.id);
            
            batch.set(newDocRef, {
              nombre: data.nombre || data.title || "",
              categoria: data.categoria || data.category || "General",
              precio: data.precio || data.price || 0,
              costo: data.costo || 0,
              stock: 20, // 🛡️ FORZADO A 20: Todo nuevo usuario arranca con stock fresco de 20 un.
              image: data.image || "",
              sku: data.sku || docSnap.id
            });
          });

          // Guardamos toda la copia en un solo bloque de Firebase
          await batch.commit();
          
          // Volvemos a leer para cargar los productos recién creados
          snapshot = await getDocs(userProductsRef);
        }
      }

      // 2. Mapeamos las propiedades de Firestore al tipo Product que espera tu frontend
      const products = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          sku: data.sku || docSnap.id,
          title: data.nombre || data.title || "",
          name: data.nombre || data.name || "",
          price: data.precio ?? data.price ?? 0,
          cost: data.costo ?? 0,
          stock: data.stock ?? 20, // 🛡️ Si por alguna razón falta, por defecto es 20
          category: data.categoria || "General",
          image: data.image || "",
        };
      }) as unknown as Product[];

      // Guardamos en el estado de Zustand
      set({ products });
    } catch (error) {
      console.error("Error fetching multi-tenant products:", error);
    }
  },
}));

export default useStockStore;
