import { useState, useEffect } from "react";

interface ExpressPriceModalProps {
  isOpen: boolean;
  productName: string;
  onClose: () => void;
  onConfirm: (price: number) => void;
}

export default function ExpressPriceModal({
  isOpen,
  productName,
  onClose,
  onConfirm,
}: ExpressPriceModalProps) {
  const [priceStr, setPriceStr] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setPriceStr("");
      // 🔥 Forzar que el teclado nativo de Android/iOS se oculte de inmediato
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [isOpen]);

  // Manejador de teclado físico y lectores de código sin levantar el teclado virtual del celular
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        setPriceStr((prev) => {
          if (prev === "" && e.key === "0") return prev;
          return prev.length < 8 ? prev + e.key : prev;
        });
      } else if (e.key === "Backspace") {
        setPriceStr((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, priceStr]);


  if (!isOpen) return null;

  const currentPrice = parseInt(priceStr, 10) || 0;

  const handleKeyClick = (key: string) => {
    if (key === "backspace") {
      setPriceStr((prev) => prev.slice(0, -1));
    } else if (key === "clear") {
      setPriceStr("");
    } else if (key === "00") {
      if (priceStr.length > 0 && priceStr.length <= 6) {
        setPriceStr((prev) => prev + "00");
      }
    } else {
      if (priceStr.length < 8) {
        if (priceStr === "" && key === "0") return;
        setPriceStr((prev) => prev + key);
      }
    }
  };

  const handleQuickPrice = (value: number) => {
    setPriceStr(value.toString());
  };

  const handleSubmit = () => {
    if (currentPrice <= 0) return;
    onConfirm(currentPrice);
  };

  return (
    <div
      className="fixed inset-0 z-150 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera idéntica al modal de activación (Dark Navy) */}
        <div className="bg-slate-900 text-white p-4.5 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl sm:text-4xl bg-white/10 p-2 rounded-2xl shrink-0 flex items-center justify-center">
              ⚡
            </span>
            <div className="min-w-0">
              <span className="inline-block text-[11px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md mb-1">
                Venta Express
              </span>
              <h2 className="text-base sm:text-lg font-black text-white truncate leading-tight">
                {productName || "Producto Express"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-lg cursor-pointer transition-all shrink-0 ml-2"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo / Pantalla de Precio con Teclado Numérico Táctil */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="text-center mb-3">
              <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
                ¿A cómo lo vendes en tu tienda?
              </p>

              {/* Display Gigante del Precio */}
              <div className="mt-2 py-3 px-4 bg-orange-50/70 border-2 border-orange-200 rounded-2xl flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-black text-orange-500 mr-1.5 select-none">
                  $
                </span>
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {currentPrice > 0
                    ? currentPrice.toLocaleString("es-CO")
                    : "0"}
                </span>
              </div>
            </div>

            {/* Accesos Rápidos de Precios Típicos */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {[1000, 2000, 3000, 5000].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => handleQuickPrice(quick)}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-700 rounded-xl text-xs font-black transition-all cursor-pointer select-none active:scale-95"
                >
                  ${quick.toLocaleString("es-CO")}
                </button>
              ))}
            </div>

            {/* Teclado Numérico Gigante y Táctil (Sin teclado virtual del celular) */}
            <div className="grid grid-cols-3 gap-2 select-none mb-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0"].map(
                (digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeyClick(digit)}
                    className="h-12 sm:h-13 bg-slate-100 hover:bg-slate-200 active:bg-orange-500 active:text-white rounded-xl text-xl sm:text-2xl font-black text-slate-800 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                  >
                    {digit}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => handleKeyClick("backspace")}
                className="h-12 sm:h-13 bg-red-50 hover:bg-red-100 text-red-600 active:bg-red-500 active:text-white rounded-xl text-lg font-black transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
                title="Borrar dígito"
              >
                ⌫
              </button>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={currentPrice <= 0}
              className="flex-2 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-sm sm:text-base shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <span>⚡ Agregar al carrito</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
