import { useState } from "react";
import Button from "../atoms/Button";
import Price from "../atoms/Price";
import useCartStore from "../../store/useCartStore";
import type { Product } from "../../types/product";

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
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
  const imageUrl =
    product.image && product.image.trim() !== "" ? product.image : null;

  const outOfStock = displayStock === 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full flex flex-col justify-between text-center">
      <div>
        {/* Renderizado condicional de imagen o placeholder */}
        <div className="h-32 flex items-center justify-center mb-4 bg-gray-50 rounded-lg">
          {product.image && product.image.trim() !== "" ? (
            <img
              src={product.image}
              alt={product.title || product.name || "Producto"}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-4xl">📦</span>
          )}
        </div>

        <h2 className="text-lg font-bold mb-1 text-[#0F172A] line-clamp-2">
          {displayTitle}
        </h2>

        <p className="text-xs font-semibold text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded mb-3">
          {displayCategory}
        </p>

        <div className="mb-3">
          <Price amount={displayPrice} />
        </div>

        {outOfStock ? (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full inline-block mb-3">
            🚫 Agotado
          </span>
        ) : displayStock <= 10 ? (
          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full inline-block mb-3">
            ⚠️ Últimas {displayStock} unidades
          </span>
        ) : null}
      </div>

      <div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={outOfStock}
            className="px-3 py-1 bg-gray-200 rounded-full disabled:opacity-40 font-bold"
          >
            -
          </button>

          <span className="text-lg font-semibold">{quantity}</span>

          <button
            onClick={() => setQuantity(Math.min(displayStock, quantity + 1))}
            disabled={outOfStock}
            className="px-3 py-1 bg-gray-200 rounded-full disabled:opacity-40 font-bold"
          >
            +
          </button>
        </div>

        <Button
          text={outOfStock ? "Sin stock" : "Registrar"}
          onClick={() => !outOfStock && addToCart({ ...product, quantity })}
        />
      </div>
    </div>
  );
};

export default ProductCard;
