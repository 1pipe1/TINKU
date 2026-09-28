import { useState, useEffect, useRef, useMemo } from "react";
import ProductCard from "../components/molecules/ProductCard";
import Navbar from "../components/organisms/Navbar";
import QuickCheckoutDrawer from "../components/organisms/QuickCheckoutDrawer";
import { CartDrawer } from "../components/organisms/CartDrawer";
import LogoutConfirmModal from "../components/molecules/LogoutConfirmModal";
import ActivateMaestroModal from "../components/molecules/ActivateMaestroModal";
import ExpressPriceModal from "../components/molecules/ExpressPriceModal";
import CategoryFilterBar, {
  type CategoryItem,
  CATEGORY_ICONS_MAP,
} from "../components/molecules/CategoryFilterBar";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import useStockStore from "../store/useStockStore";
import useCartStore from "../store/useCartStore";
import { useDraftStore } from "../store/useDraftStore";
import { CATALOGO_MAESTRO, type MaestroProduct } from "../data/catalogoMaestro";
import type { Product } from "../types/product";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import useKeyboardStatus from "../hooks/useKeyboardStatus";
import type { FC } from "react";

const HomePage: FC = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [loading, setLoading] = useState(true);
  const [isQuickDrawerOpen, setIsQuickDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); // 🔥 Control de apertura del Carrito Deslizable!
  const [isExpressPriceOpen, setIsExpressPriceOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedMaestro, setSelectedMaestro] = useState<MaestroProduct | null>(null);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);

  const draftCount = useDraftStore((state) => state.draftCount);
  const [expressProductName, setExpressProductName] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);



  const isKeyboardOpen = useKeyboardStatus();
  // Se considera activo cuando el teclado virtual está desplegado o cuando el tendero está enfocado escribiendo en el buscador
  const isKeyboardActive = isKeyboardOpen || (isSearchFocused && search.trim().length > 0);

  const handleSearchFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    // Pequeño retardo para evitar que el blur provoque un salto de layout instantáneo que cancele el touch/click
    blurTimeoutRef.current = setTimeout(() => {
      setIsSearchFocused(false);
    }, 250);
  };

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
    // 🔥 Esconder el teclado nativo de Android/iOS inmediatamente al abrir el modal
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setExpressProductName(search.trim());
    setIsExpressPriceOpen(true);
  };


  const handleConfirmExpressPrice = (price: number) => {
    handleAddProduct(expressProductName, price);
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

  // 🏷️ Lista Dinámica de Categorías de la Tienda
  const categoriesList = useMemo<CategoryItem[]>(() => {
    const standardCategories = [
      "Bebidas",
      "Lácteos",
      "Abarrotes",
      "Snacks",
      "Licores",
      "Aseo",
      "Panadería",
      "Hogar",
    ];

    // Conteo de productos por categoría en el inventario activo del tendero
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || (p as any).categoria || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    // Combinar categorías existentes con las estándar
    const allCatNames = Array.from(
      new Set([...Object.keys(counts), ...standardCategories])
    ).filter((c) => c !== "Venta Express" && c.trim() !== "");

    // Priorizar categorías que tienen productos en stock
    allCatNames.sort((a, b) => {
      const countA = counts[a] || 0;
      const countB = counts[b] || 0;
      if (countA > 0 && countB === 0) return -1;
      if (countB > 0 && countA === 0) return 1;
      return a.localeCompare(b);
    });

    const items: CategoryItem[] = [
      {
        name: "Todas",
        icon: CATEGORY_ICONS_MAP["Todas"] || "✨",
        count: products.length,
      },
      ...allCatNames.map((catName) => ({
        name: catName,
        icon: CATEGORY_ICONS_MAP[catName] || "🏷️",
        count: counts[catName] || 0,
      })),
    ];

    return items;
  }, [products]);

  const cleanText = (str: string) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // Nombres activos en el inventario personal del tendero para evitar sugerencias duplicadas
  const activeProductNames = new Set(
    products.map((p) => cleanText(p.title || (p as any).nombre || p.name || ""))
  );

  const cleanQuery = cleanText(search);

  // 🌟 Lógica de Búsqueda y Filtro de Categoría Integrada:
  // 1. Respeta la categoría seleccionada (si es diferente de "Todas")
  // 2. Prioriza los productos que el tendero YA TIENE en su inventario.
  // 3. Muestra coincidencias del Catálogo Maestro como "Sugerido" (sin activar).
  let displayProducts: Product[] = [];

  if (cleanQuery) {
    const matchedActive = products.filter((p) => {
      const title = cleanText(p?.title || (p as any)?.nombre || p?.name || "");
      const cat = cleanText(p?.category || (p as any)?.categoria || "");
      const matchesSearch = title.includes(cleanQuery) || cat.includes(cleanQuery);
      const matchesCategory =
        selectedCategory === "Todas" ||
        (p?.category || (p as any)?.categoria) === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const matchedMaestro = CATALOGO_MAESTRO
      .filter((m) => {
        const title = cleanText(m.nombre);
        const cat = cleanText(m.categoria);
        const matchesSearch = title.includes(cleanQuery) || cat.includes(cleanQuery);
        const matchesCategory =
          selectedCategory === "Todas" || m.categoria === selectedCategory;
        return (
          !activeProductNames.has(title) &&
          matchesSearch &&
          matchesCategory
        );
      })
      .slice(0, 20)
      .map(
        (m) =>
          ({
            id: m.id,
            title: m.nombre,
            name: m.nombre,
            category: m.categoria,
            price: 0,
            cost: 0,
            stock: 0,
            icono: m.icono,
            pendingActivation: true,
          } as Product)
      );

    displayProducts = [...matchedActive, ...matchedMaestro];
  } else {
    // Si no está buscando por texto:
    if (selectedCategory !== "Todas") {
      // Filtrado exclusivo por la categoría seleccionada en el módulo:
      const activeInCategory = products.filter(
        (p) => (p.category || (p as any).categoria) === selectedCategory
      );

      const maestroInCategory = CATALOGO_MAESTRO
        .filter(
          (m) =>
            m.categoria === selectedCategory &&
            !activeProductNames.has(cleanText(m.nombre))
        )
        .slice(0, 16)
        .map(
          (m) =>
            ({
              id: m.id,
              title: m.nombre,
              name: m.nombre,
              category: m.categoria,
              price: 0,
              cost: 0,
              stock: 0,
              icono: m.icono,
              pendingActivation: true,
            } as Product)
        );

      displayProducts = [...activeInCategory, ...maestroInCategory];
    } else {
      // "Todas" sin búsqueda:
      if (products.length > 0) {
        displayProducts = products;
      } else {
        // Usuario nuevo (inventario personal en 0):
        // La bóveda permanece en segundo plano hasta que el tendero busque un producto
        displayProducts = [];
      }
    }
  }


  const handleOpenActivateModal = (prod: Product) => {
    const maestroItem = CATALOGO_MAESTRO.find((m) => m.id === prod.id) || {
      id: prod.id,
      nombre: (prod as any).nombre || prod.title,
      categoria: (prod as any).categoria || prod.category,
      icono: (prod as any).icono || "📦",
      precio: 0,
    };
    setSelectedMaestro(maestroItem);
    setIsActivateModalOpen(true);
  };


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
    <div
      className={`min-h-screen bg-[#F0F4F8] text-gray-900 transition-all ${
        isKeyboardActive ? "pb-4 md:pb-8" : "pb-24 md:pb-8"
      }`}
    >
      {/* Navbar Superior Fijo */}
      <Navbar
        search={search}
        onSearchChange={(val) => setSearch(val)}
        onCheckout={() => setIsCartOpen(true)}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
      />

      <div
        className={`max-w-7xl mx-auto transition-all ${
          isKeyboardActive ? "p-2 sm:p-4 md:p-8" : "p-4 md:p-8"
        }`}
      >
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
        {/* Se oculta al buscar o cuando el teclado está activo para no empujar la tarjeta hacia abajo */}
        {!search.trim() && !isKeyboardActive && (
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
        )}

        {/* 🏷️ MÓDULO EXCLUSIVO DE CATEGORÍAS (4ta forma de búsqueda rápida en 1 toque) */}
        {!isKeyboardActive && (
          <CategoryFilterBar
            categories={categoriesList}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />
        )}

        {/* Parrilla de Productos del Catálogo */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onActivate={handleOpenActivateModal}
              />
            ))}
          </div>
        ) : products.length === 0 && !search.trim() && selectedCategory === "Todas" ? (
          /* 🌟 Guía Amigable de Bienvenida cuando el inventario está en 0 */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm text-center max-w-xl mx-auto my-3 sm:my-6 animate-fade-in">
            {/* Ícono llamativo y cálido */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-linear-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center text-4xl sm:text-5xl shadow-lg shadow-orange-500/20 mb-5">
              🏪
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
              ¡Bienvenida a tu mostrador TINKU!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed max-w-md mx-auto">
              Tu tienda inicia limpia con <span className="font-black text-orange-600">0 productos</span>. Dispones de un <span className="font-bold text-slate-800">Catálogo Maestro en la bóveda</span> con más de 500 productos listos para activarse a tu gusto.
            </p>

            {/* Tarjeta de Guía paso a paso */}
            <div className="bg-orange-50/70 border-2 border-dashed border-orange-200 rounded-2xl p-4 sm:p-5 text-left mb-6">
              <div className="flex items-center gap-2 text-orange-900 font-black text-sm mb-1.5">
                <span className="text-xl">🔍</span>
                <span>¿Cómo empezar a vender?</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-normal mb-3.5">
                Toca la barra superior <strong className="text-slate-800">"Buscar producto..."</strong> y escribe lo que te pidan en el mostrador. Le pones tu precio de venta una sola vez y listo.
              </p>

              {/* Chips interactivos de prueba para desbloquear la bóveda */}
              <div className="pt-3 border-t border-orange-200/60">
                <p className="text-[11px] font-black text-orange-700 uppercase tracking-wider mb-2">
                  O prueba tocando uno de estos ejemplos:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Coca-Cola", icon: "🥤" },
                    { name: "Leche Alquería", icon: "🥛" },
                    { name: "Huevos", icon: "🥚" },
                    { name: "Arroz Diana", icon: "🍚" },
                    { name: "Jabón Rey", icon: "🧼" },
                    { name: "Pan Bimbo", icon: "🍞" },
                  ].map((pill) => (
                    <button
                      key={pill.name}
                      type="button"
                      onClick={() => setSearch(pill.name)}
                      className="bg-white hover:bg-orange-100 hover:text-orange-800 text-slate-700 border border-orange-200/80 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <span>{pill.icon}</span>
                      <span>{pill.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Acceso para Cobro Express */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 text-left">
              <div className="flex items-center gap-3">
                <span className="text-2xl bg-orange-100 text-orange-600 p-2 rounded-xl">⚡</span>
                <div>
                  <p className="text-xs sm:text-sm font-black text-slate-800">
                    ¿Producto suelto o no catalogado?
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Úsalo para recargas, minutos o ventas rápidas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickDrawerOpen(true)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer text-center shrink-0 active:scale-95"
              >
                Abrir Cobro Express
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`text-center bg-white rounded-2xl border border-slate-200 transition-all duration-200 ${
              isKeyboardActive
                ? "py-3 px-4 my-1 sm:my-2 shadow-xs"
                : "py-10 md:py-14 px-6 my-4 shadow-sm"
            }`}
          >


            <div
              className={`mx-auto rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black transition-all ${
                isKeyboardActive
                  ? "w-10 h-10 text-xl mb-1.5"
                  : "w-16 h-16 text-3xl mb-3"
              }`}
            >
              ⚡
            </div>
            <p className="text-slate-800 text-base sm:text-lg md:text-xl font-extrabold tracking-tight leading-snug">
              {search
                ? `No se encontraron productos para "${search}"`
                : "No hay productos disponibles en tu tienda todavía."}
            </p>
            <p
              className={`text-slate-600 font-medium ${
                isKeyboardActive
                  ? "text-xs sm:text-sm mt-0.5 mb-2.5"
                  : "text-sm sm:text-base mt-1.5 mb-5 text-slate-500"
              }`}
            >
              {search
                ? "Agrégalo como Venta Express para cobrarlo sin trancar la fila."
                : "Ve al gestor de Stock para agregar productos."}
            </p>

            {search && (
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center items-center max-w-sm mx-auto">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    openExpressPriceDialog();
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    openExpressPriceDialog();
                  }}
                  onClick={openExpressPriceDialog}
                  className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-sm sm:text-base py-3 px-5 rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all min-h-12 select-none"
                >
                  <span className="text-base sm:text-lg">⚡</span>
                  <span>Cobrar "{search}" Rápido</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearch("");
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    setSearch("");
                  }}
                  onClick={() => setSearch("")}
                  className="w-full sm:w-auto text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer min-h-10 shrink-0 select-none"
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

      {/* ⚡ Modal de Cobro Express con Teclado Táctil Gigante (Sin teclado nativo del móvil) */}
      <ExpressPriceModal
        isOpen={isExpressPriceOpen}
        productName={expressProductName}
        onClose={() => setIsExpressPriceOpen(false)}
        onConfirm={handleConfirmExpressPrice}
      />


      {/* Acceso de rescate: permanece disponible al bajar por el catálogo (se oculta con teclado activo) */}
      {!isKeyboardActive && !isQuickDrawerOpen && !isCartOpen && (
        <button
          onClick={() => setIsQuickDrawerOpen(true)}
          aria-label="Abrir calculadora de cobro express"
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-orange-500 text-white shadow-xl border border-orange-400 flex items-center justify-center active:scale-95 transition-all md:hidden"
        >
          <span className="text-2xl">⚡</span>
        </button>
      )}

      {/* 🔥 BARRA FLOTANTE DE RÁFAGA ACUMULADORA (Sutil, elegante y ergonómica) 🔥 */}
      {!isKeyboardActive && cart.length > 0 && !isCartOpen && !isQuickDrawerOpen && (
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

      {/* 📱 BARRA DE NAVEGACIÓN MÓVIL PERSISTENTE (Oculta al escribir o con teclado virtual abierto para evitar carga visual) */}
      {!isKeyboardActive && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl px-3 py-2 flex justify-around items-center z-50 md:hidden animate-fade-in">
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
      )}

      <ActivateMaestroModal
        isOpen={isActivateModalOpen}
        product={selectedMaestro}
        onClose={() => {
          setIsActivateModalOpen(false);
          setSelectedMaestro(null);
        }}
        onActivated={() => {
          setSearch("");
        }}
      />

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
