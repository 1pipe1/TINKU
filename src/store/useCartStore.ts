import { create } from "zustand";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";

type Product = {
  id: string;
  title?: string;
  name?: string;
  price?: number;
  image?: string;
  // stock disponible en inventario (opcional). Si está presente, el store respetará este límite.
  stock?: number;
  quantity?: number;
};

type CartItem = Product & {
  quantity: number;
};

type CartState = {
  cart: CartItem[];
  activeDraftId: string | null;
  setActiveDraftId: (draftId: string) => void;
  clearActiveDraftId: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setCart: (newCart: CartItem[]) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

// 🛡️ MOTOR DE PERSISTENCIA MULTI-TENANT PARA EL CARRITO
// Leemos directamente del localStorage de la sesión para evitar importaciones circulares en TypeScript
const multiTenantCartStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const authData = localStorage.getItem("auth-storage");
    let userId = "";
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        userId = parsed.state?.user?.uid || "";
      } catch (e) {
        console.error("Error parsing auth-storage in cart storage", e);
      }
    }
    const finalKey = userId ? `${name}-${userId}` : name;
    return localStorage.getItem(finalKey);
  },
  setItem: (name: string, value: string): void => {
    const authData = localStorage.getItem("auth-storage");
    let userId = "";
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        userId = parsed.state?.user?.uid || "";
      } catch (e) {
        console.error("Error parsing auth-storage in cart storage", e);
      }
    }
    const finalKey = userId ? `${name}-${userId}` : name;
    localStorage.setItem(finalKey, value);
  },
  removeItem: (name: string): void => {
    const authData = localStorage.getItem("auth-storage");
    let userId = "";
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        userId = parsed.state?.user?.uid || "";
      } catch (e) {
        console.error("Error parsing auth-storage in cart storage", e);
      }
    }
    const finalKey = userId ? `${name}-${userId}` : name;
    localStorage.removeItem(finalKey);
  },
};

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      activeDraftId: null,

      setActiveDraftId: (draftId: string) => set({ activeDraftId: draftId }),
      clearActiveDraftId: () => set({ activeDraftId: null }),

      addToCart: (product: Product) => {
        const cart = get().cart;
        const existingItem = cart.find(
          (item) => String(item.id) === String(product.id)
        );

        // Respetar la cantidad enviada desde el componente (por ejemplo, al seleccionar 3 unidades)
        const qty = Math.max(1, Number(product.quantity ?? 1));

        // Si el producto trae stock definido, respetar el límite de stock tanto al crear como al actualizar.
        const stock =
          typeof product.stock === "number" ? Math.max(0, Number(product.stock)) : undefined;

        if (existingItem) {
          if (typeof stock === "number") {
            const available = Math.max(0, stock - existingItem.quantity);
            const toAdd = Math.min(qty, available);
            if (toAdd <= 0) {
              // Nada para añadir (ya alcanzó el stock) — no modificar el carrito
              return;
            }
            set({
              cart: cart.map((item) =>
                String(item.id) === String(product.id)
                  ? { ...item, quantity: item.quantity + toAdd }
                  : item
              ),
            });
          } else {
            // Sin información de stock, sumar la cantidad solicitada
            set({
              cart: cart.map((item) =>
                String(item.id) === String(product.id)
                  ? { ...item, quantity: item.quantity + qty }
                  : item
              ),
            });
          }
        } else {
          // Nuevo item: si hay stock definido, no exceder el stock; si no, usar qty
          const initialQty = typeof stock === "number" ? Math.min(qty, stock) : qty;
          if (initialQty <= 0) return; // nada que agregar
          set({ cart: [...cart, { ...product, quantity: initialQty }] });
        }
      },

      removeFromCart: (productId: string) => {
        set({
          cart: get().cart.filter(
            (item) => String(item.id) !== String(productId)
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      setCart: (newCart: CartItem[]) => set({ cart: newCart }),

      getTotalItems: () =>
        get().cart.reduce((total, item) => total + item.quantity, 0),

      getTotalPrice: () =>
        get().cart.reduce(
          (total, item) => total + (item.price ?? 0) * item.quantity,
          0
        ),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => multiTenantCartStorage), // 🔥 Aquí pasa la magia dinámica sin TypeScript enojado
    }
  )
);

export default useCartStore;