import { useEffect, useState, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import useStockStore from "../store/useStockStore";
import useAuthStore from "../store/useAuthStore";

type OrderItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  total?: number;
  paymentMethod?: "cash" | "transfer";
  status?: string;
  createdAt?: any;
  items?: OrderItem[];
};

const parseOrderDate = (createdAt: any): Date | null => {
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

const DashboardPage = () => {
  const products = useStockStore((state) => state.products);
  const fetchProducts = useStockStore((state) => state.fetchProducts);
  const user = useAuthStore((state) => state.user);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 📆 Estado del Calendario (YYYY-MM-DD)
  const [selectedDateString, setSelectedDateString] = useState<string>("");

  // ⚙️ Parámetros de Conciencia Financiera (persistidos en LocalStorage)
  const [monthlyFixedCost, setMonthlyFixedCost] = useState<number>(() => {
    const saved = localStorage.getItem("tinku_monthly_fixed_cost");
    return saved ? parseInt(saved, 10) : 465000; // Por defecto $465.000 COP mensuales ($15.000 diario)
  });
  const [savingsGoal, setSavingsGoal] = useState<number>(() => {
    const saved = localStorage.getItem("tinku_savings_goal");
    return saved ? parseInt(saved, 10) : 10000; // Por defecto $10.000 COP diarios para ahorro/casa
  });
  const [estimatedMargin, setEstimatedMargin] = useState<number>(() => {
    const saved = localStorage.getItem("tinku_estimated_margin");
    return saved ? parseInt(saved, 10) : 25; // Por defecto 25% de margen estimado
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const auth = getAuth();

  // Costo diario calculado por mes dividido 31
  const dailyFixedCost = Math.round(monthlyFixedCost / 31);

  // --- NOMBRE DINÁMICO MULTI-TENANT ---
  const shopkeeperName = user?.email
    ? user.email.split("@")[0].charAt(0).toUpperCase() +
      user.email.split("@")[0].slice(1)
    : "Tendero";

  // --- LÓGICA DE JORNADA OPERATIVA CON OFFSET DE 4 AM ---
  const getOperationalDateYYYYMMDD = (date: Date) => {
    const shifted = new Date(date.getTime() - 4 * 60 * 60 * 1000); // Restamos 4 horas
    const yyyy = shifted.getFullYear();
    const mm = String(shifted.getMonth() + 1).padStart(2, "0");
    const dd = String(shifted.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Inicializar la fecha del calendario con la jornada operativa actual
  useEffect(() => {
    setSelectedDateString(getOperationalDateYYYYMMDD(new Date()));
  }, []);

  useEffect(() => {
    const uid = user?.uid || user?.id;
    if (!uid) {
      setLoading(false);
      return;
    }

    try {
      fetchProducts(uid);
    } catch (e) {
      console.warn("fetchProducts in dashboard:", e);
    }

    const mergeWithLocal = (firestoreOrders: Order[]) => {
      const localOrdersStr = localStorage.getItem(`tinku_orders_${uid}`);
      const localOrders: Order[] = localOrdersStr ? JSON.parse(localOrdersStr) : [];
      const mergedMap = new Map<string, Order>();

      // 1. Añadir órdenes de Firestore
      firestoreOrders.forEach((o) => mergedMap.set(o.id, o));

      // 2. Fusionar órdenes locales desduplicando si ya existen por ID o por coincidencia exacta de venta
      localOrders.forEach((localOrder) => {
        if (mergedMap.has(localOrder.id)) {
          // Si en local se canceló la orden, garantizar que en el Dashboard se refleje como cancelada
          const existing = mergedMap.get(localOrder.id)!;
          if (localOrder.status === "canceled" && existing.status !== "canceled") {
            mergedMap.set(localOrder.id, { ...existing, status: "canceled" });
          }
          return;
        }

        // Filtro anti-duplicado: si en Firestore ya existe la misma venta (mismo total, misma cantidad de ítems y fecha muy cercana)
        const localTime = parseOrderDate(localOrder.createdAt)?.getTime() || 0;
        const isDuplicate = firestoreOrders.some((fsOrder) => {
          if (fsOrder.total !== localOrder.total) return false;
          const fsTime = parseOrderDate(fsOrder.createdAt)?.getTime() || 0;
          return Math.abs(fsTime - localTime) < 20000 && (fsOrder.items?.length === localOrder.items?.length);
        });

        if (!isDuplicate) {
          mergedMap.set(localOrder.id, localOrder);
        }
      });

      return Array.from(mergedMap.values());
    };

    // 1. Cargar de inmediato desde cache local (0 lecturas a Firestore, 0ms de espera)
    const local = mergeWithLocal([]);
    if (local.length > 0) {
      setOrders(local);
      setLoading(false);
    }

    // 2. Consulta puntual única a Firestore (getDocs en vez de onSnapshot continuo para cuidar cuota)
    let isMounted = true;
    getDocs(collection(db, "usuarios", uid, "orders"))
      .then((snapshot) => {
        if (!isMounted) return;
        const fsOrders: Order[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Order[];
        setOrders(mergeWithLocal(fsOrders));
      })
      .catch((err) => {
        console.warn("Firestore orders no disponibles en Dashboard:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // 3. Escuchar evento de actualización inmediata de órdenes locales (ej. al vender o cancelar)
    const handleOrdersSync = () => {
      setOrders((prev) => mergeWithLocal(prev));
    };

    window.addEventListener("tinku_orders_updated", handleOrdersSync);
    window.addEventListener("storage", handleOrdersSync);

    return () => {
      isMounted = false;
      window.removeEventListener("tinku_orders_updated", handleOrdersSync);
      window.removeEventListener("storage", handleOrdersSync);
    };
  }, [fetchProducts, user?.uid, user?.id]);

  // --- PERSISTENCIA DE CONFIGURACIÓN FINANCIERA ---
  const saveFinancialConfig = (
    newMonthlyCost: number,
    newSavings: number,
    newMargin: number,
  ) => {
    setMonthlyFixedCost(newMonthlyCost);
    setSavingsGoal(newSavings);
    setEstimatedMargin(newMargin);
    localStorage.setItem("tinku_monthly_fixed_cost", String(newMonthlyCost));
    localStorage.setItem("tinku_savings_goal", String(newSavings));
    localStorage.setItem("tinku_estimated_margin", String(newMargin));
  };

  // --- FORMATEADOR DE COP ROBUSTO SIN REGEX BUG ---
  const formatMoney = (val: number) => {
    const rounded = Math.round(Math.abs(val));
    const formatted = rounded.toLocaleString("es-CO");
    return `${val < 0 ? "-" : ""}$${formatted}`;
  };

  // --- METRICAS DE INVENTARIO GENERAL ---
  const totalProducts = products.length;
  const inventoryValue = products.reduce(
    (sum, p) => sum + (p.price ?? 0) * (p.stock ?? 0),
    0,
  );
  const categories = [...new Set(products.map((p) => p.category || "General"))]
    .length;

  // --- FILTRO DE ÓRDENES ACTIVAS ---
  const activeOrders = orders.filter((o) => o.status !== "canceled");

  // --- RESUMEN HISTÓRICO DE VENTAS ---
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  // --- CÁLCULO DE ÓRDENES PARA EL DÍA SELECCIONADO EN EL CALENDARIO ---
  const selectedDayOrders = activeOrders.filter((o) => {
    if (!o.createdAt) return false;
    const date = parseOrderDate(o.createdAt);
    if (!date) return false;
    return getOperationalDateYYYYMMDD(date) === selectedDateString;
  });

  // --- DESGLOSE DE INGRESOS DEL DÍA SELECCIONADO ---
  const cashSelectedDay = selectedDayOrders
    .filter((o) => o.paymentMethod === "cash")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const transferSelectedDay = selectedDayOrders
    .filter((o) => o.paymentMethod === "transfer")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const totalSelectedDay = cashSelectedDay + transferSelectedDay;

  // --- CÁLCULO DE COGS (COSTO DE MERCANCÍA VENDIDA) DE LA JORNADA SELECCIONADA ---
  const cogsSelectedDay = selectedDayOrders.reduce((sum, o) => {
    const orderItems = o.items || [];
    const orderCogs = orderItems.reduce((itemSum, item) => {
      const matchedProduct = products.find((p) => {
        const productWithSku = p as typeof p & { sku?: string };
        return p.id === item.id || productWithSku.sku === item.id;
      });

      const unitCost =
        matchedProduct && matchedProduct.price > 0
          ? matchedProduct.price
          : item.price * (1 - estimatedMargin / 100);

      return itemSum + unitCost * item.quantity;
    }, 0);
    return sum + orderCogs;
  }, 0);

  // --- UTILIDAD BRUTA (Ingreso - Costo Mercancía) ---
  const grossProfitSelectedDay = Math.max(
    0,
    totalSelectedDay - cogsSelectedDay,
  );

  // --- UTILIDAD NETA LIBRE ("Para ti") ---
  const netProfitForMe = grossProfitSelectedDay - dailyFixedCost - savingsGoal;

  // --- COMPROBAR SI LA UTILIDAD ES VÁLIDA HOY ---
  const isProfitValid = netProfitForMe > 0;

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

  // Formatear la fecha seleccionada de forma más cálida para el usuario
  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    const dateObj = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10),
    );
    return dateObj.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 md:p-6 bg-[#F0F4F8] min-h-screen text-gray-900 pb-20">
      {/* 🚀 ENCABEZADO PRINCIPAL DE LA APP (DINÁMICO Y MULTI-TENANT) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-2xl font-black text-gray-800 flex items-center gap-2">
            📊 Mi negocio
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Mira cómo te fue hoy, de un vistazo.
          </p>
        </div>
        <div className="text-left sm:text-right flex flex-col sm:items-end gap-0.5">
          <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 w-fit">
            ● Caja abierta
          </span>
          <span className="text-[11px] text-gray-500 font-medium">
            Cierre diario: 4:00 a. m.
          </span>
        </div>
      </div>

      {/* 📆 SECCIÓN INTERACTIVA: CALENDARIO DE CONSULTA COMPACTO */}
      <div className="mb-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <div>
              <h2 className="text-sm font-bold text-gray-800">
                Ver ventas de
              </h2>
              <p className="text-xs text-gray-500">
                Elige el día que quieres revisar
              </p>
            </div>
          </div>
          <input
            type="date"
            value={selectedDateString}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDateString(e.target.value);
              }
            }}
            max={getOperationalDateYYYYMMDD(new Date())}
            aria-label="Elegir día para ver las ventas"
            className="min-h-11 px-3 py-2 rounded-lg border border-gray-200 text-sm font-black text-orange-600 bg-orange-50/50 focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-lg">
          <span className="text-gray-500 font-bold">
            Día seleccionado:
          </span>
          <span className="font-bold text-gray-700 capitalize">
            {selectedDateString === getOperationalDateYYYYMMDD(new Date())
              ? "✨ Hoy"
              : formatFriendlyDate(selectedDateString)}
          </span>
        </div>
      </div>

      {/* 💵 METRICAS CLAVE DE HOY EN UNA SOLA FILA GRANDE COMPACTA */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="col-span-2 bg-orange-500 rounded-2xl p-4 shadow-sm text-center text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-100">
            Total vendido
          </p>
          <p className="text-3xl font-black mt-1">{formatMoney(totalSelectedDay)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border-b-4 border-b-emerald-500 shadow-sm text-center">
          <p className="text-xs text-gray-600 font-bold">Efectivo</p>
          <p className="text-base font-black text-emerald-600 mt-1">
            {formatMoney(cashSelectedDay)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border-b-4 border-b-blue-500 shadow-sm text-center">
          <p className="text-xs text-gray-600 font-bold">Transferencias</p>
          <p className="text-base font-black text-blue-600 mt-1">
            {formatMoney(transferSelectedDay)}
          </p>
        </div>
      </div>

      {/* 🧠 CONTROL DE AJUSTES FINANCIEROS (PANEL COLAPSABLE) */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-bold text-gray-700">
            🧠 Tus cuentas y metas
          </h2>
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="min-h-11 text-xs font-bold text-orange-700 hover:text-orange-800 flex items-center gap-1 bg-orange-50 px-3 py-2 rounded-lg transition-all border border-orange-100"
          >
            ⚙️ {isConfigOpen ? "Ocultar ajustes" : "Configurar cuentas"}
          </button>
        </div>

        {isConfigOpen && (
          <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-inner mb-3 transition-all space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-800 mb-0.5 flex items-center gap-1">
                ⚙️ Ajustes del Negocio
              </h3>
              <p className="text-xs text-gray-500">
                Define tus gastos y el ahorro que quieres separar para saber
                cuánto te queda realmente.
              </p>
            </div>

            <div className="space-y-4">
              {/* Gastos Fijos Mensuales (Para dividir por 31) */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-600 uppercase">
                    Gastos Fijos Mensuales:
                  </span>
                  <span className="text-xs font-black text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                    {formatMoney(monthlyFixedCost)}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="2200000"
                    step="10000"
                    value={monthlyFixedCost}
                    onChange={(e) =>
                      saveFinancialConfig(
                        parseInt(e.target.value, 10),
                        savingsGoal,
                        estimatedMargin,
                      )
                    }
                    className="flex-1 accent-orange-500 cursor-pointer h-1.5 bg-gray-100 rounded-lg appearance-none"
                  />
                  <span className="text-[9px] text-gray-400 font-bold w-20 text-right">
                    ({formatMoney(dailyFixedCost)} / día)
                  </span>
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  {[310000, 465000, 620000, 775000, 930000].map(
                    (val) => (
                      <button
                        key={`fc-${val}`}
                        onClick={() =>
                          saveFinancialConfig(val, savingsGoal, estimatedMargin)
                        }
                        className={`text-[9px] font-bold px-2 py-1 rounded transition-all ${monthlyFixedCost === val ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        {formatMoney(val)}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Fondo de Ahorro Diario */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-600 uppercase">
                    Ahorro Diario Protegido:
                  </span>
                  <span className="text-xs font-black text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                    {formatMoney(savingsGoal)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40000"
                  step="1000"
                  value={savingsGoal}
                  onChange={(e) =>
                    saveFinancialConfig(
                      monthlyFixedCost,
                      parseInt(e.target.value, 10),
                      estimatedMargin,
                    )
                  }
                  className="w-full accent-orange-500 cursor-pointer h-1.5 bg-gray-100 rounded-lg appearance-none"
                />
                <div className="flex gap-1.5 mt-1.5">
                  {[5000, 10000, 15000, 20000].map((val) => (
                    <button
                      key={`sg-${val}`}
                      onClick={() =>
                        saveFinancialConfig(
                          monthlyFixedCost,
                          val,
                          estimatedMargin,
                        )
                      }
                      className={`text-[9px] font-bold px-2 py-1 rounded transition-all ${savingsGoal === val ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {formatMoney(val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margen estimado para calcular la ganancia */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-600 uppercase">
                    Ganancia estimada por venta:
                  </span>
                  <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    {estimatedMargin}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={estimatedMargin}
                  onChange={(e) =>
                    saveFinancialConfig(
                      monthlyFixedCost,
                      savingsGoal,
                      parseInt(e.target.value, 10),
                    )
                  }
                  className="w-full accent-orange-500 cursor-pointer h-1.5 bg-gray-100 rounded-lg appearance-none"
                />
                <div className="flex gap-1.5 mt-1.5">
                  {[5, 10, 20, 25, 30, 35].map((val) => (
                    <button
                      key={`em-${val}`}
                      onClick={() =>
                        saveFinancialConfig(monthlyFixedCost, savingsGoal, val)
                      }
                      className={`text-[9px] font-bold px-2.5 py-1 rounded transition-all ${estimatedMargin === val ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 📊 TARJETA DEL SEMÁFORO FINANCIERO Y DEDUCCIONES COMPACTAS */}
      <div className="space-y-3 mb-6">
        {/* El Semáforo de Utilidad Real (Fila Principal) */}
        <div>
          {totalSelectedDay <= 0 ? (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center min-h-140px">
              <span className="text-3xl animate-bounce mb-2">🏪</span>
              <h4 className="font-bold text-gray-700 text-xs">
                Esperando el primer cobro
              </h4>
              <p className="text-[10px] text-gray-400 mt-0.5 max-w-xs">
                Los ingresos y utilidad neta aparecerán en cuanto registres una
                venta hoy.
              </p>
            </div>
          ) : isProfitValid ? (
            // Estado Verde: Utilidad Válida (Libre para gastar)
            <div className="bg-linear-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-md text-white">
              <div className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-lg">
                  🎉
                </span>
                <h4 className="text-xs font-black uppercase tracking-wider">
                  ¡Jornada de Éxito, {shopkeeperName}!
                </h4>
              </div>
              <p className="text-xs text-green-50 mt-1 font-medium leading-normal">
                Ya cubriste la mercancía, tus gastos del día (
                {formatMoney(dailyFixedCost)}) y guardaste tu ahorro diario de
                la casa.
              </p>

              <div className="my-3">
                <p className="text-xs font-black uppercase tracking-wider text-green-100">
                  Te queda libre hoy:
                </p>
                <p className="text-4xl font-black tracking-tight mt-1">
                  {formatMoney(netProfitForMe)}
                </p>
              </div>

              <div className="bg-white/15 p-3 rounded-xl text-xs font-bold">
                🤑 Esta es tu ganancia disponible. ¡Puedes usarla con tranquilidad!
              </div>
            </div>
          ) : (
            // Estado Naranja: Utilidad Bruta acumulada pero no cubre metas aún
            <div className="bg-white p-4 rounded-2xl border-l-8 border-l-orange-500 border border-orange-100 shadow-sm">
              <div className="flex items-center gap-1.5 text-orange-600">
                <span className="text-lg">💪</span>
                <h4 className="text-xs font-black uppercase tracking-wider">
                  ¡Vas por buen camino, {shopkeeperName}!
                </h4>
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-normal">
                Llevas una ganancia de{" "}
                <strong className="text-gray-700">
                  {formatMoney(grossProfitSelectedDay)}
                </strong>
                . Aún falta cubrir los gastos y el ahorro del día.
              </p>

              <div className="my-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                  Falta para cubrir tus gastos y quedar libre:
                </p>
                <p className="text-2xl font-black text-gray-800 mt-0.5">
                  {formatMoney(Math.abs(netProfitForMe))}
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-100 p-2.5 rounded-xl text-[10px] font-semibold text-orange-700 leading-normal">
                ⚡ Sigue sumando cobros con tu calculadora express o catálogo
                para superar el punto de equilibrio hoy.
              </div>
            </div>
          )}
        </div>

        {/* Deducciones Compactas (Visible solo si hay ventas) */}
        {totalSelectedDay > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-xs space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span>Total vendido:</span>
              <span className="font-bold text-gray-700">
                {formatMoney(totalSelectedDay)}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Costo de la mercancía:</span>
              <span className="font-bold text-gray-700">
                {formatMoney(cogsSelectedDay)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-dashed border-gray-100 pt-1.5 text-gray-500 font-bold">
              <span>Ganancia antes de gastos:</span>
              <span className="text-gray-800">
                {formatMoney(grossProfitSelectedDay)}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Gastos del día:</span>
              <span className="text-red-500 font-medium">
                -{formatMoney(dailyFixedCost)}
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Ahorro separado:</span>
              <span className="text-blue-500 font-medium">
                -{formatMoney(savingsGoal)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 📊 METRICAS GENERALES HISTÓRICAS DE INVENTARIO (PIE DE PÁGINA COMPACTO) */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-2.5">
          📈 Resumen de tu negocio
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <p className="text-gray-600 text-xs font-bold">
              Ventas acumuladas
            </p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">
              {formatMoney(totalRevenue)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <p className="text-gray-600 text-xs font-bold">
              Valor del inventario
            </p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">
              {formatMoney(inventoryValue)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <p className="text-gray-600 text-xs font-bold">
              Productos
            </p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">
              {totalProducts} un.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
