import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";
import useAuthStore from "../store/useAuthStore";
import useStockStore from "../store/useStockStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  name?: string;
  title?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  total: number;
  userEmail?: string;
  paymentMethod?: "cash" | "transfer";
  createdAt: any;
  status?: string;
  items?: OrderItem[];
}

const ORDERS_PER_PAGE = 10;

const getLocalDateString = (value: Date) => {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(value.getDate()).padStart(2, "0")}`;
};

const getOrderDate = (createdAt: any): Date | null => {
  if (!createdAt) return null;
  if (typeof createdAt?.toDate === "function") return createdAt.toDate();
  if (typeof createdAt?.toMillis === "function") return new Date(createdAt.toMillis());
  if (typeof createdAt === "object" && typeof createdAt.seconds === "number") {
    return new Date(createdAt.seconds * 1000);
  }
  if (typeof createdAt === "string" || typeof createdAt === "number") {
    const d = new Date(createdAt);
    return isNaN(d.getTime()) ? null : d;
  }
  if (createdAt instanceof Date) return createdAt;
  return null;
};

const formatMoney = (val: number) => {
  const rounded = Math.round(Math.abs(val));
  const formatted = rounded.toLocaleString("es-CO");
  return `${val < 0 ? "-" : ""}$${formatted}`;
};

const SalesPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDate, setFilterDate] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "today">("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [confirmingCancelId, setConfirmingCancelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const uid = user?.uid;

  // 1. Suscripción en Tiempo Real Multi-tenant y sincronización local 🛡️
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const ordersRef = collection(db, "usuarios", uid, "orders");

    const getMergedOrders = (firestoreOrders: Order[]) => {
      const localOrdersStr = localStorage.getItem(`tinku_orders_${uid}`);
      const localOrders: Order[] = localOrdersStr ? JSON.parse(localOrdersStr) : [];
      const mergedMap = new Map<string, Order>();

      // 1. Añadir órdenes de Firestore
      firestoreOrders.forEach((o) => mergedMap.set(o.id, o));

      // 2. Fusionar órdenes locales desduplicando si ya existen por ID o por coincidencia exacta de venta
      localOrders.forEach((localOrder) => {
        if (mergedMap.has(localOrder.id)) {
          // Si en local se marcó cancelada, prevalece el estado cancelado
          const existing = mergedMap.get(localOrder.id)!;
          if (localOrder.status === "canceled" && existing.status !== "canceled") {
            mergedMap.set(localOrder.id, { ...existing, status: "canceled" });
          }
          return;
        }

        // Filtro anti-duplicado: si en Firestore ya existe la misma venta (mismo total, misma cantidad de ítems y fecha muy cercana)
        const localTime = getOrderDate(localOrder.createdAt)?.getTime() || 0;
        const isDuplicate = firestoreOrders.some((fsOrder) => {
          if (fsOrder.total !== localOrder.total) return false;
          const fsTime = getOrderDate(fsOrder.createdAt)?.getTime() || 0;
          return Math.abs(fsTime - localTime) < 20000 && (fsOrder.items?.length === localOrder.items?.length);
        });

        if (!isDuplicate) {
          mergedMap.set(localOrder.id, localOrder);
        }
      });

      return Array.from(mergedMap.values()).sort((a, b) => {
        const dateA = getOrderDate(a.createdAt)?.getTime() || 0;
        const dateB = getOrderDate(b.createdAt)?.getTime() || 0;
        return dateB - dateA;
      });
    };

    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        const rawOrders = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Order[];

        setOrders(getMergedOrders(rawOrders));
        setLoading(false);
      },
      (error) => {
        console.warn("Suscripción de Firestore offline, cargando órdenes locales:", error);
        setOrders(getMergedOrders([]));
        setLoading(false);
      }
    );

    const handleLocalSync = () => {
      setOrders((prev) => getMergedOrders(prev));
    };

    window.addEventListener("tinku_orders_updated", handleLocalSync);
    window.addEventListener("storage", handleLocalSync);

    return () => {
      unsubscribe();
      window.removeEventListener("tinku_orders_updated", handleLocalSync);
      window.removeEventListener("storage", handleLocalSync);
    };
  }, [uid]);

  const todayString = getLocalDateString(new Date());

  // --- CÁLCULO DE MÉTRICAS GENERALES EN VIVO ---
  const totalVentas = orders
    .filter((o) => o.status !== "canceled")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const ordenesHoy = orders.filter((o) => {
    const date = getOrderDate(o.createdAt);
    if (!date) return false;
    return getLocalDateString(date) === todayString && o.status !== "canceled";
  }).length;

  const promedio =
    orders.filter((o) => o.status !== "canceled").length > 0
      ? totalVentas / orders.filter((o) => o.status !== "canceled").length
      : 0;

  // --- FILTRADO DE LA TABLA/LISTA ---
  const filtered = orders.filter((o) => {
    const date = getOrderDate(o.createdAt);
    if (!date) return false;

    const dateString = getLocalDateString(date);

    // Filtro por Fecha de Calendario
    if (filterDate && dateString !== filterDate) return false;

    // Filtro por Vista "Solo Hoy"
    if (viewMode === "today" && dateString !== todayString) return false;

    return true;
  });

  // --- PAGINACIÓN ---
  const totalPages = Math.ceil(filtered.length / ORDERS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  // --- TRANSACCIÓN ANTISÍSMICA PARA CANCELAR ORDEN Y DEVOLVER INVENTARIO 🛡️ ---
  const handleCancelOrder = async (orderId: string) => {
    if (!uid) return;

    try {
      // 1. Intentar cancelar en Firestore si la orden existe en la base de datos
      try {
        await runTransaction(db, async (transaction) => {
          const orderRef = doc(db, "usuarios", uid, "orders", orderId);
          const orderSnap = await transaction.get(orderRef);

          if (orderSnap.exists()) {
            const orderData = orderSnap.data();
            if (orderData.status === "canceled") {
              throw new Error("Esta orden ya se encuentra cancelada.");
            }

            // Devolver cantidades al stock físico en Firestore
            const items = (orderData.items || []) as OrderItem[];
            for (const item of items) {
              if (
                item.id.startsWith("venta-rapida-") ||
                item.id.startsWith("quick-") ||
                item.id.startsWith("express-")
              ) {
                continue;
              }

              const productRef = doc(db, "usuarios", uid, "productos", item.id);
              const productSnap = await transaction.get(productRef);

              if (productSnap.exists()) {
                const currentStock = productSnap.data().stock ?? 0;
                transaction.update(productRef, {
                  stock: currentStock + item.quantity,
                });
              }
            }

            // Actualizar estado de la venta en Firestore
            transaction.update(orderRef, {
              status: "canceled",
            });
          }
        });
      } catch (fsErr: any) {
        if (fsErr.message?.includes("ya se encuentra cancelada")) {
          throw fsErr;
        }
        console.warn("Firestore cancel no disponible o la orden es local:", fsErr);
      }

      // 2. SINCRONIZAR SIEMPRE EN LOCALSTORAGE
      const localOrdersStr = localStorage.getItem(`tinku_orders_${uid}`);
      if (localOrdersStr) {
        try {
          const localOrders: Order[] = JSON.parse(localOrdersStr);
          const updatedLocal = localOrders.map((o) =>
            o.id === orderId ? { ...o, status: "canceled" } : o
          );
          localStorage.setItem(`tinku_orders_${uid}`, JSON.stringify(updatedLocal));
        } catch (e) {
          console.warn("Error actualizando localOrders al cancelar:", e);
        }
      }

      // 3. Devolver stock en el estado local de Zustand (para que se refleje inmediatamente en StockPage y Ventas)
      const targetOrder = orders.find((o) => o.id === orderId);
      if (targetOrder && targetOrder.status !== "canceled") {
        const stockState = useStockStore.getState();
        targetOrder.items?.forEach((item) => {
          if (
            item.id.startsWith("venta-rapida-") ||
            item.id.startsWith("quick-") ||
            item.id.startsWith("express-")
          ) {
            return;
          }
          const product = stockState.products.find((p) => p.id === item.id);
          if (product) {
            stockState.updateProductLocally({
              ...product,
              stock: (product.stock ?? 0) + item.quantity,
            });
          }
        });
      }

      // 4. Actualizar estado de órdenes en SalesPage de inmediato
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "canceled" } : o))
      );

      // 5. Emitir evento para que DashboardPage y otras vistas se actualicen al instante
      window.dispatchEvent(new Event("tinku_orders_updated"));

      toast.success("🎉 ¡Orden cancelada! El stock ha sido devuelto al inventario.");
      setConfirmingCancelId(null);
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast.error(
        error.message || "Ocurrió un error al intentar cancelar la venta."
      );
    }
  };

  // Estilos sutiles de fondo y borde según método de pago
  const getPaymentStyles = (method?: "cash" | "transfer") => {
    if (method === "cash") return "border-l-4 border-emerald-500 bg-emerald-50/20";
    if (method === "transfer") return "border-l-4 border-blue-500 bg-blue-50/20";
    return "border-l-4 border-gray-200 bg-white";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-gray-600 font-semibold">
            Cargando historial de ventas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-[#F0F4F8] min-h-screen text-gray-900 pb-28 md:pb-8">
      {/* 🚀 ENCABEZADO RESPONSIVO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800 flex items-center gap-2">
            💰 Mis ventas
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Revisa lo que has vendido y el dinero que ha entrado.
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="min-h-12 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black text-base px-5 py-2.5 rounded-xl transition-all shadow-md self-start sm:self-center cursor-pointer"
        >
          🏪 Nueva venta
        </button>
      </div>

      {/* 📊 RESUMEN FINANCIERO DE RESPALDO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Ventas Hoy */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <span className="text-2xl bg-orange-100 text-orange-600 p-3 rounded-xl">
            📅
          </span>
          <div>
            <p className="text-sm text-gray-600 font-bold">Ventas de hoy</p>
            <p className="text-xl font-black text-gray-800">{ordenesHoy} ventas</p>
          </div>
        </div>

        {/* Total Ventas */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <span className="text-2xl bg-emerald-100 text-emerald-600 p-3 rounded-xl">
            💰
          </span>
          <div>
            <p className="text-sm text-gray-600 font-bold">Total vendido</p>
            <p className="text-xl font-black text-emerald-600">
              {formatMoney(totalVentas)}
            </p>
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <span className="text-2xl bg-blue-100 text-blue-600 p-3 rounded-xl">
            📈
          </span>
          <div>
            <p className="text-sm text-gray-600 font-bold">Promedio por venta</p>
            <p className="text-xl font-black text-gray-800">
              {formatMoney(promedio)}
            </p>
          </div>
        </div>
      </div>

      {/* 🔍 FILTROS INTELIGENTES */}
      <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Toggle de vistas tipo píldora */}
        <div className="flex bg-gray-100 p-1 rounded-xl self-start">
          <button
            onClick={() => {
              setViewMode("all");
              setCurrentPage(1);
            }}
            className={`min-h-12 px-4 py-2 text-sm font-black rounded-lg transition-all cursor-pointer ${
              viewMode === "all"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => {
              setViewMode("today");
              setCurrentPage(1);
            }}
            className={`min-h-12 px-4 py-2 text-sm font-black rounded-lg transition-all cursor-pointer ${
              viewMode === "today"
                ? "bg-white text-orange-500 shadow-sm"
                : "text-gray-400 hover:text-orange-400"
            }`}
          >
            Hoy ✨
          </button>
        </div>

        {/* Buscador de fecha sutil */}
        <div className="flex items-center gap-2 self-start w-full md:w-auto">
          <span className="text-base text-gray-600 font-bold hidden sm:inline">
            Ver día:
          </span>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Elegir día para ver ventas"
            className="w-full md:w-auto min-h-12 px-4 py-2.5 rounded-xl border border-gray-200 text-base font-black text-orange-600 bg-orange-50/50 focus:outline-none focus:border-orange-500 cursor-pointer"
          />
          {filterDate && (
            <button
              onClick={() => {
                setFilterDate("");
                setCurrentPage(1);
              }}
              className="min-h-12 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* 📱 CONTENEDOR DE TARJETAS RESPONSIVAS */}
      <div className="space-y-4">
        {paginated.length > 0 ? (
          paginated.map((order) => {
            const date = getOrderDate(order.createdAt);
            const timeString = date
              ? date.toLocaleTimeString("es-CO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Hora sin registrar";
            const dateString = date
              ? date.toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "short",
                })
              : "Sin fecha";

            const isCanceled = order.status === "canceled";
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                className={`p-4 rounded-2xl shadow-sm border border-gray-100 transition-all cursor-pointer hover:shadow-md ${getPaymentStyles(
                  order.paymentMethod
                )}`}
              >
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-600">
                      {dateString} - {timeString}
                    </span>
                    <span
                      className={`text-sm font-black px-2 py-1 rounded-md ${
                        order.paymentMethod === "cash"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.paymentMethod === "cash"
                        ? "💵 Efectivo"
                        : "🏦 Transferencia"}
                    </span>
                  </div>

                  {/* Estado Realizada o Cancelada */}
                  <span
                    className={`text-sm font-black px-2 py-1 rounded-md ${
                      isCanceled
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {isCanceled ? "❌ Cancelada" : "✓ Realizada"}
                  </span>
                </div>

                {/* Info Principal y Monto */}
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-800 text-base truncate">
                      Venta #{order.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {order.items?.length || 0}{" "}
                      {order.items?.length === 1 ? "ítem" : "ítems"} registrados
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-xl font-black ${
                        isCanceled
                          ? "text-gray-400 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {formatMoney(order.total)}
                    </p>
                  </div>
                </div>

                {/* 📌 CONTENIDO DESPLEGABLE CON DETALLES DE LA ORDEN */}
                {isExpanded && (
                  <div
                    className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h4 className="text-sm font-black text-gray-600 tracking-wide">
                      Detalle de productos
                    </h4>
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div
                          key={`${item.id}-${idx}`}
                          className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-gray-50 text-base"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-700 truncate">
                              {item.title || item.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} un. x {formatMoney(item.price)}
                            </p>
                          </div>
                          <p className="font-black text-gray-800 ml-4">
                            {formatMoney(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Botón / Confirmación Inline de Cancelación */}
                    {!isCanceled && (
                      <div className="pt-2 flex justify-end">
                        {confirmingCancelId !== order.id ? (
                          <button
                            onClick={() => setConfirmingCancelId(order.id)}
                            className="min-h-12 bg-red-50 hover:bg-red-100 text-red-600 active:scale-95 font-black text-sm px-4 py-2 rounded-xl border border-red-200 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            🗑️ Cancelar Venta
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-red-50 p-2 rounded-xl border border-red-200">
                            <span className="text-xs font-bold text-red-700">
                              ¿Cancelar esta venta?
                            </span>
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="min-h-12 bg-red-600 hover:bg-red-700 text-white font-black text-xs px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                            >
                              Sí, cancelar
                            </button>
                            <button
                              onClick={() => setConfirmingCancelId(null)}
                              className="min-h-12 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* ESTADO VACÍO CÁLIDO */
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <span className="text-5xl mb-4 block">🏪</span>
            <p className="text-gray-700 text-lg font-semibold">
              No hay ventas para este filtro
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Las ventas aparecerán aquí cuando registres una nueva venta.
            </p>
          </div>
        )}
      </div>

      {/* 🧭 BOTONES DE PAGINACIÓN RESPONSIVOS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="min-h-12 px-4 py-2 text-sm font-black bg-gray-50 border border-gray-100 text-gray-600 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors cursor-pointer"
          >
            ◀ Anterior
          </button>
          <span className="text-sm font-black text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="min-h-12 px-4 py-2 text-sm font-black bg-gray-50 border border-gray-100 text-gray-600 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors cursor-pointer"
          >
            Siguiente ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
