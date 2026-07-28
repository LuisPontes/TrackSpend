import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function RequireAuth() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <p className="mt-24 text-center text-sm text-slate-500">A carregar...</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
