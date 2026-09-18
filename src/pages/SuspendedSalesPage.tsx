import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import useCartStore from "../store/useCartStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  const [draftToCancel, setDraftToCancel] = useState<string | null>(null);
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

  const handleConfirmCancelDraft = async () => {
    if (!draftToCancel) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, "draftOrders", draftToCancel));
      toast.success("Venta suspendida descartada con éxito.");
      setDraftToCancel(null);
    } catch (error) {
      console.error("Error al cancelar la orden suspendida:", error);
      toast.error("No se pudo cancelar la venta suspendida.");
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
                      onClick={() => setDraftToCancel(draft.id)}
                      disabled={loading}
                      className="px-2 py-1 bg-red-600 hover:bg-red-400 text-white rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                    >
                      Cancelar orden
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

      {/* Modal de confirmación para descartar venta suspendida */}
      {draftToCancel && (
        <div className="fixed inset-0 z-120 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto mb-4">
              🗑️
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
              ¿Descartar venta suspendida?
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
              Esta venta suspendida será eliminada de la lista.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => setDraftToCancel(null)}
                className="flex-1 min-h-11 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                Volver
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmCancelDraft}
                className="flex-1 min-h-11 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Descartando...</span>
                  </>
                ) : (
                  <span>Sí, descartar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuspendedSalesPage;
