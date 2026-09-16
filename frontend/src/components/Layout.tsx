import { useState } from "react";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useFetch } from "../hooks/useFetch";
import * as gruposService from "../services/gruposService";
import type { TipoGrupo } from "../types";
import { NotificacoesProvider } from "../context/NotificacoesContext";
import { NotificacaoBadge } from "./Notificacoes/NotificacaoBadge";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-2 text-sm ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`;

const linkClassMobile = ({ isActive }: { isActive: boolean }) =>
  `block rounded px-3 py-3 text-base ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`;

function linksPorTipo(grupoId: string, tipo: TipoGrupo): { to: string; label: string }[] {
  if (tipo === "EMPRESTIMO") {
    return [
      { to: `/grupos/${grupoId}/emprestimos`, label: "Empréstimos" },
      { to: `/grupos/${grupoId}/settings`, label: "Definições" },
    ];
  }
  if (tipo === "ARRENDAMENTO") {
    return [
      { to: `/grupos/${grupoId}/arrendamento`, label: "Arrendamento" },
      { to: `/grupos/${grupoId}/settings`, label: "Definições" },
    ];
  }
  return [
    { to: `/grupos/${grupoId}/dashboard`, label: "Dashboard" },
    { to: `/grupos/${grupoId}/despesas`, label: "Despesas" },
    { to: `/grupos/${grupoId}/graficos`, label: "Gráficos" },
    { to: `/grupos/${grupoId}/settings`, label: "Definições" },
  ];
}

function LinksGrupo({ grupoId, tipo }: { grupoId: string; tipo: TipoGrupo }) {
  return (
    <>
      {linksPorTipo(grupoId, tipo).map((link) => (
        <NavLink key={link.to} to={link.to} className={linkClass}>
          {link.label}
        </NavLink>
      ))}
    </>
  );
}

function LinksGrupoMobile({ grupoId, tipo, aoNavegar }: { grupoId: string; tipo: TipoGrupo; aoNavegar: () => void }) {
  return (
    <>
      <Link
        to="/grupos"
        onClick={aoNavegar}
        className="block rounded px-3 py-3 text-base text-slate-600 hover:bg-slate-100"
      >
        ← Grupos
      </Link>
      {linksPorTipo(grupoId, tipo).map((link) => (
        <NavLink key={link.to} to={link.to} className={linkClassMobile} onClick={aoNavegar}>
          {link.label}
        </NavLink>
      ))}
    </>
  );
}

function LayoutConteudo({ grupoId, tipo }: { grupoId?: string; tipo?: TipoGrupo }) {
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
            {grupoId && tipo && (
              <nav className="hidden gap-1 md:flex">
                <Link
                  to="/grupos"
                  className="rounded px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                  title="Escolher outro grupo ou criar um novo"
                >
                  ← Grupos
                </Link>
                <LinksGrupo grupoId={grupoId} tipo={tipo} />
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

      {grupoId && tipo && menuAberto && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMenuAberto(false)} />
          <nav
            className="fixed left-0 top-0 z-50 h-screen w-64 space-y-1 bg-white p-4 shadow-lg md:hidden"
            aria-label="Menu"
          >
            <p className="mb-2 px-3 text-sm font-semibold text-slate-400">TrackSpend</p>
            <LinksGrupoMobile grupoId={grupoId} tipo={tipo} aoNavegar={() => setMenuAberto(false)} />
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
  const { dados: grupo } = useFetch(
    () => (grupoId ? gruposService.obterGrupo(grupoId) : Promise.resolve(null)),
    [grupoId]
  );

  if (grupoId) {
    return (
      <NotificacoesProvider grupoId={grupoId}>
        <LayoutConteudo grupoId={grupoId} tipo={grupo?.tipo} />
      </NotificacoesProvider>
    );
  }

  return <LayoutConteudo />;
}
