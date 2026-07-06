// Solo deja pasar si hay una sesión activa; si no, redirige al login.
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="full-loader">
        <Loader2 size={28} className="spin" style={{ animation: "spin 0.7s linear infinite" }} />
        <span>Cargando…</span>
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}
