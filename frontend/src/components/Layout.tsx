import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-1.5 text-sm ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`;

export function Layout() {
  const { usuario, logout } = useAuth();
  const { grupoId } = useParams();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link to="/grupos" className="font-semibold hover:text-slate-600">
              TrackSpend
            </Link>
            {grupoId && (
              <nav className="flex gap-1">
                <Link
                  to="/grupos"
                  className="rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                  title="Escolher outro grupo ou criar um novo"
                >
                  ← Grupos
                </Link>
                <NavLink to={`/grupos/${grupoId}/dashboard`} className={linkClass}>
                  Dashboard
                </NavLink>
                <NavLink to={`/grupos/${grupoId}/despesas`} className={linkClass}>
                  Despesas
                </NavLink>
                <NavLink to={`/grupos/${grupoId}/graficos`} className={linkClass}>
                  Gráficos
                </NavLink>
                <NavLink to={`/grupos/${grupoId}/settings`} className={linkClass}>
                  Definições
                </NavLink>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>{usuario?.nome}</span>
            <button onClick={logout} className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-100">
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
