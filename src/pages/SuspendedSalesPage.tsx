import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  runTransaction,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import useCartStore from "../store/useCartStore";
import { useNavigate } from "react-router-dom";

type DraftOrderItem = {
  id: string;
  title?: string;
  name?: string;
  price?: number;
  quantity?: number;
  image?: string | null;
};

type DraftOrder = {
  id: string;
  createdBy?: string;
  createdAt?: { toDate?: () => Date } | string | null;
  total?: number;
  items?: DraftOrderItem[];
};
const SuspendedSalesPage = () => {
  const [drafts, setDrafts] = useState<DraftOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setCart = useCartStore((state) => state.setCart);
  const setActiveDraftId = useCartStore((state) => state.setActiveDraftId);

  useEffect(() => {
    const q = query(
      collection(db, "draftOrders"),
      where("status", "==", "suspended"),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: DraftOrder[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as DraftOrder[];
        setDrafts(items);
      },
      (err) => console.error("Error listening draftOrders:", err),
    );

    return () => unsub();
  }, []);

  const handleResume = (draft: DraftOrder) => {
    if (!draft?.items) return;

    const cartItems = draft.items.map((it) => ({
      id: it.id,
      title: it.title || it.name,
      price: it.price ?? 0,
      image: it.image ?? "",
      quantity: it.quantity ?? 1,
    }));

    setCart(cartItems);
    setActiveDraftId(draft.id);
    navigate("/");
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas cancelar esta orden y devolver el stock al inventario?",
    );
    if (!confirmed) return;

    // 🔥 BLINDAJE MULTI-TENANT: Buscamos el ID por ambos lados para que no dé undefined
    const uid = getAuth().currentUser?.uid;
    if (!uid) {
      alert("Error: No se encontró una sesión activa.");
      return;
    }

    try {
      setLoading(true);
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, "usuarios", uid, "orders", orderId);
        const orderSnap = await transaction.get(orderRef);

        if (!orderSnap.exists()) {
          throw new Error("La orden que intentas cancelar no existe.");
        }

        const orderData = orderSnap.data();

        if (orderData.status === "canceled") {
          throw new Error("Esta orden ya ha sido cancelada previamente.");
        }

        const items = orderData.items || [];
        const productUpdates: Array<{
          ref: ReturnType<typeof doc>;
          newStock: number;
        }> = [];

        // 1. Fase de Lectura: Consultamos el stock actual de cada producto de la orden
        for (const item of items) {
          const productRef = doc(db, "usuarios", uid, "productos", item.id);
          const productSnap = await transaction.get(productRef);

          if (productSnap.exists()) {
            const productData = productSnap.data();
            const currentStock = productData.stock ?? 0;

            productUpdates.push({
              ref: productRef,
              newStock: currentStock + item.quantity, // 🔄 ¡Sumamos de nuevo lo vendido!
            });
          }
        }

        // 2. Fase de Escritura: Actualizamos los inventarios con el stock devuelto
        productUpdates.forEach(({ ref, newStock }) => {
          transaction.update(ref, { stock: newStock });
        });

        // 3. Fase de Escritura: Marcamos la orden como cancelada
        transaction.update(orderRef, { status: "canceled" });
      });

      alert(
        "✅ ¡Orden cancelada con éxito! El dinero se restó y el stock fue devuelto.",
      );
    } catch (error: any) {
      console.error("Error al cancelar la orden:", error);
      alert(
        error.message || "No se pudo cancelar la orden. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">⏸️ Ventas suspendidas</h1>
      <p className="text-gray-600 mt-2 mb-6">
        Podés reanudar la venta suspendida o también puedes cancelarla.
      </p>

      {drafts.length === 0 ? (
        <div className="text-gray-500">
          No hay ventas suspendidas por el momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map((draft) => {
            const createdAt =
              draft.createdAt && typeof draft.createdAt !== "string"
                ? draft.createdAt.toDate?.()
                : draft.createdAt && typeof draft.createdAt === "string"
                  ? new Date(draft.createdAt)
                  : null;
            return (
              <div key={draft.id} className="bg-white p-4 rounded-xl shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm text-gray-500">Creada por</div>
                    <div className="font-semibold">
                      {draft.createdBy || "Usuario"}
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    {createdAt ? createdAt.toLocaleString() : "-"}
                  </div>
                </div>

                <div className="space-y-2 mb-4 max-h-40 overflow-auto">
                  {draft.items && draft.items.length > 0 ? (
                    draft.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                      >
                        <img
                          src={item.image || null}
                          alt={item.title || item.name}
                          className="w-12 h-12 object-contain rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {item.title || item.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            cantidad: {item.quantity || 1}
                          </div>
                        </div>
                        <div className="text-right font-bold text-orange-500">
                          $
                          {(
                            (item.price || 0) * (item.quantity || 1)
                          ).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">Sin items</div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleResume(draft)}
                      className="px-2 py-1 bg-green-600 hover:bg-green-400 text-white rounded-lg font-semibold"
                    >
                      Continuar venta
                    </button>

                    <button
                      onClick={() => handleCancelOrder(draft.id)}
                      disabled={loading}
                      className="px-2 py-1 bg-red-600 hover:bg-red-400 text-white rounded-lg font-semibold"
                    >
                      {loading ? "Cancelando..." : "Cancelar orden"}
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-600">Total</div>
                    <div className="font-bold  text-orange-500">
                      ${(draft.total || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SuspendedSalesPage;
