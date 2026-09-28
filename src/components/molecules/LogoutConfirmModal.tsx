import type { FC } from "react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail?: string | null;
}

const LogoutConfirmModal: FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto mb-4">
          🚪
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
          ¿Cerrar sesión en TINKU?
        </h3>
        <p className="text-xs text-gray-500 text-center mb-6">
          {userEmail ? (
            <span className="block mb-1">
              Usuario actual: <strong className="text-gray-700">{userEmail}</strong>
            </span>
          ) : null}
          Podrás ingresar con este o con cualquier otro usuario para gestionar su catálogo.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
