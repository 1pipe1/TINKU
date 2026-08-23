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

  const products = useStockStore((state) => state.products);
  const fetchProducts = useStockStore((state) => state.fetchProducts);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const activeDraftId = useCartStore((state) => state.activeDraftId);
  const clearActiveDraftId = useCartStore((state) => state.clearActiveDraftId);

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

      <div className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Bienvenido,{" "}
            <span className="text-orange-600">{user?.email || "Usuario"}</span>
          </h2>

          <button
            onClick={logout}
            className="bg-orange-600 hover:opacity-85 text-white font-semibold py-2 px-3 rounded-md"
          >
            Cerrar Sesión
          </button>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {search
                ? `No se encontraron productos para "${search}"`
                : "No hay productos disponibles en tu tienda todavía."}
            </p>

            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-4 text-orange-500 font-semibold rounded-md"
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
