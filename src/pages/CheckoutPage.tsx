import { useState, useEffect } from "react";
import useCartStore from "../store/useCartStore";
import { useNavigate, useLocation } from "react-router-dom";
import {
  collection,
  serverTimestamp,
  doc,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";
import useAuthStore from "../store/useAuthStore";
import CashPaymentModal from "../components/organisms/CashPaymentModal";
import type { FC } from "react";

const CheckoutPage: FC = () => {
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">(
    "cash",
  );
  const [error, setError] = useState("");
  const [showCashModal, setShowCashModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const resumeId = params.get("resumeId");

  const user = useAuthStore((state) => state.user);
  const cart = useCartStore((state) => state.cart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const setCart = useCartStore((state) => state.setCart);
  const activeDraftId = useCartStore((state) => state.activeDraftId);
  const clearActiveDraftId = useCartStore((state) => state.clearActiveDraftId);
  const totalPrice = getTotalPrice();

  useEffect(() => {
    if (!resumeId) return;
    const loadDraft = async () => {
      try {
        const draftRef = doc(db, "draftOrders", resumeId);
        const snap = await runTransaction(db, async (transaction) => {
          return await transaction.get(draftRef);
        });
        if (snap.exists()) {
          const data = snap.data();
          const items = (data.items || []).map((it: any) => ({
            id: it.id,
            title: it.title || it.name,
            price: it.price || 0,
            image: it.image || "",
            quantity: it.quantity || 1,
          }));
          setCart(items);
        }
      } catch (e) {
        console.error("Error loading draft for resume:", e);
      }
    };
    loadDraft();
  }, [resumeId, setCart]);

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

  const finalizePurchase = async (cashPaidAmount: number | null = null) => {
    if (!user?.uid) {
      setError("Inicia sesión para poder procesar la compra.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      if (
        paymentMethod === "cash" &&
        cashPaidAmount !== null &&
        cashPaidAmount < totalPrice
      ) {
        setError("El monto recibido no alcanza el total");
        setLoading(false);
        return;
      }

      // ==========================================
      // 🧱 ESTRUCTURA MULTI-TENANT ANTISÍSMICA
      // ==========================================
      await runTransaction(db, async (transaction) => {
        const productUpdates: Array<{
          ref: ReturnType<typeof doc>;
          newStock: number;
        }> = [];

        // 1. Fase de Lectura (Obligatoria dentro de la carpeta del usuario activo)
        for (const item of cart) {
          // 🛡️ MULTI-TENANT: Apunta al inventario privado de este usuario
          const productRef = doc(
            db,
            "usuarios",
            user.uid,
            "productos",
            item.id,
          );
          const productSnapshot = await transaction.get(productRef);

          if (!productSnapshot.exists()) {
            throw new Error(
              `El producto "${item.title || item.name}" no existe en tu inventario.`,
            );
          }

          const productData = productSnapshot.data();
          const currentStock = productData.stock ?? 0;

          if (currentStock < item.quantity) {
            throw new Error(
              `¡Sin stock suficiente para ${item.title || item.name}! Te quedan ${currentStock} un.`,
            );
          }

          productUpdates.push({
            ref: productRef,
            newStock: currentStock - item.quantity,
          });
        }

        // 2. Fase de Escritura (Actualizar inventario privado del usuario)
        productUpdates.forEach(({ ref, newStock }) => {
          transaction.update(ref, { stock: newStock });
        });

        // 3. Registrar la orden de venta bajo la sesión del usuario
        const newOrderRef = doc(collection(db, "usuarios", user.uid, "orders"));
        transaction.set(newOrderRef, {
          customerName: "Cliente",
          paymentMethod,
          cashPaid: paymentMethod === "cash" ? cashPaidAmount : null,
          change:
            paymentMethod === "cash" && cashPaidAmount !== null
              ? cashPaidAmount - totalPrice
              : 0,
          items: cart.map((item) => ({
            id: item.id,
            title: item.title || item.name || "Producto sin nombre",
            price: item.price,
            quantity: item.quantity,
            image: item.image || "",
            soldBy: user.email || "guest",
            sellerUid: user.uid, // Guardamos la autoría de la venta
          })),
          total: totalPrice,
          status: "completed",
          createdBy: user.uid, // La orden pertenece a esta tienda
          createdAt: serverTimestamp(),
        });
      });

      // Si venimos reanudando una venta, borrar el borrador
      if (resumeId) {
        try {
          await deleteDoc(doc(db, "draftOrders", resumeId));
        } catch (e) {
          console.error("Error deleting draft after completing order:", e);
        }
      }

      clearActiveDraftId();
      clearCart();
      setPurchaseSuccess(true);
    } catch (error: any) {
      setError(
        error.message ||
          "Error al procesar la transacción. Intenta nuevamente.",
      );
      console.error("Error saving order transaction:", error);
    } finally {
      setLoading(false);
      setShowCashModal(false);
    }
  };

  const handleConfirmPurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (paymentMethod === "cash") {
      setShowCashModal(true);
      return;
    }

    await finalizePurchase();
  };

  const handleSuspendSale = async () => {
    setError("");

    if (cart.length === 0) {
      setError("No hay productos en el carrito");
      return;
    }

    if (!user?.uid) {
      setError("Inicia sesión para suspender ventas.");
      return;
    }

    setLoading(true);
    try {
      const newDraftRef = doc(collection(db, "draftOrders"));
      await runTransaction(db, async (transaction) => {
        transaction.set(newDraftRef, {
          customerName: "",
          paymentMethod,
          items: cart.map((item) => ({
            id: item.id,
            title: item.title || item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || "",
          })),
          total: totalPrice,
          status: "suspended",
          createdBy: user.email || "guest",
          createdByUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      if (activeDraftId) {
        try {
          await deleteDoc(doc(db, "draftOrders", activeDraftId));
        } catch (error) {
          console.error("Error deleting previous draft:", error);
        }
      }

      clearActiveDraftId();
      clearCart();
      navigate("/admin/drafts");
    } catch (error) {
      setError("No se pudo suspender la venta.");
      console.error("Error suspending sale:", error);
    } finally {
      setLoading(false);
    }
  };

  if (purchaseSuccess) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-3">
            ¡Pedido recibido!
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            Tu compra fue procesada con éxito.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="text-7xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-3">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-500 mb-8">
            Agrega productos antes de continuar.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
          >
            Ver productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🧾 Tu pedido
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <form onSubmit={handleConfirmPurchase} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de pago *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === "cash"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="text-2xl mb-1">💵</div>
                  <div className="font-medium">Efectivo</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("transfer")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === "transfer"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="text-2xl mb-1">🏦</div>
                  <div className="font-medium">Bre-b</div>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <img
                    src={item.image || undefined}
                    alt={item.title || item.name}
                    className="w-16 h-16 object-contain rounded-lg bg-white border border-gray-100"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-base leading-tight">
                      {item.title || item.name}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Cantidad:{" "}
                      <span className="font-bold text-gray-700">
                        {item.quantity}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-500 text-lg">
                      ${(item.price * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-xs">
                      ${item.price.toLocaleString()} c/u
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between items-center mb-6">
              <span className="text-xl font-bold text-gray-700">
                Total a pagar:
              </span>
              <span className="text-2xl font-bold text-orange-500">
                ${totalPrice.toLocaleString()}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-4 rounded-xl text-xl transition-colors mb-3"
            >
              {loading ? "Procesando..." : "✅ Confirmar pedido"}
            </button>

            <CashPaymentModal
              isOpen={showCashModal}
              totalAmount={totalPrice}
              onClose={() => setShowCashModal(false)}
              onConfirm={(cashAmount) => finalizePurchase(cashAmount)}
            />

            <button
              type="button"
              onClick={handleSuspendSale}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-bold py-4 rounded-xl text-xl transition-colors mb-3"
            >
              ⏸️ Suspender venta
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={loading}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-xl transition-colors"
            >
              Cancelar y volver
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
