import { useState, useEffect } from "react";
import ProductCard from "../components/molecules/ProductCard";
import Navbar from "../components/organisms/Navbar";
import QuickCheckoutDrawer from "../components/organisms/QuickCheckoutDrawer";
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

  const products = useStockStore((state) => state.products);
  const fetchProducts = useStockStore((state) => state.fetchProducts);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const activeDraftId = useCartStore((state) => state.activeDraftId);
  const clearActiveDraftId = useCartStore((state) => state.clearActiveDraftId);

  // 1. Carga limpia de productos (SIN pasarle UID porque el stock de la tienda es global)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        await fetchProducts(user?.uid ?? "");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [fetchProducts]);

  // 2. Limpieza de borradores/drafts cuando el carrito se vacía
  useEffect(() => {
    if (!activeDraftId || cart.length > 0) return;

    const cleanupDraft = async () => {
      try {
        await deleteDoc(doc(db, "draftOrders", activeDraftId));
      } catch (error) {
        console.error("Error deleting resumed draft after cart was cleared:", error);
      } finally {
        clearActiveDraftId();
      }
    };

    cleanupDraft();
  }, [activeDraftId, cart.length, clearActiveDraftId]);

  // 🚪 Función de Cierre de Sesión Blindada contra Clics por Error
  const handleSafeLogout = async () => {
    const confirmLogout = window.confirm(
      "⚠️ ¿Estás seguro de que deseas cerrar sesión de tu cuenta de TINKU?\n\nEsto bloqueará el mostrador hasta que vuelvas a ingresar tus datos de acceso."
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
        onCheckout={() => navigate("/checkout")}
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        
        {/* 💻 NAVEGACIÓN DESKTOP ELEGANTE */}
        <div className="hidden md:flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <div>
              <p className="font-bold text-gray-800 text-sm">Mostrador TINKU</p>
              <p className="text-xs text-gray-400">Operando con {products.length} productos en stock</p>
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
              <h3 className="font-black text-base tracking-wide">Cobro Express</h3>
              <p className="text-xs text-orange-100 mt-0.5">Calculadora rápida: suma y cobra al vuelo sin digitar inventario</p>
            </div>
          </div>
          <button className="bg-white text-orange-600 hover:bg-orange-50 font-black px-4 py-2 rounded-xl text-xs shadow-md shadow-orange-900/10 tracking-wider uppercase transition-all shrink-0">
            Abrir Teclado 🧮
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
              {search ? "Prueba con otra palabra clave" : "Ve al gestor de Stock para agregar productos."}
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

      {/* 📱 BOTÓN FLOTANTE COBRO EXPRESS EN MÓVIL (Fiel al pulgar rápido de doña Mercedes) */}
      <button
        onClick={() => setIsQuickDrawerOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-orange-500 hover:bg-orange-600 text-white p-4.5 rounded-full shadow-2xl active:scale-95 transition-all md:hidden flex items-center justify-center border border-orange-400/30"
        style={{ width: "56px", height: "56px" }}
        title="Abrir Cobro Express"
      >
        <span className="text-2xl font-bold">⚡</span>
      </button>

      {/* El Drawer de la Calculadora Futurista */}
      <QuickCheckoutDrawer 
        isOpen={isQuickDrawerOpen} 
        onClose={() => setIsQuickDrawerOpen(false)} 
      />

      {/* 📱 BARRA DE NAVEGACIÓN MÓVIL PERSISTENTE */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-xl px-4 py-3 flex justify-around items-center z- md:hidden">
        {/* Vender (Ruta Actual - Activa) */}
        <button
          onClick={() => navigate("/")}
          className="flex flex-col items-center gap-1 text-orange-500 font-black"
        >
          <span className="text-xl">⚡</span>
          <span className="text-[10px] tracking-wide">Vender</span>
        </button>

        {/* Dashboard */}
        <button
          onClick={() => navigate("/admin")}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-orange-500 font-semibold transition-all"
        >
          <span className="text-xl">📊</span>
          <span className="text-[10px] tracking-wide">Dashboard</span>
        </button>

        {/* Stock */}
        <button
          onClick={() => navigate("/admin/stock")}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-orange-500 font-semibold transition-all"
        >
          <span className="text-xl">📦</span>
          <span className="text-[10px] tracking-wide">Stock</span>
        </button>

        {/* Ventas */}
        <button
          onClick={() => navigate("/admin/sales")}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-orange-500 font-semibold transition-all"
        >
          <span className="text-xl">💰</span>
          <span className="text-[10px] tracking-wide">Ventas</span>
        </button>

        {/* Salir (Con Confirmación Segura contra Accidentes) */}
        <button
          onClick={handleSafeLogout}
          className="flex flex-col items-center gap-1 text-gray-300 hover:text-red-500 font-semibold transition-all"
        >
          <span className="text-xl">🚪</span>
          <span className="text-[10px] tracking-wide">Salir</span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;