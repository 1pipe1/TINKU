import type { FC } from "react";

export interface CategoryItem {
  name: string;
  icon: string;
  count: number;
}

interface CategoryFilterBarProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CATEGORY_ICONS_MAP: Record<string, string> = {
  Todas: "✨",
  Bebidas: "🥤",
  Lácteos: "🥛",
  Abarrotes: "🍚",
  Snacks: "🍪",
  Licores: "🍺",
  Aseo: "🧼",
  Panadería: "🍞",
  Hogar: "🕯️",
  Miscelánea: "📦",
  "Carnes y embutidos": "🥩",
  "Frutas y verduras": "🍎",
  Droguería: "💊",
  "Venta Express": "⚡",
  General: "🏷️",
};

const CategoryFilterBar: FC<CategoryFilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="mb-4 sm:mb-6">
      {/* Barra de Categorías Horizontal Deslizable */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar select-none scroll-smooth">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => onSelectCategory(cat.name)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-xs active:scale-95 ${
                isSelected
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 border border-orange-500 scale-[1.02]"
                  : "bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/90"
              }`}
            >
              <span className="text-base sm:text-lg">{cat.icon}</span>
              <span>{cat.name}</span>
              {cat.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Indicador sutil de filtro activo */}
      {selectedCategory !== "Todas" && (
        <div className="mt-2 flex items-center justify-between bg-orange-50/80 border border-orange-200/60 px-3.5 py-1.5 rounded-xl text-xs text-orange-950 font-bold">
          <div className="flex items-center gap-2">
            <span>Filtrando por:</span>
            <span className="bg-orange-500 text-white text-[11px] font-black px-2 py-0.5 rounded-lg">
              {selectedCategory}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectCategory("Todas")}
            className="text-orange-600 hover:text-orange-800 text-xs font-black underline cursor-pointer"
          >
            Ver todos los productos
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryFilterBar;
