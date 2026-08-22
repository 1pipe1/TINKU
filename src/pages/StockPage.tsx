import { useEffect, useState } from "react";
import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { db } from "../firebase";
import useStockStore from "../store/useStockStore";
import type { Product } from "../types/product";

const emptyForm = {
  title: "",
  category: "",
  price: "",
  stock: "",
  image: "",
};

type StockForm = typeof emptyForm;
const StockPage = () => {
  const products = useStockStore((state) => state.products);
  const fetchProducts = useStockStore((state) => state.fetchProducts);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<StockForm>(emptyForm);

  useEffect(() => {
    fetchProducts().then(() => setLoading(false));
  }, [fetchProducts]);
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      title: product.title ?? "",
      category: product.category ?? "",
      price: String(product.price ?? 0),
      stock: String(product.stock),
      image: product.image ?? "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await deleteDoc(doc(db, "productos", id));
    fetchProducts();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
const data = {
  nombre: form.title, // Firestore usa 'nombre'
  categoria: form.category, // Firestore usa 'categoria'
  precio: parseFloat(form.price), // Firestore usa 'precio'
  stock: parseInt(form.stock, 10) || 0,
  image: form.image,
};
if (editingProduct) {
  await updateDoc(doc(db, "productos", editingProduct.id), data); // Colección en español
} else {
  await addDoc(collection(db, "productos"), data); // Colección en español
}
    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    fetchProducts();
  };

  if (loading)
    return <p className="p-8 text-gray-500">Cargando productos...</p>;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-100 rounded-lg">
        <h1 className="text-2xl font-bold">📦 Stock</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg text-sm"
        >
          + Agregar
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? "Editar producto" : "Agregar producto"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="Nombre"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <input
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="Categoría"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
              <input
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="Precio"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
              <input
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="Stock"
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
              <input
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="URL de imagen"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg"
                >
                  {editingProduct ? "Guardar cambios" : "Agregar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLA — solo desktop */}
      <div className="hidden md:block">
        <table className="bg-white rounded-xl shadow overflow-hidden w-full">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="p-3 text-left">Producto</th>
              <th className="p-3 text-left">Categoría</th>
              <th className="p-3 text-left">Precio</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isOutOfStock = product.stock === 0;
              const isLowStock = product.stock > 0 && product.stock <= 10;
              return (
                <tr
                  key={product.id}
                  className={`border-t border-gray-100 transition-colors ${isOutOfStock ? "bg-red-50 hover:bg-red-100" : isLowStock ? "bg-yellow-50 hover:bg-yellow-100" : "hover:bg-gray-50"}`}
                >
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-10 h-10 object-contain"
                    />
                    <span className="text-sm font-medium">{product.title}</span>
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="p-3 text-sm font-semibold text-orange-500">
                    ${product.price.toLocaleString()}
                  </td>
                  <td className="p-3 text-sm font-semibold">
                    <span
                      className={
                        isOutOfStock
                          ? "text-red-600"
                          : isLowStock
                            ? "text-yellow-600"
                            : "text-gray-700"
                      }
                    >
                      {isOutOfStock
                        ? "🚫 0"
                        : isLowStock
                          ? `⚠️ ${product.stock}`
                          : product.stock}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-3 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CARDS — solo móvil */}
      <div className="md:hidden space-y-3">
        {products.map((product) => {
          const isOutOfStock = product.stock === 0;
          const isLowStock = product.stock > 0 && product.stock <= 10;
          return (
            <div
              key={product.id}
              className={`bg-white rounded-xl shadow p-4 border-l-4 ${isOutOfStock ? "border-red-400 bg-red-50" : isLowStock ? "border-yellow-400 bg-yellow-50" : "border-orange-400"}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={product.image || null}
                  alt={product.title}
                  className="w-12 h-12 object-contain rounded-lg bg-gray-50"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm leading-tight">
                    {product.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {product.category}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-orange-500 font-bold">
                  ${product.price.toLocaleString()}
                </span>
                <span
                  className={`text-sm font-semibold ${isOutOfStock ? "text-red-600" : isLowStock ? "text-yellow-600" : "text-gray-700"}`}
                >
                  {isOutOfStock
                    ? "🚫 Agotado"
                    : isLowStock
                      ? `⚠️ ${product.stock} uds`
                      : `${product.stock} uds`}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded-lg"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-lg"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StockPage;
