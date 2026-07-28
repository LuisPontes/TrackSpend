import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import * as despesasService from "../../services/despesasService";

const MESES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function GraficoAnual({ grupoId, ano }: { grupoId: string; ano: number }) {
  const [dados, setDados] = useState<{ mes: string; total: number }[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);
    despesasService.listarDespesas(grupoId, { ano }).then((despesas) => {
      const totalPorMes = new Array(12).fill(0);
      despesas.forEach((d) => {
        totalPorMes[d.mes - 1] += d.valor;
      });
      setDados(totalPorMes.map((total, index) => ({ mes: MESES_ABREV[index], total: Number(total.toFixed(2)) })));
      setCarregando(false);
    });
  }, [grupoId, ano]);

  if (carregando) return <p className="text-sm text-slate-500">A carregar...</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={dados}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => `${Number(value).toFixed(2)} €`} />
        <Line type="monotone" dataKey="total" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
