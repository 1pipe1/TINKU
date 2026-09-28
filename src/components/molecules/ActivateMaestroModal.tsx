import { useState, useEffect, useRef } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import useStockStore from "../../store/useStockStore";
import useCartStore from "../../store/useCartStore";
import useAuthStore from "../../store/useAuthStore";
import type { MaestroProduct } from "../../data/catalogoMaestro";
import type { Product } from "../../types/product";
import { toast } from "sonner";

interface ActivateMaestroModalProps {
  isOpen: boolean;
  product: MaestroProduct | null;
  onClose: () => void;
  onActivated?: (product: Product) => void;
}

export default function ActivateMaestroModal({
  isOpen,
  product,
  onClose,
  onActivated,
}: ActivateMaestroModalProps) {
  const [priceStr, setPriceStr] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const user = useAuthStore((state) => state.user);
  const addProductLocally = useStockStore((state) => state.addProductLocally);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    if (isOpen) {
      setPriceStr("");
      setIsSaving(false);
      // 🔥 Cerrar inmediatamente cualquier teclado virtual nativo abierto previamente
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [isOpen, product]);

  // Manejador de teclado físico / barcode scanners sin abrir el teclado del celular
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        setPriceStr((prev) => {
          if (prev === "" && e.key === "0") return prev;
          return prev.length < 8 ? prev + e.key : prev;
        });
      } else if (e.key === "Backspace") {
        setPriceStr((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, priceStr, isSaving]);


  if (!isOpen || !product) return null;

  const currentPrice = parseInt(priceStr, 10) || 0;

  // Manejador del teclado en pantalla
  const handleKeyClick = (key: string) => {
    if (key === "backspace") {
      setPriceStr((prev) => prev.slice(0, -1));
    } else if (key === "clear") {
      setPriceStr("");
    } else if (key === "00") {
      if (priceStr.length > 0 && priceStr.length <= 6) {
        setPriceStr((prev) => prev + "00");
      }
    } else {
      if (priceStr.length < 8) {
        // Evita ceros a la izquierda
        if (priceStr === "" && key === "0") return;
        setPriceStr((prev) => prev + key);
      }
    }
  };

  // Botones de acceso rápido a precios comunes colombianos
  const handleQuickPrice = (value: number) => {
    setPriceStr(value.toString());
  };

  // Guardado Just-in-Time y Cobro
  const handleConfirm = async () => {
    if (currentPrice <= 0) {
      toast.error("Ingresa un precio de venta mayor a $0");
      return;
    }

    setIsSaving(true);
    const uid = user?.uid || (user as any)?.id || "demo-tinku-user";
    const productId = product.id.replace(/^cm-/, "tnd-");

    const newProduct: Product = {
      id: productId,
      title: product.nombre,
      name: product.nombre,
      category: product.categoria || "General",
      price: currentPrice,
      cost: 0,
      stock: 999, // Stock inicial virtual para permitir ventas fluidas sin trabas
      image: "",
      icono: product.icono || "📦",
      costPending: true,
      stockPending: true,
    };

    try {
      // 1. Guardar en Firestore del tendero (usuarios/{uid}/productos)
      if (uid && uid !== "demo-tinku-user") {
        const prodRef = doc(db, "usuarios", uid, "productos", productId);
        await setDoc(prodRef, {
          nombre: newProduct.title,
          categoria: newProduct.category,
          precio: newProduct.price,
          costo: 0,
          stock: 999,
          image: "",
          icono: newProduct.icono,
          sku: productId,
          costPending: true,
          stockPending: true,
          createdAt: new Date().toISOString(),
        });
      }

      // 2. Agregar al inventario local de Zustand
      addProductLocally(newProduct);

      // 3. Agregar directamente al carrito de compras para cobrar en el acto
      addToCart({ ...newProduct, quantity: 1 });

      toast.success(`"${product.nombre}" activado a $${currentPrice.toLocaleString("es-CO")}`);

      if (onActivated) {
        onActivated(newProduct);
      }

      onClose();
    } catch (error) {
      console.error("Error al activar producto del catálogo maestro:", error);
      // Fallback: Si Firestore falla o está offline, activar en local y cobrar
      addProductLocally(newProduct);
      addToCart({ ...newProduct, quantity: 1 });
      toast.success(`"${product.nombre}" activado localmente a $${currentPrice.toLocaleString("es-CO")}`);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-150 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera del Producto */}
        <div className="bg-slate-900 text-white p-4.5 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl sm:text-4xl bg-white/10 p-2 rounded-2xl shrink-0">
              {product.icono || "📦"}
            </span>
            <div className="min-w-0">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md mb-1">
                {product.categoria || "Catálogo Sugerido"}
              </span>
              <h2 className="text-base sm:text-lg font-black text-white truncate leading-tight">
                {product.nombre}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-lg cursor-pointer transition-all shrink-0 ml-2"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo / Pantalla de Precio */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="text-center mb-3">
              <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
                ¿A cómo lo vendes en tu tienda?
              </p>
              
              {/* Display Gigante del Precio */}
              <div className="mt-2 py-3 px-4 bg-orange-50/70 border-2 border-orange-200 rounded-2xl flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-black text-orange-500 mr-1.5 select-none">
                  $
                </span>
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {currentPrice > 0
                    ? currentPrice.toLocaleString("es-CO")
                    : "0"}
                </span>
              </div>
            </div>


            {/* Accesos Rápidos de Precios Típicos */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {[1000, 2000, 3000, 5000].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => handleQuickPrice(quick)}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-700 rounded-xl text-xs font-black transition-all cursor-pointer select-none active:scale-95"
                >
                  ${quick.toLocaleString("es-CO")}
                </button>
              ))}
            </div>

            {/* Teclado Numérico Gigante y Táctil */}
            <div className="grid grid-cols-3 gap-2 select-none mb-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0"].map(
                (digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeyClick(digit)}
                    className="h-12 sm:h-13 bg-slate-100 hover:bg-slate-200 active:bg-orange-500 active:text-white rounded-xl text-xl sm:text-2xl font-black text-slate-800 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                  >
                    {digit}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => handleKeyClick("backspace")}
                className="h-12 sm:h-13 bg-red-50 hover:bg-red-100 text-red-600 active:bg-red-500 active:text-white rounded-xl text-lg font-black transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                title="Borrar dígito"
              >
                ⌫
              </button>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSaving || currentPrice <= 0}
              className="flex-2 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-sm sm:text-base shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              {isSaving ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <span>⚡ Activar y Cobrar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
