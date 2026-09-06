import { useState, useEffect } from "react";
import ProductCard from "../components/molecules/ProductCard";
import Navbar from "../components/organisms/Navbar";
import QuickCheckoutDrawer from "../components/organisms/QuickCheckoutDrawer";
import { CartDrawer } from "../components/organisms/CartDrawer"; // 🔥 Nuestro nuevo y simplificado Carrito Deslizable!
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import useStockStore from "../store/useStockStore";
import useCartStore from "../store/useCartStore";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import type { FC } from "react";

const HomePage: FC = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isQuickDrawerOpen, setIsQuickDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); // 🔥 Control de apertura del Carrito Deslizable!

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

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  // 1. Carga limpia de productos pasándole el UID privado (Multi-tenant)
  useEffect(() => {
    const loadProducts = async () => {
      if (!user?.uid) return;
      try {
        await fetchProducts(user.uid);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [fetchProducts, user?.uid]);

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

  // 🚪 Función de Cierre de Sesión Blindada contra Clics por Error
  const handleSafeLogout = async () => {
    const confirmLogout = window.confirm(
      "⚠️ ¿Estás seguro de que deseas cerrar sesión de tu cuenta de TINKU?\n\nEsto bloqueará el mostrador hasta que vuelvas a ingresar tus datos de acceso.",
    );
    if (confirmLogout) {
      await logout();
      navigate("/login");
    }
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
          <p className="text-gray-600">Cargando productos de tu tienda...</p>
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
        onCheckout={() => setIsCartOpen(true)} // 🔥 ¡En lugar de ir a otra página, deslizamos el carrito en caliente!
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
              📦 Stock
            </button>
            <button
              onClick={() => navigate("/admin/sales")}
              className="text-gray-600 hover:text-orange-500 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-all"
            >
              💰 Ventas
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
              <p className="text-xs  text-orange-100 mt-0.5">
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
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-gray-600 text-lg font-medium">
              {search
                ? `No se encontraron productos para "${search}"`
                : "No hay productos disponibles en tu tienda todavía."}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {search
                ? "Prueba con otra palabra clave"
                : "Ve al gestor de Stock para agregar productos."}
            </p>

            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-4 text-orange-500 font-semibold rounded-md text-sm hover:underline"
              >
                Limpiar búsqueda
              </button>
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
          <span className="text-[11px] tracking-wide font-bold">Stock</span>
        </button>

        {/* Ventas */}
        <button
          onClick={() => navigate("/admin/sales")}
          className="flex-1 flex flex-col items-center gap-1 min-h-14 justify-center text-gray-400 hover:text-orange-500 font-semibold transition-all"
        >
          <span className="text-xl">💰</span>
          <span className="text-[11px] tracking-wide font-bold">Ventas</span>
        </button>

        {/* Salir */}
        <button
          onClick={handleSafeLogout}
          className="flex-1 flex flex-col items-center gap-1 min-h-14 justify-center text-gray-400 hover:text-red-500 font-semibold transition-all"
        >
          <span className="text-xl">🚪</span>
          <span className="text-[11px] tracking-wide font-bold">Salir</span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
