import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";

/**
 * Hook reactivo para monitorear el estado de la conexión a internet
 * Utiliza los eventos nativos 'online' y 'offline' del navegador.
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

interface ConnectionBadgeProps {
  userEmail?: string | null;
  role?: string | null;
  compact?: boolean;
}

/**
 * Chip visual que indica el usuario activo y si la app tiene internet ('En línea')
 * o si perdió la conexión ('Desconectado - Modo Offline').
 */
export const ConnectionBadge = ({
  userEmail,
  role,
  compact = false,
}: ConnectionBadgeProps) => {
  const isOnline = useNetworkStatus();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all duration-300 select-none ${
        isOnline
          ? "bg-slate-100 text-slate-700 border-slate-200"
          : "bg-red-50 text-red-700 border-red-200 shadow-xs animate-pulse"
      }`}
      title={
        isOnline
          ? "Conexión a internet activa (Sincronizado con la nube)"
          : "Sin conexión a internet (Operando en modo local seguro)"
      }
    >
      {/* Indicador con icono o pulso */}
      <span className="relative flex h-2 w-2">
        {isOnline ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </>
        ) : (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </>
        )}
      </span>

      {/* Nombre o Correo del usuario */}
      {userEmail && (
        <span
          className={`font-semibold truncate ${
            compact ? "max-w-[85px] text-[11px]" : "max-w-[130px]"
          }`}
        >
          {userEmail.split("@")[0]}
        </span>
      )}

      {/* Rol opcional (Admin) */}
      {role === "admin" && !compact && (
        <span className="bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
          Admin
        </span>
      )}

      {/* Estado del Internet: En línea / Desconectado */}
      <span
        className={`flex items-center gap-0.5 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
          isOnline
            ? "text-emerald-700 bg-emerald-100/70"
            : "text-rose-700 bg-rose-100 font-bold"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-2.5 h-2.5" />
            <span>En línea</span>
          </>
        ) : (
          <>
            <WifiOff className="w-2.5 h-2.5" />
            <span>Desconectado</span>
          </>
        )}
      </span>
    </div>
  );
};

export default ConnectionBadge;
