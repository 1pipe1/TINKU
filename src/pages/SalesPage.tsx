import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

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
  userEmail: string;
  paymentMethod?: "cash" | "transfer";
  createdAt: any;
  status?: string;
  items?: OrderItem[];
}

const ORDERS_PER_PAGE = 10;

const getLocalDateString = (value: Date) => {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
};

const getOrderDate = (createdAt: any) => {
  if (!createdAt?.toDate) return null;
  return createdAt.toDate();
};

const SalesPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDate, setFilterDate] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "today">("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const uid = user?.uid || user?.uid;

  // 1. Suscripción en Tiempo Real Multi-tenant 🛡️
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const ordersRef = collection(db, "usuarios", uid, "orders");

    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        const rawOrders = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Order[];

        // Ordenar cronológicamente descendente (más recientes primero)
        const sorted = rawOrders.sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate().getTime()
            : 0;
          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate().getTime()
            : 0;
          return dateB - dateA;
        });

        setOrders(sorted);
        setLoading(false);
      },
      (error) => {
        console.error("Error subscribing to multi-tenant orders:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [uid]);

  // --- FORMATEADOR DE COP SEGURO Y COMPACTO ---
  const formatMoney = (val: number) => {
    const rounded = Math.round(Math.abs(val));
    const formatted = rounded.toLocaleString("es-CO");
    return `${val < 0 ? "-" : ""}$${formatted}`;
  };

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

  const promedio = orders.filter((o) => o.status !== "canceled").length
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
    currentPage * ORDERS_PER_PAGE,
  );

  // --- TRANSACCIÓN ANTISÍSMICA PARA CANCELAR ORDEN Y DEVOLVER INVENTARIO 🛡️ ---
  const handleCancelOrder = async (orderId: string) => {
    if (!uid) return;

    const confirmed = window.confirm(
      "⚠️ ¿Estás seguro de que deseas cancelar esta venta?\n\nEsto devolverá automáticamente las existencias de los productos al inventario de forma segura en la nube.",
    );
    if (!confirmed) return;

    try {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, "usuarios", uid, "orders", orderId);
        const orderSnap = await transaction.get(orderRef);

        if (!orderSnap.exists()) {
          throw new Error("La orden que intentas cancelar no existe.");
        }

        const orderData = orderSnap.data();
        if (orderData.status === "canceled") {
          throw new Error("Esta orden ya se encuentra cancelada.");
        }

        // Devolver cantidades al stock físico
        const items = (orderData.items || []) as OrderItem[];
        for (const item of items) {
          // Saltar control para ítems rápidos o virtuales que no operan sobre el catálogo tradicional
          if (
            item.id.startsWith("venta-rapida-") ||
            item.id.startsWith("quick-")
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

        // Actualizar estado de la venta
        transaction.update(orderRef, {
          status: "canceled",
        });
      });

      alert(
        "🎉 ¡Orden cancelada! El stock ha sido reabastecido en tiempo real.",
      );
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      alert(error.message || "Ocurrió un error al intentar cancelar la venta.");
    }
  };

  // Estilos sutiles de fondo y borde para las tarjetas según el método de pago
  const getPaymentStyles = (method?: "cash" | "transfer") => {
    if (method === "cash")
      return "border-l-4 border-emerald-500 bg-emerald-50/20";
    if (method === "transfer")
      return "border-l-4 border-blue-500 bg-blue-50/20";
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
            💰 Historial de Ventas
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Consulta cobros, concilia cajas y gestiona cancelaciones al vuelo.
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black text-base px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-md self-start sm:self-center"
        >
          🏪 Ir a Vender
        </button>
      </div>

      {/* 📊 RESUMEN FINANCIERO DE RESPALDO (Gid responsiva compacta) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Ventas Hoy */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <span className="text-2xl bg-orange-100 text-orange-600 p-3 rounded-xl">
            📅
          </span>
          <div>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">
              Órdenes Hoy
            </p>
            <p className="text-xl font-black text-gray-800">
              {ordenesHoy} transacciones
            </p>
          </div>
        </div>

        {/* Total Ventas */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <span className="text-2xl bg-emerald-100 text-emerald-600 p-3 rounded-xl">
            💰
          </span>
          <div>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">
              Ingreso Acumulado
            </p>
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
            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">
              Ticket Promedio
            </p>
            <p className="text-xl font-black text-gray-800">
              {formatMoney(promedio)}
            </p>
          </div>
        </div>
      </div>

      {/* 🔍 FILTROS INTELIGENTES Y SECTORES DE NAVEGACIÓN (Diseñados para pantallas móviles) */}
      <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Toggle de vistas tipo píldora */}
        <div className="flex bg-gray-100 p-1 rounded-xl self-start">
          <button
            onClick={() => {
              setViewMode("all");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-sm font-black rounded-lg transition-all ${
              viewMode === "all"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Todas las Ventas
          </button>
          <button
            onClick={() => {
              setViewMode("today");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-sm font-black rounded-lg transition-all ${
              viewMode === "today"
                ? "bg-white text-orange-500 shadow-sm"
                : "text-gray-400 hover:text-orange-400"
            }`}
          >
            Solo Hoy ✨
          </button>
        </div>

        {/* Buscador de fecha sutil */}
        <div className="flex items-center gap-2 self-start w-full md:w-auto">
          <span className="text-base text-gray-400 font-bold hidden sm:inline">
            Buscar Día:
          </span>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-base font-black text-orange-600 bg-orange-50/50 focus:outline-none focus:border-orange-500 cursor-pointer"
          />
          {filterDate && (
            <button
              onClick={() => {
                setFilterDate("");
                setCurrentPage(1);
              }}
              className="text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-all"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* 📱 CONTENEDOR DE TARJETAS RESPONSIVAS (MÓVIL Y DESKTOP) */}
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
                  order.paymentMethod,
                )}`}
              >
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-400 uppercase">
                      {dateString} - {timeString}
                    </span>
                    {/* Badge de Método de Pago con colores de ráfaga */}
                    <span
                      className={`text-sm font-black uppercase px-2 py-0.5 rounded-md ${
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
                    className={`text-sm font-black uppercase px-2 py-0.5 rounded-md ${
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
                    <p className="text-sm text-gray-400 mt-0.5">
                      {order.items?.length || 0}{" "}
                      {order.items?.length === 1 ? "ítem" : "ítems"} registrados
                    </p>
                  </div>

                  {/* Precio Grande */}
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
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                      Detalle de Productos
                    </h4>
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div
                          key={`${item.id}-${idx}`}
                          className="flex justify-between items-center bg-white/50 p-2.5 rounded-xl border border-gray-50 text-base"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-700 truncate">
                              {item.title || item.name}
                            </p>
                            <p className="text-sm text-gray-400">
                              {item.quantity} un. x {formatMoney(item.price)}
                            </p>
                          </div>
                          <p className="font-black text-gray-800 ml-4">
                            {formatMoney(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Botón de Cancelación de Venta (Solo si no está ya cancelada) */}
                    {!isCanceled && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 active:scale-95 font-black text-sm uppercase tracking-wider px-3.5 py-2 rounded-xl border border-red-200 transition-all flex items-center gap-1"
                        >
                          🗑️ Cancelar Venta
                        </button>
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
            <p className="text-gray-600 text-base font-semibold">
              No registras ventas para este filtro
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Las ventas que registre tu mamá en el mostrador aparecerán
              listadas aquí en tiempo real.
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
            className="px-4 py-2 text-sm font-black bg-gray-50 border border-gray-100 text-gray-600 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            ◀ Anterior
          </button>
          <span className="text-sm font-black text-gray-500">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-black bg-gray-50 border border-gray-100 text-gray-600 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            Siguiente ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
