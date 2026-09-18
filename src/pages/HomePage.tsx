import { useState, useEffect } from "react";
import ProductCard from "../components/molecules/ProductCard";
import Navbar from "../components/organisms/Navbar";
import QuickCheckoutDrawer from "../components/organisms/QuickCheckoutDrawer";
import { CartDrawer } from "../components/organisms/CartDrawer";
import LogoutConfirmModal from "../components/molecules/LogoutConfirmModal";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import useStockStore from "../store/useStockStore";
import useCartStore from "../store/useCartStore";
import { deleteDoc, doc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import type { FC, FormEvent } from "react";

const HomePage: FC = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isQuickDrawerOpen, setIsQuickDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); // 🔥 Control de apertura del Carrito Deslizable!
  const [isExpressPriceOpen, setIsExpressPriceOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [draftCount, setDraftCount] = useState<number>(0);
  const [expressProductName, setExpressProductName] = useState("");
  const [expressPriceInput, setExpressPriceInput] = useState("1000");

  const products = useStockStore((state) => state.products);
  const fetchProducts = useStockStore((state) => state.fetchProducts);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const activeDraftId = useCartStore((state) => state.activeDraftId);
  const clearActiveDraftId = useCartStore((state) => state.clearActiveDraftId);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const addToCart = useCartStore((state) => state.addToCart);

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  // 1. Carga limpia de productos pasándole el UID privado (Multi-tenant)
  useEffect(() => {
    const loadProducts = async () => {
      const uid = user?.uid || user?.id || "demo-tinku-user";
      try {
        await fetchProducts(uid);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [fetchProducts, user?.uid, user?.id]);

  // 2. Limpieza de borradores/drafts cuando el carrito se vacía
  useEffect(() => {
    if (!activeDraftId || cart.length > 0) return;

    const cleanupDraft = async () => {
      try {
        await deleteDoc(doc(db, "draftOrders", activeDraftId));
      } catch (error) {
        console.error(
          "Error deleting resumed draft after cart was cleared:",
          error,
        );
      } finally {
        clearActiveDraftId();
      }
    };

    cleanupDraft();
  }, [activeDraftId, cart.length, clearActiveDraftId]);

  // 3. Escuchar ventas pausadas/suspendidas en tiempo real
  useEffect(() => {
    const uid = user?.uid;
    if (!uid) return;
    try {
      const q = query(
        collection(db, "draftOrders"),
        where("status", "==", "suspended"),
      );
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          setDraftCount(snapshot.size);
        },
        (err) => console.warn("Error leyendo draftOrders en HomePage:", err),
      );
      return () => unsub();
    } catch (e) {
      console.warn("Error setting up draftOrders listener:", e);
    }
  }, [user?.uid]);

  // ⚡ Lógica limpia de Venta Express / Agregar Producto
  // 👇 Updated `handleAddProduct` function
  const handleAddProduct = (searchQuery: string, expressPrice?: number) => {
    const existingProduct = products.find(
      (p) =>
        (
          p.title ||
          (p as any).nombre ||
          (p as any).name ||
          ""
        ).toLowerCase() === searchQuery.toLowerCase() ||
        (p as any).sku === searchQuery,
    );

    // A price from the Express prompt must always create an Express item.
    // Otherwise an exact catalog match would silently replace the entered price.
    if (existingProduct && expressPrice === undefined) {
      // SÍ EXISTE: Flujo normal sin fricción
      addToCart({ ...existingProduct, quantity: 1 });
    } else {
      // NO EXISTE: Inyectamos un ítem virtual Express al carrito inmediatamente ⚡
      const expressItem = {
        id: "express-" + Date.now(), // ID temporal único para el carrito
        sku: "EXP-" + Date.now(),
        title: searchQuery || "Producto Express",
        quantity: 1,
        price: expressPrice ?? 0, // Precio digitado al vuelo
        cost: 0, // Aún no sabemos el costo
        stock: 999, // Stock infinito virtual para que no rebote
        category: "Venta Express",
        isExpress: true, // 🌟 LA BANDERA CLAVE
      };

      addToCart(expressItem as any);
      setSearch(""); // Limpia la barra de búsqueda inmediatamente
      setIsCartOpen(false); // Asegúrate de que `isCartOpen` permanezca en `false`
    }
  };

  const openExpressPriceDialog = () => {
    setExpressProductName(search.trim());
    setExpressPriceInput("");
    setIsExpressPriceOpen(true);
  };

  const handleExpressPriceSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = parseFloat(expressPriceInput.trim().replace(",", "."));

    if (!expressProductName || !Number.isFinite(price) || price <= 0) {
      return;
    }

    handleAddProduct(expressProductName, price);
    setSearch("");
    setIsExpressPriceOpen(false);
  };

  // 🚪 Función de Cierre de Sesión Seguro (Compatible con iframes)
  const handleSafeLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
    navigate("/login");
  };

  // 3. Filtro de búsqueda por nombre o título
  const filteredProducts = products.filter((product: any) => {
    const title = product?.nombre || product?.title || product?.name || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-gray-600 font-semibold">
            Cargando productos de tu tienda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-gray-900 pb-20 md:pb-8">
      {/* Navbar Superior Fijo */}
      <Navbar
        search={search}
        onSearchChange={(val) => setSearch(val)}
        onCheckout={() => setIsCartOpen(true)}
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* 💻 NAVEGACIÓN DESKTOP ELEGANTE */}
        <div className="hidden md:flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <div>
              <p className="font-bold text-gray-800 text-sm">Mostrador TINKU</p>
              <p className="text-xs text-gray-400">
                Operando con {products.length} productos en stock
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="text-gray-600 hover:text-orange-500 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-all"
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => navigate("/admin/stock")}
              className="text-gray-600 hover:text-orange-500 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-all"
            >
              📦 Inventario
            </button>
            <button
              onClick={() => navigate("/admin/sales")}
              className="text-gray-600 hover:text-orange-500 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-all"
            >
              💰 Ventas
            </button>
            <button
              onClick={() => navigate("/admin/drafts")}
              className="relative text-gray-600 hover:text-orange-500 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-all flex items-center gap-1.5"
              title="Ventas pausadas / suspendidas"
            >
              <span>⏸️ Pausadas</span>
              {draftCount > 0 && (
                <span className="bg-orange-500 text-white text-xs font-black rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center shadow-xs">
                  {draftCount}
                </span>
              )}
            </button>
            <button
              onClick={handleSafeLogout}
              className="text-gray-400 hover:text-red-600 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
            >
              🚪 Salir
            </button>
          </div>
        </div>

        {/* ⚡ SECCIÓN MULTI-TENANT: COBRO EXPRESS (CALCULADORA DE COMBATE) */}
        <div
          onClick={() => setIsQuickDrawerOpen(true)}
          className="bg-linear-to-r from-orange-500 to-amber-600 p-5 rounded-2xl shadow-sm text-white mb-6 flex items-center justify-between cursor-pointer hover:from-orange-600 hover:to-amber-700 active:scale-98 transition-all border border-orange-400/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl animate-pulse">
              ⚡
            </div>
            <div>
              <h3 className="font-black text-base tracking-wide">
                Cobro Express
              </h3>
              <p className="text-xs text-orange-100 mt-0.5">
                Suma y cobra al vuelo sin digitar inventario
              </p>
            </div>
          </div>
          <button className="bg-white text-orange-600 hover:bg-orange-50 font-black px-6 py-2 rounded-xl text-xs shadow-md shadow-orange-800/10 tracking-wider transition-all shrink-0">
            Registrar venta
          </button>
        </div>

        {/* Parrilla de Productos del Catálogo */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <span className="text-3xl mb-2 block font-black">⚡</span>
            <p className="text-gray-700 text-lg font-bold">
              {search
                ? `No se encontraron productos para "${search}"`
                : "No hay productos disponibles en tu tienda todavía."}
            </p>
            <p className="text-gray-400 text-xs mt-1 mb-4">
              {search
                ? "Agrégalo como Venta Express para cobrarlo sin trancar la fila."
                : "Ve al gestor de Stock para agregar productos."}
            </p>

            {search && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center items-center max-w-xs mx-auto">
                <button
                  onClick={openExpressPriceDialog}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  ⚡ Cobrar "{search}" Rápido
                </button>
                <button
                  onClick={() => setSearch("")}
                  className="w-full text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Limpiar búsqueda
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* El Drawer de la Calculadora Futurista */}
      <QuickCheckoutDrawer
        isOpen={isQuickDrawerOpen}
        onClose={() => setIsQuickDrawerOpen(false)}
      />

      {/* 🔥 NUESTRO NUEVO CARRITO DESLIZABLE COMPACTO 🔥 */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {isExpressPriceOpen && (
        <div
          className="fixed inset-0 z-120 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsExpressPriceOpen(false);
            }
          }}
        >
          <form
            onSubmit={handleExpressPriceSubmit}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 className="text-lg font-black text-gray-800">
              Precio de venta
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              ¿A cómo vas a vender "{expressProductName}"?
            </p>
            <label className="mt-5 block text-sm font-bold text-gray-700">
              Precio
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={expressPriceInput}
                onChange={(event) => setExpressPriceInput(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-lg font-bold focus:border-orange-500 focus:outline-none"
                aria-label="Precio de venta"
              />
            </label>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setIsExpressPriceOpen(false)}
                className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white hover:bg-orange-600"
              >
                Agregar al carrito
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Acceso de rescate: permanece disponible al bajar por el catálogo */}
      {!isQuickDrawerOpen && !isCartOpen && (
        <button
          onClick={() => setIsQuickDrawerOpen(true)}
          aria-label="Abrir calculadora de cobro express"
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-orange-500 text-white shadow-xl border border-orange-400 flex items-center justify-center active:scale-95 transition-all md:hidden"
        >
          <span className="text-2xl">⚡</span>
        </button>
      )}

      {/* 🔥 BARRA FLOTANTE DE RÁFAGA ACUMULADORA (Sutil, elegante y ergonómica) 🔥 */}
      {cart.length > 0 && !isCartOpen && !isQuickDrawerOpen && (
        <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:w-100 z-100 animate-slide-up">
          <div
            onClick={() => setIsCartOpen(true)}
            className="bg-[#0F172A] text-white p-3 rounded-2xl shadow-3xl border border-gray-800 flex items-center justify-between cursor-pointer hover:bg-slate-900 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl bg-orange-500/20 text-orange-400 p-2.5 rounded-xl">
                🛒
              </span>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Cuentas Claras
                </p>
                <p className="text-sm font-black text-white">
                  {totalItems} {totalItems === 1 ? "producto" : "productos"} en
                  caja
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                  Total
                </p>
                <p className="text-base font-black text-orange-400">
                  {"$" +
                    totalPrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                </p>
              </div>
              <span className="bg-green-500 hover:bg-green-600 text-white font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-md">
                Cobrar 👉
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 📱 BARRA DE NAVEGACIÓN MÓVIL PERSISTENTE */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl px-3 py-2 flex justify-around items-center z-50 md:hidden">
        {/* Vender */}
        <button
          onClick={() => navigate("/")}
          aria-label="Registrar una nueva venta"
          className="flex-[1.25] flex flex-col items-center gap-0.5 min-h-14 justify-center rounded-xl border-2 border-orange-500 bg-orange-500 text-white shadow-md active:scale-95 transition-all"
        >
          <span className="text-2xl leading-none">⚡</span>
          <span className="text-sm tracking-wide font-black">Vendiendo</span>
        </button>

        {/* Dashboard */}
        <button
          onClick={() => navigate("/admin")}
          className="flex-1 flex flex-col items-center gap-1 min-h-14 justify-center text-gray-400 hover:text-orange-500 font-semibold transition-all"
        >
          <span className="text-xl">📊</span>
          <span className="text-[11px] tracking-wide font-bold">Resumen</span>
        </button>

        {/* Stock */}
        <button
          onClick={() => navigate("/admin/stock")}
          className="flex-1 flex flex-col items-center gap-1 min-h-14 justify-center text-gray-400 hover:text-orange-500 font-semibold transition-all"
        >
          <span className="text-xl">📦</span>
          <span className="text-[11px] tracking-wide font-bold">
            Inventario
          </span>
        </button>

        {/* Ventas */}
        <button
          onClick={() => navigate("/admin/sales")}
          className="flex-1 flex flex-col items-center gap-1 min-h-14 justify-center text-gray-400 hover:text-orange-500 font-semibold transition-all"
        >
          <span className="text-xl">💰</span>
          <span className="text-[11px] tracking-wide font-bold">Ventas</span>
        </button>

        {/* Ventas Suspendidas / Pausadas */}
        <button
          onClick={() => navigate("/admin/drafts")}
          className="flex-1 flex flex-col items-center gap-1 min-h-14 justify-center text-gray-400 hover:text-orange-500 font-semibold transition-all relative"
        >
          <div className="relative">
            <span className="text-xl">⏸️</span>
            {draftCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-xs animate-pulse">
                {draftCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-wide font-bold">Pausadas</span>
        </button>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        userEmail={user?.email}
      />
    </div>
  );
};

export default HomePage;
