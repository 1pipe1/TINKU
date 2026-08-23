import { create } from "zustand";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import type { Product } from "../types/product";

type StockState = {
  products: Product[];
  fetchProducts: (uid: string) => Promise<void>;
};

// 🌟 Tienda limpia sin 'persist' para evitar que se cruce el caché entre usuarios
const useStockStore = create<StockState>((set) => ({
  products: [],
  fetchProducts: async (uid: string) => {
    if (!uid) return;

    try {
      // 1. Apuntamos al inventario privado del usuario activo
      const userProductsRef = collection(db, "usuarios", uid, "productos");
      let snapshot = await getDocs(userProductsRef);

      // 🌟 Si es un usuario nuevo (carpeta vacía), clonamos los 41 productos plantilla
      if (snapshot.empty) {
        console.log(
          "🚀 ¡Nuevo tendero detectado! Inicializando su tienda con los 41 productos de plantilla...",
        );

        // Traemos el molde global de la colección "productos"
        const templateSnapshot = await getDocs(collection(db, "productos"));

        if (!templateSnapshot.empty) {
          const batch = writeBatch(db); // Preparamos un paquete de escritura única

          templateSnapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            const newDocRef = doc(userProductsRef, docSnap.id); // Usamos el mismo ID/SKU

            batch.set(newDocRef, {
              nombre: data.nombre || data.title || "",
              categoria: data.categoria || data.category || "General",
              precio: data.precio || data.price || 0,
              costo: data.costo || 0,
              stock: data.stock || 20, // Stock inicial perfecto de 20 para todos
              image: data.image || "",
              sku: data.sku || docSnap.id,
            });
          });

          // Guardamos todo en Firestore de un solo golpe
          await batch.commit();

          // Volvemos a consultar la subcolección, que ahora ya tiene la copia privada
          snapshot = await getDocs(userProductsRef);
        }
      }

      // 2. Mapeamos los productos limpios y frescos de Firestore
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
      console.error(
        "Error al cargar o inicializar el inventario multi-tenant:",
        error,
      );
    }
  },
}));

export default useStockStore;
