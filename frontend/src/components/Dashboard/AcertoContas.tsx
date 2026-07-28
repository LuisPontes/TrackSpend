import type { DashboardResumo, MembroGrupo } from "../../types";

function nomeDe(membros: MembroGrupo[], id: string): string {
  return membros.find((m) => m._id === id)?.nome ?? id.slice(-4);
}

export function AcertoContas({ dashboard, membros }: { dashboard: DashboardResumo; membros: MembroGrupo[] }) {
  const { saldos, transferencias } = dashboard;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">Acerto de contas</h2>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {membros.map((membro) => {
          const saldo = saldos[membro._id] ?? 0;
          const emDia = Math.abs(saldo) < 0.01;
          return (
            <div key={membro._id} className="rounded border border-slate-200 p-3 text-sm">
              <div className="font-medium text-slate-700">{membro.nome}</div>
              <div className={emDia ? "text-slate-500" : saldo > 0 ? "text-emerald-600" : "text-red-600"}>
                {emDia
                  ? "Contas em dia"
                  : saldo > 0
                    ? `A receber ${saldo.toFixed(2)} €`
                    : `A pagar ${Math.abs(saldo).toFixed(2)} €`}
              </div>
            </div>
          );
        })}
      </div>

      {transferencias.length === 0 ? (
        <p className="text-sm text-slate-500">Ninguém deve nada este mês.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {transferencias.map((t, i) => (
            <li key={i} className="text-slate-700">
              <span className="font-medium">{nomeDe(membros, t.de)}</span> deve{" "}
              <span className="font-medium">{t.valor.toFixed(2)} €</span> a{" "}
              <span className="font-medium">{nomeDe(membros, t.para)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
