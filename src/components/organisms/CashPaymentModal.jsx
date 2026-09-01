import React, { useState } from "react";

const CashPaymentModal = ({ isOpen, totalAmount, onClose, onConfirm }) => {
  const [cashPaid, setCashPaid] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const cashValue = Number(cashPaid);
  const change = Number.isFinite(cashValue) ? cashValue - totalAmount : 0;

  const handleConfirm = () => {
    if (!cashPaid || Number.isNaN(cashValue)) {
      setError("Ingresa el monto recibido");
      return;
    }

    if (cashValue < totalAmount) {
      setError("El monto recibido no alcanza el total");
      return;
    }

    setError("");
    onConfirm(cashValue);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800">💵 Pago en efectivo</h2>
        <p className="mt-2 text-sm text-gray-500">
          Ingresa lo que pagó el cliente para calcular el vuelto.
        </p>

        <label className="mt-4 block text-sm font-medium text-gray-700">
          Monto recibido
        </label>
        <input
          type="number"
          min="0"
          value={cashPaid}
          onChange={(e) => {
            setCashPaid(e.target.value);
            if (error) setError("");
          }}
          className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-3 text-lg focus:border-orange-500 focus:outline-none"
          placeholder="Ej: 5000"
        />

        {cashPaid && !Number.isNaN(cashValue) && (
          <div className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-orange-700">
            {cashValue >= totalAmount ? (
              <span>Vuelto a entregar: ${Math.max(change, 0).toLocaleString()}</span>
            ) : (
              <span>Falta: ${(totalAmount - cashValue).toLocaleString()}</span>
            )}
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-gray-100 px-4 py-3 font-semibold text-gray-600"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white"
          >
            Confirmar venta
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashPaymentModal;