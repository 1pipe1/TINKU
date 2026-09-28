import { useState } from "react";
import Button from "../atoms/Button";
import Price from "../atoms/Price";
import useCartStore from "../../store/useCartStore";
import type { Product } from "../../types/product";

type ProductCardProps = {
  product: Product;
  onActivate?: (product: Product) => void;
};

const ProductCard = ({ product, onActivate }: ProductCardProps) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const [quantity, setQuantity] = useState(1);

  // Rescate seguro de valores
  const displayTitle =
    product.title ||
    (product as any).nombre ||
    "Producto sin nombre";
  const displayCategory =
    product.category || (product as any).categoria || "General";
  const displayPrice = product.price ?? (product as any).precio ?? 0;
  const displayStock = product.stock ?? 0;
  const isPending = product.pendingActivation;
  const displayIcon = (product as any).icono || "📦";

  const outOfStock = !isPending && displayStock === 0;

  return (
    <div
      onClick={() => {
        if (isPending && onActivate) {
          onActivate(product);
        }
      }}
      className={`bg-white p-4 md:p-6 rounded-2xl shadow-sm hover:shadow-md border transition-all h-full flex flex-col justify-between text-center relative ${
        isPending
          ? "border-orange-200/80 hover:border-orange-400 cursor-pointer bg-linear-to-b from-orange-50/20 to-white"
          : "border-gray-100"
      }`}
    >
      {/* Badge de Sugerido / Sin activar */}
      {isPending && (
        <div className="absolute top-2.5 right-2.5 bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
          <span>⚡</span>
          <span>Sugerido</span>
        </div>
      )}

      <div>
        {/* Renderizado condicional de imagen o emoji/placeholder */}
        <div
          className={`h-28 sm:h-32 flex items-center justify-center mb-3 rounded-xl transition-all ${
            isPending ? "bg-orange-50/60" : "bg-gray-50"
          }`}
        >
          {product.image && product.image.trim() !== "" ? (
            <img
              src={product.image}
              alt={product.title || product.name || "Producto"}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className={isPending ? "text-5xl animate-bounce-short" : "text-4xl"}>
              {displayIcon}
            </span>
          )}
        </div>

        <h2 className="text-base sm:text-lg font-bold mb-1 text-[#0F172A] line-clamp-2 leading-snug">
          {displayTitle}
        </h2>

        <p className="text-xs font-semibold text-orange-600 bg-orange-50 inline-block px-2 py-0.5 rounded-md mb-2">
          {displayCategory}
        </p>

        <div className="mb-2">
          {isPending ? (
            <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-block">
              Sin precio definido
            </span>
          ) : (
            <Price amount={displayPrice} />
          )}
        </div>

        {!isPending && (
          outOfStock ? (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full inline-block mb-2">
              🚫 Agotado
            </span>
          ) : displayStock <= 10 ? (
            <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full inline-block mb-2">
              ⚠️ Últimas {displayStock} uds
            </span>
          ) : null
        )}
      </div>

      <div className="pt-2">
        {isPending ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onActivate?.(product);
            }}
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black py-2.5 px-3 rounded-xl text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>⚡ Poner precio</span>
          </button>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(Math.max(1, quantity - 1));
                }}
                disabled={outOfStock}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full disabled:opacity-40 font-bold text-base flex items-center justify-center cursor-pointer"
              >
                -
              </button>

              <span className="text-base font-bold w-6 text-center">{quantity}</span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(Math.min(displayStock, quantity + 1));
                }}
                disabled={outOfStock}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full disabled:opacity-40 font-bold text-base flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>

            <Button
              text={outOfStock ? "Sin stock" : "Registrar"}
              onClick={() => !outOfStock && addToCart({ ...product, quantity })}
            />
          </>
        )}
      </div>
    </div>
  );
};


export default ProductCard;
