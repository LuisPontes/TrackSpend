import { useState } from "react";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { NotificacoesProvider } from "../context/NotificacoesContext";
import { NotificacaoBadge } from "./Notificacoes/NotificacaoBadge";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-2 text-sm ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`;

const linkClassMobile = ({ isActive }: { isActive: boolean }) =>
  `block rounded px-3 py-3 text-base ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`;

function LinksGrupo({ grupoId }: { grupoId: string }) {
  return (
    <>
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
    </>
  );
}

function LinksGrupoMobile({ grupoId, aoNavegar }: { grupoId: string; aoNavegar: () => void }) {
  return (
    <>
      <Link
        to="/grupos"
        onClick={aoNavegar}
        className="block rounded px-3 py-3 text-base text-slate-600 hover:bg-slate-100"
      >
        ← Grupos
      </Link>
      <NavLink to={`/grupos/${grupoId}/dashboard`} className={linkClassMobile} onClick={aoNavegar}>
        Dashboard
      </NavLink>
      <NavLink to={`/grupos/${grupoId}/despesas`} className={linkClassMobile} onClick={aoNavegar}>
        Despesas
      </NavLink>
      <NavLink to={`/grupos/${grupoId}/graficos`} className={linkClassMobile} onClick={aoNavegar}>
        Gráficos
      </NavLink>
      <NavLink to={`/grupos/${grupoId}/settings`} className={linkClassMobile} onClick={aoNavegar}>
        Definições
      </NavLink>
    </>
  );
}

function LayoutConteudo({ grupoId }: { grupoId?: string }) {
  const { usuario, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            {grupoId && (
              <button
                onClick={() => setMenuAberto(true)}
                className="flex h-11 w-11 items-center justify-center rounded text-xl hover:bg-slate-100 md:hidden"
                aria-label="Abrir menu"
              >
                ☰
              </button>
            )}
            <Link to="/grupos" className="font-semibold hover:text-slate-600">
              TrackSpend
            </Link>
            {grupoId && (
              <nav className="hidden gap-1 md:flex">
                <Link
                  to="/grupos"
                  className="rounded px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                  title="Escolher outro grupo ou criar um novo"
                >
                  ← Grupos
                </Link>
                <LinksGrupo grupoId={grupoId} />
              </nav>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            {grupoId && <NotificacaoBadge />}
            <span className="hidden sm:inline">{usuario?.nome}</span>
            <button
              onClick={logout}
              className="flex min-h-11 items-center rounded border border-slate-300 px-3 py-2 hover:bg-slate-100"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {grupoId && menuAberto && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMenuAberto(false)} />
          <nav
            className="fixed left-0 top-0 z-50 h-screen w-64 space-y-1 bg-white p-4 shadow-lg md:hidden"
            aria-label="Menu"
          >
            <p className="mb-2 px-3 text-sm font-semibold text-slate-400">TrackSpend</p>
            <LinksGrupoMobile grupoId={grupoId} aoNavegar={() => setMenuAberto(false)} />
          </nav>
        </>
      )}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export function Layout() {
  const { grupoId } = useParams();

  if (grupoId) {
    return (
      <NotificacoesProvider grupoId={grupoId}>
        <LayoutConteudo grupoId={grupoId} />
      </NotificacoesProvider>
    );
  }

  return <LayoutConteudo />;
}
