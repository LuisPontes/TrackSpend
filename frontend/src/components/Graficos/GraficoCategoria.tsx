import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { DashboardResumo } from "../../types";

export function GraficoCategoria({ dashboard }: { dashboard: DashboardResumo }) {
  const dados = [...dashboard.fixas, ...dashboard.variaveis].map((linha) => ({
    categoria: linha.categoria,
    total: Number(linha.total.toFixed(2)),
  }));

  if (dados.length === 0) {
    return <p className="text-sm text-slate-500">Sem dados para mostrar neste período.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={dados}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => `${Number(value).toFixed(2)} €`} />
        <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
