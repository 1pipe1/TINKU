import { useState, useEffect, useRef } from "react";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import useAuthStore from "../../store/useAuthStore";
import type { FC } from "react";

interface QuickCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickItem {
  id: string;
  title: string;
  price: number;
}

const QuickCheckoutDrawer: FC<QuickCheckoutDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [inputVal, setInputVal] = useState<string>("");
  const [addedItems, setAddedItems] = useState<QuickItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const isSubmittingRef = useRef(false);
  const user = useAuthStore((state) => state.user);

  // Bloquear scroll del body de fondo cuando el drawer esté abierto
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

  if (!isOpen) return null;

  // Formateador de moneda en pesos colombianos ($ COP)
  const formatMoney = (amount: number) => {
    return "$" + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Manejo de clicks en el teclado numérico
  const handleNumClick = (num: string) => {
    setError("");
    if (num === "000" && (inputVal === "" || inputVal === "0")) return;
    if (inputVal === "0" && num !== "000") {
      setInputVal(num);
    } else {
      setInputVal((prev) => prev + num);
    }
  };

  // Botón Borrar (Backspace)
  const handleBackspace = () => {
    setInputVal((prev) => (prev.length > 1 ? prev.slice(0, -1) : ""));
  };

  // Botón Limpiar Todo (C)
  const handleClearAll = () => {
    setInputVal("");
    setAddedItems([]);
    setError("");
  };

  // Botón Más (+): Sumar producto actual a la cuenta
  const handleAddItem = () => {
    const price = parseFloat(inputVal);
    if (isNaN(price) || price <= 0) {
      setError("Digita un valor válido mayor a $0");
      return;
    }
    if (price < 50) {
      setError("El valor mínimo es $50");
      return;
    }

    const newItem: QuickItem = {
      id: `quick-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: `Venta Rápida #${addedItems.length + 1}`,
      price: price,
    };

    setAddedItems((prev) => [...prev, newItem]);
    setInputVal("");
    setError("");
  };

  // Calcular totales temporales en vivo
  const currentPriceInput = parseFloat(inputVal) || 0;
  const itemsTotal = addedItems.reduce((sum, item) => sum + item.price, 0);
  const totalLive = itemsTotal + currentPriceInput;

  // Función Principal: Cobrar y guardar directamente en Firestore
  const handleProcessCharge = async (method: "cash" | "transfer") => {
    if (loading || isSubmittingRef.current) return; // 🔥 Evita doble envío en celulares
    isSubmittingRef.current = true;
    setError("");
    setLoading(true);

    try {
      // 1. Preparar lista de productos virtuales
      let finalItemsToCharge = [...addedItems];

      // Si hay un número a medias en la pantalla del teclado, lo agregamos automáticamente
      if (currentPriceInput > 0) {
        if (currentPriceInput < 50) {
          throw new Error(
            "El valor del último producto debe ser de mínimo $50",
          );
        }
        finalItemsToCharge.push({
          id: `quick-item-${Date.now()}`,
          title: `Venta Rápida #${addedItems.length + 1}`,
          price: currentPriceInput,
        });
      }

      const finalTotal = finalItemsToCharge.reduce(
        (sum, item) => sum + item.price,
        0,
      );

      if (finalTotal <= 0) {
        throw new Error("Digita o sume al menos un valor para cobrar.");
      }

      const uid = user?.uid || "demo-tinku-user";
      // 1. Generar UN SOLO ID compartido para Firestore y LocalStorage
      const orderRef = doc(collection(db, "usuarios", uid, "orders"));
      const sharedOrderId = orderRef.id;

      // 2. Armar la orden idéntica al esquema atómico de órdenes reales de TINKU
      const orderPayload = {
        customerName: "Cliente Express",
        paymentMethod: method,
        cashPaid: method === "cash" ? finalTotal : null,
        change: 0,
        items: finalItemsToCharge.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: 1,
          image: "", // Ítem virtual sin foto
          soldBy: user?.email || "guest",
        })),
        total: finalTotal,
        status: "completed",
        createdAt: serverTimestamp(),
      };

      // 3. Insertar en Firestore si está disponible con el ID único
      try {
        await setDoc(orderRef, orderPayload);
      } catch (fsErr) {
        console.warn("Firestore no disponible para cobro express, guardando local:", fsErr);
      }

      // Respaldo local garantizado con el MISMO ID
      const localOrder = {
        ...orderPayload,
        id: sharedOrderId,
        createdAt: new Date().toISOString(),
      };
      const existingOrdersStr = localStorage.getItem(`tinku_orders_${uid}`);
      const existingOrders = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
      const filteredExisting = existingOrders.filter((o: any) => o.id !== sharedOrderId);
      localStorage.setItem(`tinku_orders_${uid}`, JSON.stringify([localOrder, ...filteredExisting]));

      // Notificar al Dashboard y demás componentes para recalcular inmediatamente
      window.dispatchEvent(new Event("tinku_orders_updated"));

      // Mostrar animación de éxito por un segundo
      setSuccess(true);
      setTimeout(() => {
        handleClearAll();
        setSuccess(false);
        setLoading(false);
        isSubmittingRef.current = false;
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Error al procesar el cobro.");
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Fondo clickeable para cerrar */}
      <div
        className="absolute inset-0"
        onClick={!loading ? onClose : undefined}
      />

      {/* Cajón Deslizable (Bottom Sheet) */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-94vh animate-slide-up z-0 border-t border-gray-100">
        {/* Barra superior de arrastre estético */}
        <div className="mx-auto my-3 h-1.5 w-12 rounded-full bg-gray-300 shrink-0" />

        {/* Cabecera del Drawer (FIJA) */}
        <div className="px-5 pb-3 flex justify-between items-center border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Cobro Express</h2>
              <p className="text-xs text-gray-400">
                Modo ráfaga: calculadora rápida
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
          >
            ❌
          </button>
        </div>

        {/* Pantalla de Éxito o Contenido Principal */}
        {success ? (
          <div className="p-12 flex flex-col items-center justify-center text-center bg-green-50/50 min-h-300px flex-1">
            <div className="text-6xl animate-bounce mb-4">🎉</div>
            <h3 className="text-2xl font-black text-green-600">
              ¡Venta Coronada!
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Guardada en el historial y sumada a la caja
            </p>
            <div className="mt-4 px-4 py-2 bg-green-500 text-white font-bold rounded-xl text-lg">
              {formatMoney(totalLive)}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* CUERPO DEL DRAWER (CON SCROLL INTERNO SI EL CELULAR ES PEQUEÑO) */}
            <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
              {/* ÁREA DE VISOR / DISPLAY DE LA CALCULADORA */}
              <div className="p-5 bg-gray-900 text-white flex flex-col justify-end items-end min-h-120px font-mono relative shrink-0">
                {/* Historial de la suma (ej. 3.500 + 2.000) */}
                <div className="text-gray-400 text-xs font-semibold max-w-full truncate overflow-hidden mb-1 flex flex-wrap justify-end gap-1">
                  {addedItems.map((item, idx) => (
                    <span
                      key={item.id}
                      className="bg-gray-800/80 px-1.5 py-0.5 rounded text-[10px]"
                    >
                      {formatMoney(item.price)}
                      {idx < addedItems.length - 1 || inputVal !== ""
                        ? " +"
                        : ""}
                    </span>
                  ))}
                  {inputVal !== "" && addedItems.length > 0 && (
                    <span className="text-yellow-400">
                      {" "}
                      + {formatMoney(currentPriceInput)}
                    </span>
                  )}
                </div>

                {/* Visor del Valor actual siendo digitado */}
                <div className="text-gray-400 text-sm font-semibold tracking-wider">
                  {inputVal === "" ? "Esperando valor..." : "Valor Digitado"}
                </div>
                <div className="text-3xl font-black text-white mt-1 select-all selection:bg-orange-500">
                  {formatMoney(currentPriceInput)}
                </div>

                {/* Total acumulado real en vivo */}
                {addedItems.length > 0 && (
                  <div className="absolute left-4 bottom-4 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold px-2 py-1 rounded-lg">
                    Total Acumulado: {formatMoney(totalLive)}
                  </div>
                )}
              </div>

              {/* Alertas de error */}
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2 text-xs font-semibold border-b border-red-100 flex items-center gap-1.5 shrink-0">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* GRILLA DE BOTONES (TECLADO NUMÉRICO COMPACTADO) */}
              <div className="p-4 bg-gray-50 flex-1 grid grid-cols-4 gap-2">
                {/* Fila 1 */}
                <button
                  onClick={() => handleNumClick("7")}
                  className="bg-white hover:bg-gray-100 active:scale-95 text-gray-800 text-xl font-bold py-3.5 rounded-2xl shadow-sm border border-gray-100 transition-all flex items-center justify-center"
                >
                  7
                </button>
                <button
                  onClick={() => handleNumClick("8")}
                  className="bg-white hover:bg-gray-100 active:scale-95 text-gray-800 text-xl font-bold py-3.5 rounded-2xl shadow-sm border border-gray-100 transition-all flex items-center justify-center"
                >
                  8
                </button>
                <button
                  onClick={() => handleNumClick("9")}
                  className="bg-white hover:bg-gray-100 active:scale-95 text-gray-800 text-xl font-bold py-3.5 rounded-2xl shadow-sm border border-gray-100 transition-all flex items-center justify-center"
                >
                  9
                </button>
                <button
                  onClick={handleBackspace}
                  className="bg-gray-200/80 hover:bg-gray-300 text-gray-700 text-lg font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center"
                >
                  ⌫
                </button>
                {/* Fila 2 */}
                <button
                  onClick={() => handleNumClick("4")}
                  className="bg-white hover:bg-gray-100 active:scale-95 text-gray-800 text-xl font-bold py-3.5 rounded-2xl shadow-sm border border-gray-100 transition-all flex items-center justify-center"
                >
                  4
                </button>
                <button
                  onClick={() => handleNumClick("5")}
                  className="bg-white hover:bg-gray-100 active:scale-95 text-gray-800 text-xl font-bold py-3.5 rounded-2xl shadow-sm border border-gray-100 transition-all flex items-center justify-center"
                >
                  5
                </button>
                <button
                  onClick={() => handleNumClick("6")}
                  className="bg-white hover:bg-gray-100 active:scale-95 text-gray-800 text-xl font-bold py-3.5 rounded-2xl shadow-sm border border-gray-100 transition-all flex items-center justify-center"
                >
                  6
                </button>
                <button
                  onClick={handleClearAll}
                  className="bg-red-100 hover:bg-red-200 text-red-700 text-sm font-black py-3.5 rounded-2xl transition-all flex items-center justify-center"
                >
                  C
                </button>
                {/* Fila 3 */}
                <button
                  onClick={() => handleNumClick("1")}
                  className="bg-white hover:bg-gray-100 active:scale-95 text-gray-800 text-xl font-bold py-3.5 rounded-2xl shadow-sm border border-gray-100 transition-all flex items-center justify-center"
                >
                  1
                </button>
                <button
                  onClick={() => handleNumClick("2")}
                  className="bg-white hover:bg-gray-100 active:scale-95 text-gray-800 text-xl font-bold py-3.5 rounded-2xl shadow-sm border border-gray-100 transition-all flex items-center justify-center"
                >
                  2
                </button>
                <button
                  onClick={() => handleNumClick("3")}
                  className="bg-white hover:bg-gray-100 active:scale-95 text-gray-800 text-xl font-bold py-3.5 rounded-2xl shadow-sm border border-gray-100 transition-all flex items-center justify-center"
                >
                  3
                </button>
                {/* Botón SUMAR (+) que abarca 2 filas verticales */}
                <button
                  onClick={handleAddItem}
                  className="row-span-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-3xl font-black rounded-2xl shadow-md transition-all flex items-center justify-center"
                >
                  +
                </button>
                {/* Fila 4 */}
                <button
                  onClick={() => handleNumClick("0")}
                  className="bg-white hover:bg-gray-100 active:scale-95 text-gray-800 text-xl font-bold py-3.5 rounded-2xl shadow-sm border border-gray-100 transition-all flex items-center justify-center"
                >
                  0
                </button>
                {/* Botón Triple Cero (Clave para COP) */}
                <button
                  onClick={() => handleNumClick("000")}
                  className="bg-white hover:bg-gray-100 active:scale-95 text-gray-800 text-sm font-black py-3.5 rounded-2xl shadow-sm border border-gray-100 transition-all flex items-center justify-center"
                  title="Agregar tres ceros al vuelo"
                >
                  .000
                </button>
                <div className="bg-transparent" />{" "}
                {/* Espacio vacío por la fila unida del '+' */}
              </div>
            </div>

            {/* SECCIÓN FINAL DE COBROS (FIJA ABAJO CON COLCHÓN PARA MÓVIL) */}
            <div className="p-4 bg-white border-t border-gray-100 flex gap-3 pb-8 shrink-0">
              <button
                onClick={() => handleProcessCharge("cash")}
                disabled={loading || totalLive <= 0}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:scale-100 text-white font-black py-4 px-3 rounded-2xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>💵</span>
                <span>{loading ? "Cobrando..." : "Cobrar Efectivo"}</span>
              </button>

              <button
                onClick={() => handleProcessCharge("transfer")}
                disabled={loading || totalLive <= 0}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:scale-100 text-white font-black py-4 px-3 rounded-2xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>🏦</span>
                <span>{loading ? "Cobrando..." : "Transferencia"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickCheckoutDrawer;
