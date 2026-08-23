import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";
import useAuthStore from "../store/useAuthStore";
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user?.uid) return; // 🛡️ Evita consultas antes de que cargue la sesión

    // 🛡️ MULTI-TENANT: Apuntamos exclusivamente a las órdenes de este usuario
    const ordersRef = collection(db, "usuarios", user.uid, "orders");

    const unsub = onSnapshot(ordersRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(data);
    });

    return () => unsub();
  }, [user?.uid]); // 🔄 Se vuelve a suscribir si cambia de usuario, []);

  const totalVentas = orders
    .filter((o) => o.status !== "canceled")
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const todayString = getLocalDateString(new Date());
  const ordenesHoy = orders.filter((o) => {
    const date = getOrderDate(o.createdAt);
    if (!date) return false;
    return getLocalDateString(date) === todayString;
  }).length;
  const promedio = orders.length ? totalVentas / orders.length : 0;

  const filtered = orders
    .filter((o) => {
      const date = getOrderDate(o.createdAt);
      if (!date) return false;

      const localDate = getLocalDateString(date);

      if (filterDate && localDate !== filterDate) return false;
      if (viewMode === "today") {
        return localDate === todayString;
      }

      return true;
    })
    .sort((a, b) => {
      const aTime = getOrderDate(a.createdAt)?.getTime?.() || 0;
      const bTime = getOrderDate(b.createdAt)?.getTime?.() || 0;
      return bTime - aTime;
    });

  const totalPages = Math.ceil(filtered.length / ORDERS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE,
  );

  const handleCancelOrder = async (orderId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas cancelar esta orden y devolver el stock al inventario?",
    );
    if (!confirmed) return;

    try {
      // ==========================================
      // 🧱 TRANSACCIÓN ATÓMICA DE DEVOLUCIÓN
      // ==========================================
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, "usuarios", user.uid, "orders", orderId);
        const orderSnap = await transaction.get(orderRef);

        if (!orderSnap.exists()) {
          throw new Error("La orden que intentas cancelar no existe.");
        }

        const orderData = orderSnap.data();

        // Evitamos cancelar una orden que ya está cancelada
        if (orderData.status === "canceled") {
          throw new Error("Esta orden ya ha sido cancelada previamente.");
        }

        const items = orderData.items || [];
        const productUpdates: Array<{
          ref: ReturnType<typeof doc>;
          newStock: number;
        }> = [];

        // 1. Fase de Lectura: Consultamos el stock actual de cada producto de la orden
        for (const item of items) {
          const productRef = doc(
            db,
            "usuarios",
            user.uid,
            "productos",
            item.id,
          );
          const productSnap = await transaction.get(productRef);

          if (productSnap.exists()) {
            const productData = productSnap.data();
            const currentStock = productData.stock ?? 0;

            productUpdates.push({
              ref: productRef,
              newStock: currentStock + item.quantity, // 🔄 ¡Sumamos de nuevo lo vendido!
            });
          }
        }

        // 2. Fase de Escritura: Actualizamos los inventarios con el stock devuelto
        productUpdates.forEach(({ ref, newStock }) => {
          transaction.update(ref, { stock: newStock });
        });

        // 3. Fase de Escritura: Marcamos la orden como cancelada
        transaction.update(orderRef, { status: "canceled" });
      });

      alert(
        "✅ ¡Orden cancelada con éxito! El dinero se restó y el stock fue devuelto.",
      );
    } catch (error: any) {
      console.error("Error al cancelar la orden:", error);
      alert(
        error.message || "No se pudo cancelar la orden. Intenta nuevamente.",
      );
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">💰 Ventas</h1>

      {/* Cards resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">Total ventas</p>
          <p className="text-2xl md:text-3xl font-bold text-green-600">
            ${totalVentas.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">Órdenes hoy</p>
          <p className="text-2xl md:text-3xl font-bold text-blue-600">
            {ordenesHoy}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">Promedio por orden</p>
          <p className="text-2xl md:text-3xl font-bold text-purple-600">
            ${promedio.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".") || 0}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold">Órdenes recientes</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => {
                  setViewMode("all");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === "all"
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => {
                  setViewMode("today");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === "today"
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Hoy
              </button>
            </div>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {(filterDate || viewMode === "today") && (
              <button
                onClick={() => {
                  setFilterDate("");
                  setViewMode("all");
                  setCurrentPage(1);
                }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕ Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[=500px]">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Hora</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Realizado</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    {filterDate
                      ? "No hay órdenes en esa fecha"
                      : "No hay órdenes aún"}
                  </td>
                </tr>
              ) : (
                paginated.map((o) => (
                  <tr>
                    <td className="py-3">
                      {getOrderDate(o.createdAt)?.toLocaleString() || "—"}
                    </td>
                    <td className="py-3 font-semibold text-green-600">
                      $
                      {o.total
                        ?.toFixed(0)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ".") || 0}
                    </td>
                    <td className="py-3">
                      {o.status === "cancelled" ? (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium justify-center items-center flex">
                          ❌
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium justify-center items-center flex">
                          ✅
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="text-xs text-orange-500 hover:text-orange-600 font-semibold transition-colors"
                        >
                          Detalle Orden →
                        </button>
                        {o.status === "completed" && (
                          <button
                            onClick={() => handleCancelOrder(o.id)}
                            className="text-xs text-red-500 hover:text-red-600 font-semibold transition-colors"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-xs text-gray-400">
              Mostrando {(currentPage - 1) * ORDERS_PER_PAGE + 1}–
              {Math.min(currentPage * ORDERS_PER_PAGE, filtered.length)} de{" "}
              {filtered.length} órdenes
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-500">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal detalle orden */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="p-5 border-b flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">Detalle de orden</h3>
                <p className="text-xs text-gray-400 mt-0.5"></p>
                <p className="text-sm text-gray-500 mt-1">
                  {(selectedOrder as any).customerName ||
                    selectedOrder.userEmail ||
                    "—"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {getOrderDate(selectedOrder.createdAt)?.toLocaleString() ||
                    "—"}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div className="p-5 flex flex-col gap-3">
              {selectedOrder.items?.length ? (
                selectedOrder.items.map((item) => {
                  const itemName =
                    item.title || item.name || "Producto sin nombre";

                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={itemName}
                          className="w-12 h-12 object-contain rounded-lg border border-gray-100"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{itemName}</p>
                        <p className="text-xs text-gray-400">
                          {item.quantity} × ${item.price?.toFixed(0)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-green-600">
                        $
                        {(item.price * item.quantity)
                          .toFixed(0)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  No hay items registrados
                </p>
              )}
            </div>

            {/* Footer total */}
            <div className="p-5 border-t flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="text-xl font-bold text-green-600">
                $
                {selectedOrder.total
                  ?.toFixed(0)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
