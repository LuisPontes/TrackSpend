import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import type { MovimentoArrendamento } from "../../types";
import { arredondar, chaveCategoria } from "./utilsGraficos";

export function GraficoCategoriaArrendamento({ movimentos }: { movimentos: MovimentoArrendamento[] }) {
  const porCategoria = new Map<string, { categoria: string; receitas: number; despesas: number }>();
  for (const m of movimentos) {
    const chave = chaveCategoria(m.categoria);
    const linha = porCategoria.get(chave) ?? { categoria: m.categoria, receitas: 0, despesas: 0 };
    if (m.tipo === "RECEITA") linha.receitas += m.valor;
    else linha.despesas += m.valor;
    porCategoria.set(chave, linha);
  }

  const dados = Array.from(porCategoria.values()).map((l) => ({
    categoria: l.categoria,
    receitas: arredondar(l.receitas),
    despesas: arredondar(l.despesas),
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
        <Legend />
        <Bar dataKey="receitas" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
