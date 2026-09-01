import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import useAuthStore from "../store/useAuthStore";
import useStockStore from "../store/useStockStore";

type Order = {
  id: string;
  total?: number;
  paymentMethod?: "cash" | "transfer";
  status?: string;
  createdAt?: { toDate: () => Date };
};

const DashboardPage = () => {
  const products = useStockStore((state) => state.products);
  const fetchProducts = useStockStore((state) => state.fetchProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const loadData = async () => {
      const uid = user?.uid || user?.uid;
      if (!uid) return;

      // 🛡️ MULTI-TENANT: Cargamos los productos y órdenes específicos de este tendero
      await fetchProducts(uid);
      const snapshot = await getDocs(collection(db, "usuarios", uid, "orders"));
      const data: Order[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Order[];

      setOrders(data);
      setLoading(false);
    };

    loadData();
  }, [fetchProducts, user?.uid, user?.uid]);

  // --- MÉTODOS DE FORMATEO --
  const formatMoney = (val: number) => {
    return `$${val.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  // --- CÁLCULOS DE INVENTARIO ---
  const totalProducts = products.length;
  const inventoryValue = products.reduce(
    (sum, p) => sum + (p.price ?? 0) * (p.stock ?? 0),
    0,
  );
  const categories = [...new Set(products.map((p) => p.category || "General"))]
    .length;

  // --- CÁLCULOS DE VENTAS ---
  const activeOrders = orders.filter((o) => o.status !== "canceled");
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  // --- FILTRO DE HOY (CON CORTE OPERATIVO DE LAS 4:00 AM) ---
  const getOperationalDateString = (date: Date) => {
    const shifted = new Date(date.getTime() - 4 * 60 * 60 * 1000); // Restamos 4 horas
    return shifted.toDateString();
  };

  const currentOperationalDay = getOperationalDateString(new Date());

  const todayOrders = activeOrders.filter((o) => {
    if (!o.createdAt) return false;
    const date = o.createdAt.toDate();
    return getOperationalDateString(date) === currentOperationalDay;
  });

  // --- EFECTIVO VS TRANSFERENCIA DE HOY ---
  const cashToday = todayOrders
    .filter((o) => o.paymentMethod === "cash")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const transferToday = todayOrders
    .filter((o) => o.paymentMethod === "transfer")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const totalToday = cashToday + transferToday;

  // 🔥 ACCIÓN DE GUERRILLA: ENVIAR REPORTE POR WHATSAPP SIN SALIR DE LA APP
  const handleShareWhatsApp = () => {
    const formattedDate = new Date().toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const mensaje =
      `🏪 *TINKU - CUADRE DE CAJA* \n` +
      `📅 *Fecha:* ${formattedDate}\n` +
      `----------------------------------\n` +
      `💵 *Efectivo (Cajón):* ${formatMoney(cashToday)}\n` +
      `🏦 *Transferencia:* ${formatMoney(transferToday)}\n` +
      `📈 *Ingreso Bruto:* ${formatMoney(totalToday)}\n` +
      `📦 *Ventas Realizadas:* ${todayOrders.length} órdenes\n` +
      `----------------------------------\n` +
      `¡ Que tengas un excelente día! 🚀`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-gray-600 font-semibold">
            Cargando dashboard de TINKU...
          </p>
        </div>
      </div>
    );
  }

  return (
    
    <div className="p-2 md:p-8 bg-[#F0F4F8] min-h-screen">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
            📊 Mi Negocio
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            El control financiero de tu tienda en tiempo real.
          </p>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            ● Caja Abierta
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            Jornada de 4:00 AM a 4:00 AM
          </span>
        </div>
      </div>

      {/* 💵 SECCIÓN DESTACADA: CUADRE DE CAJA DE HOY (LA IDEA DE MAMÁ) */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            🏪 Cuadre de Caja de Hoy
          </h2>
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
            Corte: 4:00 AM ⏰
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Tarjeta Efectivo */}
          <div className="bg-white rounded-2xl shadow-sm border-l-4 border-emerald-500 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-emerald-50 text-emerald-600 text-3xl w-14 h-14 rounded-full flex items-center justify-center border border-emerald-100">
              💵
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                Efectivo (En Cajón)
              </p>
              <p className="text-2xl font-black text-gray-800 mt-1">
                {formatMoney(cashToday)}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Plata física en monedas y billetes
              </p>
            </div>
          </div>

          {/* Tarjeta Transferencia */}
          <div className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-500 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-blue-50 text-blue-600 text-3xl w-14 h-14 rounded-full flex items-center justify-center border border-blue-100">
              🏦
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                Transferencia (Nequi/Daviplata)
              </p>
              <p className="text-2xl font-black text-gray-800 mt-1">
                {formatMoney(transferToday)}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Plata digital en el banco. Nequi o Daviplata
              </p>
            </div>
          </div>

          {/* Tarjeta Total de Hoy */}
          <div className="bg-white rounded-2xl shadow-sm border-l-4 border-orange-500 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-orange-50 text-orange-600 text-3xl w-14 h-14 rounded-full flex items-center justify-center border border-orange-100">
              📈
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                Ventas Totales de Hoy
              </p>
              <p className="text-2xl font-black text-orange-600 mt-1">
                {formatMoney(totalToday)}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {todayOrders.length} órdenes registradas hoy
              </p>
            </div>
          </div>
        </div>

        {/* 🔥 EL BOTÓN MÁGICO DE GUERRILLA */}
        <button
          onClick={handleShareWhatsApp}
          className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-md shadow-green-100 text-lg active:scale-95"
        >
          💬 Tu cuadre a Whatsapp
        </button>
      </div>

      {/* 📊 METRICAS HISTÓRICAS Y CONFIGURACIÓN GLOBAL */}
      <div>
        <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          📊 Históricos & Negocio
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Ingresos Históricos */}
          <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-indigo-50 text-indigo-600 text-3xl w-14 h-14 rounded-full flex items-center justify-center border border-indigo-100">
              💰
            </div>
            <div>
              <p className="text-gray-500 text-sm">Ventas Históricas</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatMoney(totalRevenue)}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                Acumulado total del sistema
              </p>
            </div>
          </div>

          {/* Valor de Inventario */}
          <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-purple-50 text-purple-600 text-3xl w-14 h-14 rounded-full flex items-center justify-center border border-purple-100">
              🏪
            </div>
            <div>
              <p className="text-gray-500 text-sm">Valor de Inventario</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatMoney(inventoryValue)}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                Precio de Venta x Stock de productos
              </p>
            </div>
          </div>

          {/* Total Productos */}
          <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-amber-50 text-orange-500 text-3xl w-14 h-14 rounded-full flex items-center justify-center border border-amber-100">
              📦
            </div>
            <div>
              <p className="text-gray-500 text-sm">Catálogo Activo</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {totalProducts} productos
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                Distribuidos en {categories} categorías
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
