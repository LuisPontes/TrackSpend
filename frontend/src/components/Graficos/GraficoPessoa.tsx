import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { DashboardResumo, MembroGrupo } from "../../types";

const CORES = ["#0ea5e9", "#f97316", "#22c55e", "#a855f7"];

export function GraficoPessoa({ dashboard, membros }: { dashboard: DashboardResumo; membros: MembroGrupo[] }) {
  const dados = membros.map((membro) => ({
    nome: membro.nome,
    valor: Number((dashboard.resumo.porPessoa[membro._id] ?? 0).toFixed(2)),
  }));

  const semDados = dados.every((d) => d.valor === 0);
  if (semDados) {
    return <p className="text-sm text-slate-500">Sem despesas neste período.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={dados} dataKey="valor" nameKey="nome" outerRadius={100} label>
          {dados.map((_, index) => (
            <Cell key={index} fill={CORES[index % CORES.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${Number(value).toFixed(2)} €`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
