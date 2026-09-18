import { useEffect, useState } from "react";
import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "sonner";
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

interface PendingExpressItem {
  id: string;
  title: string;
  price: number;
}

const STORE_CATEGORIES = [
  "Bebidas",
  "Abarrotes",
  "Miscelánea",
  "Snacks",
  "Lácteos",
  "Carnes y embutidos",
  "Frutas y verduras",
  "Aseo y hogar",
  "Papelería",
  "Droguería",
  "Venta Express",
  "General",
];

const StockPage = () => {
  const products = useStockStore((state) => state.products);
  const fetchProducts = useStockStore((state) => state.fetchProducts);
  const addProductLocally = useStockStore((state) => state.addProductLocally);
  const updateProductLocally = useStockStore((state) => state.updateProductLocally);
  const deleteProductLocally = useStockStore((state) => state.deleteProductLocally);
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<StockForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

  const [pendingExpressItems, setPendingExpressItems] = useState<
    PendingExpressItem[]
  >([]);
  const [showPendingExpressItems, setShowPendingExpressItems] = useState(false);

  const uid = user?.uid || user?.id;

  // 1. Cargar inventario privado del usuario activo
  useEffect(() => {
    if (uid) {
      setLoading(true);
      fetchProducts(uid).then(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProducts, uid]);

  // 2. Buscar ventas express privadas en el historial de ESTE usuario
  useEffect(() => {
    if (!uid) {
      setPendingExpressItems([]);
      return;
    }

    const loadPendingExpress = async () => {
      try {
        const ordersRef = collection(db, "usuarios", uid, "orders");
        const q = query(ordersRef, orderBy("createdAt", "desc"), limit(30));
        const snap = await getDocs(q);

        const expressMap = new Map<string, number>();

        snap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const items = data.items || [];
          items.forEach((it: any) => {
            const isExpress =
              it.isExpress || String(it.id || "").startsWith("express-");
            const itemTitle = (it.title || it.name || "").trim();

            if (isExpress && itemTitle) {
              const existsInStock = products.some(
                (p) =>
                  (p.title || p.name || "").toLowerCase().trim() ===
                  itemTitle.toLowerCase(),
              );

              if (!existsInStock && !expressMap.has(itemTitle.toLowerCase())) {
                expressMap.set(itemTitle.toLowerCase(), it.price || 0);
              }
            }
          });
        });

        const pendingList: PendingExpressItem[] = Array.from(
          expressMap.entries(),
        ).map(([key, price], idx) => ({
          id: `pending-${idx}`,
          title: key.charAt(0).toUpperCase() + key.slice(1),
          price: price,
        }));

        setPendingExpressItems(pendingList);
      } catch (err) {
        console.error("Error buscando ventas express privadas:", err);
      }
    };

    loadPendingExpress();
  }, [uid]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      title: product.title ?? product.name ?? "",
      category: product.category ?? "",
      price: String(product.price ?? 0),
      cost: product.costPending ? "" : String(product.cost ?? 0),
      stock: product.stockPending ? "" : String(product.stock ?? 0),
      image: product.image ?? "",
    });
    setShowForm(true);
  };

  const handleConvertExpress = (item: PendingExpressItem) => {
    setEditingProduct(null);
    setForm({
      title: item.title,
      category: "Venta Express",
      price: String(item.price || 0),
      cost: "",
      stock: "10",
      image: "",
    });
    setShowForm(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);

    try {
      if (uid) {
        await deleteDoc(doc(db, "usuarios", uid, "productos", productToDelete.id));
      }
      deleteProductLocally(productToDelete.id);
      if (uid) {
        await fetchProducts(uid, true);
      }
      toast.success("¡Producto eliminado exitosamente!");
      setProductToDelete(null);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast.error("No se pudo eliminar el producto.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uid || saving) return;

    setSaving(true);
    const data = {
      nombre: form.title.trim(),
      title: form.title.trim(),
      categoria: form.category.trim() || "General",
      precio: parseFloat(form.price) || 0,
      costo: parseFloat(form.cost) || 0,
      stock: parseInt(form.stock, 10) || 0,
      costPending: form.cost.trim() === "",
      stockPending: form.stock.trim() === "",
      image: form.image.trim(),
    };

    try {
      if (editingProduct) {
        await updateDoc(
          doc(db, "usuarios", uid, "productos", editingProduct.id),
          data,
        );
        updateProductLocally({
          ...editingProduct,
          title: data.title,
          name: data.title,
          price: data.precio,
          cost: data.costo,
          stock: data.stock,
          category: data.categoria,
          image: data.image,
          costPending: data.costPending,
          stockPending: data.stockPending,
        });
        toast.success("¡Producto actualizado exitosamente!");
      } else {
        const docRef = await addDoc(collection(db, "usuarios", uid, "productos"), data);
        addProductLocally({
          id: docRef.id,
          sku: docRef.id,
          title: data.title,
          name: data.title,
          price: data.precio,
          cost: data.costo,
          stock: data.stock,
          category: data.categoria,
          image: data.image,
          costPending: data.costPending,
          stockPending: data.stockPending,
        });
        toast.success("¡Producto guardado exitosamente!");
      }

      // Advertencias si hay datos pendientes
      if (data.costPending || data.stockPending) {
        toast.warning("Stock o costo pendiente");
      }

      setPendingExpressItems((prev) =>
        prev.filter(
          (item) =>
            item.title.toLowerCase().trim() !== form.title.toLowerCase().trim(),
        ),
      );

      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyForm);
      await fetchProducts(uid, true);
    } catch (error) {
      console.error("Error al guardar producto:", error);
      toast.error("Hubo un error al guardar los datos.");
    } finally {
      setSaving(false);
    }
  };

  const incompleteProducts = products.filter(
    (p) => p.costPending || p.stockPending,
  );
  const availableCategories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "es"));

  const filteredProducts = products.filter((p) => {
    const name = p.title || p.name || "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !selectedCategory || p.category === selectedCategory;
    const matchesIncomplete = !showIncompleteOnly || incompleteProducts.includes(p);

    return matchesSearch && matchesCategory && matchesIncomplete;
  });

  if (loading)
    return (
      <p className="p-8 text-gray-500 text-center text-lg font-bold">
        Cargando tu inventario privado...
      </p>
    );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto bg-[#F0F4F8] min-h-screen pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-5 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800 flex items-center gap-2">
            📦 Mi inventario
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Revisa y organiza los productos de tu tienda
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="w-full sm:w-auto min-h-12 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black px-6 py-3 rounded-xl text-base transition-all shadow-md cursor-pointer"
        >
          + Agregar producto
        </button>
      </div>

      {/* 🎈 Productos cobrados rápidamente y aún no registrados */}
      {pendingExpressItems.length > 0 && (
        <div className="mb-6 bg-linear-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-sm animate-fadeIn">
          <button
            type="button"
            onClick={() =>
              setShowPendingExpressItems((isOpen) => !isOpen)
            }
            aria-expanded={showPendingExpressItems}
            className="w-full flex items-center justify-between gap-3 p-5 md:p-6 text-left cursor-pointer"
          >
            <span className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0" aria-hidden="true">
                ⚡
              </span>
              <span className="min-w-0">
                <span className="block font-black text-amber-950 text-lg leading-tight">
                  Productos cobrados sin registrar ({pendingExpressItems.length})
                </span>
                <span className="block text-sm leading-relaxed text-amber-800 mt-1">
                  Revisa los productos que aún no están en tu inventario.
                </span>
              </span>
            </span>
            <span
              className={`text-2xl text-amber-800 shrink-0 transition-transform ${
                showPendingExpressItems ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            >
              ↓
            </span>
          </button>

          {showPendingExpressItems && (
            <div className="space-y-3 px-5 pb-5 md:px-6 md:pb-6">
              {pendingExpressItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-4 min-h-16 bg-white/90 backdrop-blur-sm rounded-xl border border-amber-200/60 shadow-xs"
                >
                  <div className="min-w-0">
                    <p className="font-black text-gray-800 text-base break-words">
                      {item.title}
                    </p>
                    <p className="text-sm text-orange-700 font-bold mt-0.5">
                      Vendido a ${item.price.toLocaleString("es-CO")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleConvertExpress(item)}
                    className="min-h-11 shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm px-4 rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    + Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Búsqueda y filtros rápidos */}
      <div className="mb-4 space-y-3">
        <input
          type="text"
          placeholder="🔎 Buscar un producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar un producto en el inventario"
          className="w-full min-h-14 px-5 py-4 bg-white rounded-xl border border-gray-200 text-base font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 shadow-xs"
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex-1">
            <span className="sr-only">Filtrar por categoría</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filtrar productos por categoría"
              className="w-full min-h-12 px-4 py-3 bg-white rounded-xl border border-gray-200 text-base font-semibold text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 shadow-xs cursor-pointer"
            >
              <option value="">📂 Todas las categorías</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          {incompleteProducts.length > 0 && (
            <button
              type="button"
              onClick={() => setShowIncompleteOnly((isActive) => !isActive)}
              aria-pressed={showIncompleteOnly}
              className={`min-h-12 px-4 py-3 rounded-xl border text-sm font-bold transition-colors cursor-pointer ${
                showIncompleteOnly
                  ? "bg-amber-100 border-amber-300 text-amber-900"
                  : "bg-white border-gray-200 text-amber-800 hover:bg-amber-50"
              }`}
            >
              💡 Datos por completar ({incompleteProducts.length})
            </button>
          )}
        </div>
      </div>

      {/* Formulario Modal / Card */}
      {showForm && (
        <div className="fixed inset-0 z-110 flex items-start justify-center overflow-y-auto bg-black/50 p-4 md:items-center">
          <div className="my-4 w-full max-w-2xl p-5 md:p-7 bg-white rounded-2xl shadow-2xl border border-orange-100 animate-fadeIn">
            <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-1">
              {editingProduct ? "✏️ Editar producto" : "➕ Agregar producto"}
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              Completa los datos principales de este producto.
            </p>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full min-h-12 px-4 py-3 rounded-xl border border-gray-300 text-base font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  placeholder="Ej. Coca Cola 1.5L"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Categoría
                </label>
                <select
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full min-h-12 px-4 py-3 rounded-xl border border-gray-300 bg-white text-base font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                >
                  <option value="" disabled>
                    Selecciona una categoría
                  </option>
                  {STORE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Precio de venta ($)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full min-h-12 px-4 py-3 rounded-xl border border-gray-300 text-base font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Costo de compra ($){" "}
                  <span className="font-normal text-gray-500">(opcional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  className="w-full min-h-12 px-4 py-3 rounded-xl border border-gray-300 text-base font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  placeholder="Escríbelo si lo sabes"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Te ayuda a conocer tu ganancia.
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  ¿Cuántas unidades tienes?{" "}
                  <span className="font-normal text-gray-500">(opcional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full min-h-12 px-4 py-3 rounded-xl border border-gray-300 text-base font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  placeholder="Puedes completarlo después"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Si lo dejas vacío, quedará marcado como pendiente de
                  confirmar.
                </p>
              </div>
              {(!form.cost.trim() || !form.stock.trim()) && (
                <div className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
                  <strong>Dato pendiente:</strong> puedes guardar ahora y
                  completarlo después desde Editar producto.
                </div>
              )}
              <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-3 mt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowForm(false)}
                  className="min-h-12 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-base transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-12 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-black rounded-xl text-base transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar producto</span>
                  )}
                </button>
              </div>
            </form>
          </div>
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
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 md:p-5 min-h-20 bg-white rounded-2xl shadow-xs border border-gray-100"
              >
                <div className="min-w-0 flex-1 w-full sm:w-auto sm:pr-3">
                  <div>
                    <p className="font-bold text-gray-800 text-base break-words">
                      {p.title || p.name || "Producto sin nombre"}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Categoría:{" "}
                    <span className="font-semibold text-gray-700">
                      {p.category || "General"}
                    </span>{" "}
                    | Stock:{" "}
                    <span className="font-bold text-gray-800">
                      {p.stockPending ? "Por confirmar" : `${p.stock} un.`}
                    </span>
                  </p>
                  {p.costPending && (
                    <p className="text-xs font-semibold text-amber-700 mt-1">
                      Costo de compra pendiente
                    </p>
                  )}
                </div>

                <div className="shrink-0 self-end sm:self-start">
                  {p.stockPending ? (
                    <span className="text-xs font-black bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                      📝 Stock pendiente
                    </span>
                  ) : isOutOfStock ? (
                    <span className="text-xs font-black bg-red-100 text-red-700 px-2 py-1 rounded-md">
                      🚫 Agotado
                    </span>
                  ) : isLowStock ? (
                    <span className="text-xs font-black bg-amber-100 text-amber-700 px-2 py-1 rounded-md">
                      ⚠️ Bajo ({p.stock})
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-black text-orange-600 text-base">
                    ${(p.price ?? 0).toLocaleString("es-CO")}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(p)}
                      aria-label={`Editar ${p.title || p.name || "producto"}`}
                      className="min-h-11 min-w-11 text-blue-600 hover:bg-blue-50 font-black text-base px-2.5 rounded-lg transition-all cursor-pointer"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() =>
                        setProductToDelete({
                          id: p.id,
                          name: p.title || p.name || "este producto",
                        })
                      }
                      aria-label={`Eliminar ${p.title || p.name || "producto"}`}
                      className="min-h-11 min-w-11 text-red-500 hover:bg-red-50 font-black text-base px-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center"
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
            <p className="text-gray-700 font-bold text-sm">
              No se encontraron productos
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              Agrega un producto nuevo para empezar a gestionar tu stock.
            </p>
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar producto (No invasivo, compatible con iframe y móviles) */}
      {productToDelete && (
        <div className="fixed inset-0 z-120 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto mb-4">
              🗑️
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
              ¿Eliminar producto?
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
              ¿Estás seguro de que deseas eliminar{" "}
              <strong className="text-gray-900 font-bold break-words">
                "{productToDelete.name}"
              </strong>{" "}
              de tu catálogo? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setProductToDelete(null)}
                className="flex-1 min-h-11 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="flex-1 min-h-11 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Sí, eliminar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPage;
