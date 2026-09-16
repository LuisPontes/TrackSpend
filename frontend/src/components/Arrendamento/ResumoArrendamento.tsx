import type { MovimentoArrendamento } from "../../types";

export function ResumoArrendamento({ movimentos }: { movimentos: MovimentoArrendamento[] }) {
  const totalReceitas = movimentos.filter((m) => m.tipo === "RECEITA").reduce((s, m) => s + m.valor, 0);
  const totalDespesas = movimentos.filter((m) => m.tipo === "DESPESA").reduce((s, m) => s + m.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <div className="text-slate-500">Receitas</div>
        <div className="text-lg font-semibold text-emerald-600">{totalReceitas.toFixed(2)} €</div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <div className="text-slate-500">Despesas</div>
        <div className="text-lg font-semibold text-red-600">{totalDespesas.toFixed(2)} €</div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <div className="text-slate-500">Saldo</div>
        <div className={`text-lg font-semibold ${saldo >= 0 ? "text-emerald-600" : "text-red-600"}`}>
          {saldo.toFixed(2)} €
        </div>
      </div>
    </div>
  );
}
