import useCartStore from "../../store/useCartStore";

type CartDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
};

const CartDropdown = ({
  isOpen,
  onClose,
  onCheckout,
}: CartDropdownProps) => {
  const cart = useCartStore((state) => state.cart);
  const activeDraftId = useCartStore((state) => state.activeDraftId);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearActiveDraftId = useCartStore((state) => state.clearActiveDraftId);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const hasActiveDraft = Boolean(activeDraftId);

  const handleClearCart = () => {
    clearCart();
    clearActiveDraftId();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            🛒 Mi carrito{" "}
            <span className="text-orange-500">({getTotalItems()})</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {hasActiveDraft && (
            <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-3 text-shadow-lg text-amber-800">
              <div className="font-semibold">VENTA SUSPENDIDA REANUDADA</div>
              <div className="mt-1">
                Si el cliente no compra nada, vaciar el carrito quitará este aviso.
              </div>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-500 text-lg font-medium">
                Tu carrito está vacío
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Agrega productos para continuar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-orange-50 border border-orange-100 p-3 rounded-xl flex items-center gap-3"
                >
                  <img
                    src={item.image || ""}
                    alt={item.title || item.name}
                    className="w-14 h-14 object-contain rounded-lg bg-white border border-gray-100 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
                      {item.title || item.name}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {item.quantity} × ${item.price.toLocaleString()}
                    </p>
                    <p className="text-orange-500 font-bold text-sm mt-0.5">
                      ${(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-300 hover:text-red-400 text-xl shrink-0 transition-colors"
                    aria-label="Eliminar producto"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-200 bg-white px-5 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-700">Total:</span>
              <span className="text-2xl font-bold text-orange-500">
                ${total.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => {
                onCheckout();
                onClose();
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
            >
              Finalizar Venta →
            </button>

            <button
              onClick={handleClearCart}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-medium py-2 rounded-xl transition-colors text-sm"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDropdown;