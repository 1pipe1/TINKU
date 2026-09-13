import { useEffect, useState } from "react";
import { doc, updateDoc, deleteDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import useStockStore from "../store/useStockStore";
import useAuthStore from "../store/useAuthStore";
import type { Product } from "../types/product";

const emptyForm = {
  title: "",
  category: "",
  price: "",
  cost: "",
  stock: "",
  image: "",
};

type StockForm = typeof emptyForm;

const StockPage = () => {
  const products = useStockStore((state) => state.products);
  const fetchProducts = useStockStore((state) => state.fetchProducts);
  const user = useAuthStore((state) => state.user);
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<StockForm>(emptyForm);
  const [search, setSearch] = useState("");

  const uid = user?.uid || user?.id;

  useEffect(() => {
    if (uid) {
      fetchProducts(uid).then(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProducts, uid]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      title: product.title ?? product.name ?? "",
      category: product.category ?? "",
      price: String(product.price ?? 0),
      cost: String(product.cost ?? 0),
      stock: String(product.stock ?? 0),
      image: product.image ?? "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, productName: string) => {
    const confirmDelete = confirm(
      `⚠️ ¿Estás seguro de que deseas eliminar "${productName}" de tu catálogo?`
    );
    if (!confirmDelete || !uid) return;
    
    try {
      await deleteDoc(doc(db, "usuarios", uid, "productos", id));
      await fetchProducts(uid);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("No se pudo eliminar el producto.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uid) return;
    
    const data = {
      nombre: form.title.trim(),
      title: form.title.trim(),
      categoria: form.category.trim() || "General",
      precio: parseFloat(form.price) || 0,
      costo: parseFloat(form.cost) || 0,
      stock: parseInt(form.stock, 10) || 0,
      image: form.image.trim(),
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, "usuarios", uid, "productos", editingProduct.id), data);
      } else {
        await addDoc(collection(db, "usuarios", uid, "productos"), data);
      }
      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyForm);
      await fetchProducts(uid);
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Hubo un error al guardar los datos.");
    }
  };

  const filteredProducts = products.filter((p) => {
    const name = p.title || p.name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <p className="p-8 text-gray-500 text-center text-lg font-bold">Cargando inventario...</p>;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto bg-[#F0F4F8] min-h-screen pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-800 flex items-center gap-2">
            📦 Control de Stock
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Administra tus productos e inventario privado</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-all shadow-md"
        >
          + Agregar Producto
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Buscar producto en tu inventario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-orange-500 shadow-xs"
        />
      </div>

      {/* Formulario Modal / Card */}
      {showForm && (
        <div className="mb-6 p-5 bg-white rounded-2xl shadow-lg border border-orange-100 animate-fadeIn">
          <h2 className="text-base font-bold text-gray-800 mb-3">
            {editingProduct ? "✏️ Editar Producto" : "➕ Nuevo Producto"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nombre</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-orange-500"
                placeholder="Ej. Coca Cola 1.5L"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Categoría</label>
              <input
                type="text"
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-orange-500"
                placeholder="Ej. Bebidas"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Precio Venta ($)</label>
              <input
                type="number"
                required
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Costo Proveedor ($)</label>
              <input
                type="number"
                min="0"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-orange-500"
                placeholder="Opcional"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Stock Actual (Unidades)</label>
              <input
                type="number"
                required
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-xs transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl text-xs transition-all shadow-sm"
              >
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de productos */}
      <div className="grid grid-cols-1 gap-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => {
            const isOutOfStock = p.stock === 0;
            const isLowStock = (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5;

            return (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-xs border border-gray-100"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800 text-sm truncate">
                      {p.title || p.name || "Producto sin nombre"}
                    </p>
                    {isOutOfStock ? (
                      <span className="text-[9px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-md">
                        🚫 Agotado
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">
                        ⚠️ Bajo ({p.stock})
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Categoría: <span className="font-semibold text-gray-700">{p.category || "General"}</span> | Stock: <span className="font-bold text-gray-800">{p.stock} un.</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-black text-orange-600 text-base">
                    ${(p.price ?? 0).toLocaleString("es-CO")}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-blue-600 hover:bg-blue-50 font-black text-xs px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.title || p.name || "este producto")}
                      className="text-red-500 hover:bg-red-50 font-black text-xs px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 p-6">
            <span className="text-4xl block mb-2">📦</span>
            <p className="text-gray-700 font-bold text-sm">No se encontraron productos</p>
            <p className="text-gray-400 text-xs mt-0.5">Agrega un producto nuevo para empezar a gestionar tu stock.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockPage;
