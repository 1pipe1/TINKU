import { useState, useEffect } from "react";
import ProductCard from "../components/molecules/ProductCard";
import Navbar from "../components/organisms/Navbar";
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

  // ⚡ Estados para la función "Venta Rápida"
  const [quickPrice, setQuickPrice] = useState("");
  const [quickCategory, setQuickCategory] = useState("General");

  const products = useStockStore((state) => state.products);
  const fetchProducts = useStockStore((state) => state.fetchProducts);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const activeDraftId = useCartStore((state) => state.activeDraftId);
  const clearActiveDraftId = useCartStore((state) => state.clearActiveDraftId);
  const addToCart = useCartStore((state) => state.addToCart);

  // 1. Carga limpia de productos pasándole el UID privado
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
        console.error("Error deleting resumed draft after cart was cleared:", error);
      } finally {
        clearActiveDraftId();
      }
    };

    cleanupDraft();
  }, [activeDraftId, cart.length, clearActiveDraftId]);

  // ⚡ Manejador de la "Venta Rápida" sin afectar stock
  const handleQuickSale = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(quickPrice);
    if (isNaN(price) || price <= 0) {
      alert("Por favor ingresa un precio válido mayor a 0");
      return;
    }

    // Insertamos un ítem virtual que CheckoutPage sabe procesar sin descontar inventario
    addToCart({
      id: `venta-rapida-${Date.now()}`,
      title: `Venta Rápida (${quickCategory})`,
      price: price,
      category: quickCategory,
      stock: 9999, // Stock infinito virtual para evitar advertencias de "Últimas unidades"
      image: "",
    } as any);

    setQuickPrice(""); // Reset de precio
    alert(`⚡ Venta rápida de $${price.toLocaleString()} agregada al carrito.`);
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
    <div className="min-h-screen bg-[#F0F4F8] text-gray-900">
      <Navbar
        search={search}
        onSearchChange={(val) => setSearch(val)}
        onCheckout={() => navigate("/checkout")}
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header con Bienvenida y Cierre de Sesión */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Bienvenido,{" "}
            <span className="text-orange-600">{user?.email || "Usuario"}</span>
          </h2>

          <button
            onClick={logout}
            className="bg-orange-600 hover:opacity-85 text-white font-semibold py-2 px-3 rounded-md transition-all text-sm"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* ⚡ SECCIÓN MULTI-TENANT: VENTA RÁPIDA (Sin Inventario) */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Venta Rápida</h3>
              <p className="text-xs text-gray-500">Registra un valor al vuelo sin buscar producto</p>
            </div>
          </div>
          
          <form onSubmit={handleQuickSale} className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Input de Precio */}
            <div className="relative flex-1 md:flex-initial">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">$</span>
              <input
                type="number"
                placeholder="Precio Venta"
                required
                min="50"
                step="50"
                value={quickPrice}
                onChange={(e) => setQuickPrice(e.target.value)}
                className="w-full md:w-36 pl-7 pr-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>

            {/* Categoría para calcular el margen estimado */}
            <select
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 font-medium focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="General">Categoría: General</option>
              <option value="Bebidas">Categoría: Bebidas</option>
              <option value="Cigarrillos">Categoría: Cigarrillos</option>
              <option value="Pasabocas">Categoría: Pasabocas</option>
            </select>

            {/* Botón Agregar */}
            <button
              type="submit"
              className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2 rounded-xl text-sm transition-all shadow-md shadow-green-100"
            >
              + Agregar al Carrito
            </button>
          </form>
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
    </div>
  );
};

export default HomePage;
