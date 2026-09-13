import { useState, useEffect } from "react";
import { collection, serverTimestamp, doc, deleteDoc, runTransaction } from "firebase/firestore";
import { db } from "../../firebase";
import useCartStore from "../../store/useCartStore";
import useAuthStore from "../../store/useAuthStore";
import type { FC } from "react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
  
  // Para calculadora de cambio en efectivo
  const [cashReceived, setCashReceived] = useState<string>("");
  const [changeAmount, setChangeAmount] = useState<number>(0);

  const user = useAuthStore((state) => state.user);
  const cart = useCartStore((state) => state.cart);
  const setCart = useCartStore((state) => state.setCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const activeDraftId = useCartStore((state) => state.activeDraftId);
  const clearActiveDraftId = useCartStore((state) => state.clearActiveDraftId);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  
  const totalPrice = getTotalPrice();

  // Bloquear scroll de la página de fondo
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Recalcular devuelta
  useEffect(() => {
    const received = parseFloat(cashReceived) || 0;
    if (received >= totalPrice) {
      setChangeAmount(received - totalPrice);
    } else {
      setChangeAmount(0);
    }
  }, [cashReceived, totalPrice]);

  // Si se cierra el drawer, resetear estados temporales
  useEffect(() => {
    if (!isOpen) {
      setError("");
      setLoading(false);
      setCashReceived("");
    } else {
      setSuccess(false); // Si se abre de nuevo, quitar pantalla de éxito
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatMoney = (amount: number) => {
    return "$" + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Modificar cantidades de forma segura usando setCart de Zustand
  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
    } else {
      const updatedCart = cart.map(item =>
        item.id === productId ? { ...item, quantity: newQty } : item
      );
      setCart(updatedCart);
    }
  };

  // Botones de acceso rápido para efectivo recibido
  const handleQuickCash = (amount: number) => {
    const current = parseFloat(cashReceived) || 0;
    setCashReceived(String(current + amount));
  };

  const handleSetExactCash = () => {
    setCashReceived(String(totalPrice));
  };

  // Procesar la venta directamente (Estructura Multitenant Atómica)
  const handleConfirmPurchase = async () => {
    const uid = user?.uid || user?.uid;
    if (!uid) {
      setError("Debes iniciar sesión para procesar la venta.");
      return;
    }

    if (cart.length === 0) {
      setError("No hay productos en el carrito.");
      return;
    }

    const cashPaidAmount = parseFloat(cashReceived) || null;
    if (paymentMethod === "cash" && cashPaidAmount !== null && cashPaidAmount < totalPrice) {
      setError("El efectivo recibido es menor al total a pagar");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // EJECUTAR TRANSACCIÓN ATÓMICA MULTI-TENANT 🛡️
      await runTransaction(db, async (transaction) => {
        const productUpdates: Array<{ ref: any; newStock: number }> = [];

        // 1. Fase de Lectura (Obligatoria dentro de la carpeta del usuario activo)
        for (const item of cart) {
          // ⚡ SALTAR CONTROL DE STOCK PARA PRODUCTOS EXPRESS O VIRTUALES
          if (
            item.isExpress ||
            item.id.startsWith("express-") ||
            item.id.startsWith("venta-rapida-") ||
            item.id.startsWith("quick-")
          ) {
            continue;
          }

          const productRef = doc(db, "usuarios", uid, "productos", item.id);
          const productSnapshot = await transaction.get(productRef);

          if (!productSnapshot.exists()) {
            throw new Error(`El producto "${item.title || item.name}" no existe en tu inventario.`);
          }

          const productData = productSnapshot.data();
          const currentStock = productData.stock ?? 0;

          if (currentStock < item.quantity) {
            throw new Error(`¡Sin stock de ${item.title || item.name}! Quedan ${currentStock} un.`);
          }

          productUpdates.push({
            ref: productRef,
            newStock: currentStock - item.quantity
          });
        }

        // 2. Fase de Escritura (Descontar existencias solo de productos reales)
        productUpdates.forEach(({ ref, newStock }) => {
          transaction.update(ref, { stock: newStock });
        });

        // 3. Crear la orden de venta bajo la subcolección del usuario (Multi-tenant)
        const newOrderRef = doc(collection(db, "usuarios", uid, "orders"));
        transaction.set(newOrderRef, {
          customerName: "Cliente",
          paymentMethod,
          cashPaid: paymentMethod === "cash" ? cashPaidAmount : null,
          change: paymentMethod === "cash" && cashPaidAmount !== null ? cashPaidAmount - totalPrice : 0,
          items: cart.map((item) => ({
            id: item.id,
            title: item.title || item.name || "Producto sin nombre",
            price: item.price,
            quantity: item.quantity,
            image: item.image || "",
            isExpress: !!(item.isExpress || item.id.startsWith("express-")), // 🌟 Preserva bandera Express
            soldBy: user.email || "guest",
            sellerUid: uid,
          })),
          total: totalPrice,
          status: "completed",
          createdBy: user.uid || uid,
          createdAt: serverTimestamp(),
        });
      });

      // Si venimos reanudando un borrador o suspendida, borrarlo
      if (activeDraftId) {
        try {
          await deleteDoc(doc(db, "draftOrders", activeDraftId));
        } catch (e) {
          console.error("Error deleting resumed draft:", e);
        }
      }

      clearActiveDraftId();
      clearCart();
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Ocurrió un error al procesar el pedido.");
      console.error("Error processing direct order from drawer:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden flex justify-end">
      {/* Backdrop oscuro */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Panel del Drawer */}
      <div className="relative w-full max-w-md h-full bg-[#F0F4F8] shadow-2xl flex flex-col z-10 transition-all transform duration-300 ease-out">
        
        {/* CABECERA */}
        <div className="bg-white p-5 border-b border-gray-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <div>
              <h2 className="font-black text-gray-800 text-lg leading-tight">Mostrador de Cobro</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {cart.length} productos agregados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-red-500 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* PANTALLA DE ÉXITO */}
        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white">
            <div className="text-7xl mb-4">🎉</div>
            <h3 className="text-2xl font-black text-green-600">¡Venta Coronada!</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-xs leading-relaxed">
              La venta ha sido registrada y el inventario se descontó correctamente en la nube.
            </p>

            <div className="mt-8 w-full space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-500/10 transition-all text-sm uppercase tracking-wider cursor-pointer"
              >
                Volver a Vender 🏪
              </button>
            </div>
          </div>
        ) : cart.length === 0 ? (
          /* CARRITO VACÍO */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-6xl mb-4">🛒</span>
            <h3 className="font-black text-gray-700 text-lg">Tu carrito está vacío</h3>
            <p className="text-gray-400 text-xs mt-1 max-w-xs">
              Toca los productos del catálogo de fondo para agregarlos al mostrador.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-white border border-gray-250 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
            >
              Ver productos
            </button>
          </div>
        ) : (
          /* CUERPO DEL DRAWER CON PRODUCTOS */
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* LISTA DE ITEMS */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5 space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalle del Pedido</h3>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                    {/* Imagen o placeholder */}
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 shrink-0">
                      {item.image && item.image.trim() !== "" ? (
                        <img src={item.image} alt={item.title || item.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-lg">
                          {item.isExpress || item.id.startsWith("express-") ? "⚡" : "📦"}
                        </span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-xs truncate">
                        {item.title || item.name}
                        {(item.isExpress || item.id.startsWith("express-")) && (
                          <span className="ml-1 text-[9px] font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                            Express
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-orange-500 font-black mt-0.5">{formatMoney(item.price)}</p>
                    </div>
                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full shrink-0">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="text-xs font-bold text-gray-500 hover:text-red-500 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white transition-all cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-gray-700 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="text-xs font-bold text-gray-500 hover:text-green-500 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white transition-all cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    {/* Basura */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                      title="Quitar del carrito"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* MÉTODOS DE PAGO */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5 space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Método de Pago</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-3 rounded-xl border-2 font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === "cash"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-100 hover:border-gray-200 text-gray-600 bg-gray-50"
                  }`}
                >
                  <span className="text-xl">💵</span>
                  <span className="text-xs">Efectivo</span>
                </button>
                <button
                  onClick={() => {
                    setPaymentMethod("transfer");
                    setCashReceived(""); // Limpiar efectivo si cambia
                  }}
                  className={`p-3 rounded-xl border-2 font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === "transfer"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-100 hover:border-gray-200 text-gray-600 bg-gray-50"
                  }`}
                >
                  <span className="text-xl">🏦</span>
                  <span className="text-xs">Banco / Digital</span>
                </button>
              </div>
            </div>

            {/* CALCULADORA DE CAMBIO (Solo para efectivo) */}
            {paymentMethod === "cash" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Efectivo Recibido</h3>
                  <button
                    onClick={handleSetExactCash}
                    className="text-[10px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
                  >
                    Exacto 👉 {formatMoney(totalPrice)}
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    placeholder="¿Con cuánto pagaron?"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full pl-8 pr-12 py-3 rounded-xl border border-gray-200 font-black text-sm text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                  {cashReceived && (
                    <button
                      onClick={() => setCashReceived("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 text-xs transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Accesos rápidos de ráfaga */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[5000, 10000, 20000, 50000].map((val) => (
                    <button
                      key={`quick-${val}`}
                      onClick={() => handleQuickCash(val)}
                      className="py-2 bg-gray-50 border border-gray-100 hover:bg-gray-100 text-[10px] font-black text-gray-600 rounded-lg transition-colors cursor-pointer"
                    >
                      +${val / 1000}k
                    </button>
                  ))}
                </div>

                {/* Devuelta en letras gigantes */}
                {parseFloat(cashReceived) >= totalPrice && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-green-700">Devuelta al cliente:</span>
                    <span className="text-xl font-black text-green-700">{formatMoney(changeAmount)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Alertas de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-xs font-semibold leading-relaxed">
                ⚠️ {error}
              </div>
            )}

          </div>
        )}

        {/* PIE DE PÁGINA FIJO CON TOTALES Y BOTÓN COBRAR (Solo si no está en Éxito) */}
        {!success && cart.length > 0 && (
          <div className="bg-white border-t border-gray-100 p-4 space-y-3.5 shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total a Cobrar</span>
              <span className="text-2xl font-black text-orange-600">{formatMoney(totalPrice)}</span>
            </div>

            <button
              onClick={handleConfirmPurchase}
              disabled={loading || (paymentMethod === "cash" && (!cashReceived || parseFloat(cashReceived) < totalPrice))}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 active:scale-98 text-white font-black py-4 rounded-2xl text-base transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Registrando Venta...</span>
                </>
              ) : (
                <>
                  <span>✅ Registrar Cobro</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
