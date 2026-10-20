import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import * as arrendamentoService from "../../services/arrendamentoService";
import {
  MESES_ABREV,
  arredondar,
  mediaPrimeirosMeses,
  mesesFechados,
  totaisPorMes,
  ultimoMesVisivel,
} from "./utilsGraficos";

interface Linha {
  mes: string;
  receitas: number | null;
  despesas: number | null;
  saldo: number | null;
}

export function GraficoAnualArrendamento({ grupoId, ano }: { grupoId: string; ano: number }) {
  const [dados, setDados] = useState<Linha[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    arrendamentoService.listarMovimentos(grupoId, { ano }).then((movimentos) => {
      if (cancelado) return;
      const { receitas, despesas } = totaisPorMes(movimentos);
      const ultimo = ultimoMesVisivel(ano);
      setDados(
        MESES_ABREV.map((mes, i) =>
          i > ultimo
            ? { mes, receitas: null, despesas: null, saldo: null }
            : {
                mes,
                receitas: arredondar(receitas[i]),
                despesas: arredondar(despesas[i]),
                saldo: arredondar(receitas[i] - despesas[i]),
              }
        )
      );
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [grupoId, ano]);

  if (carregando) return <p className="text-sm text-slate-500">A carregar...</p>;

  const mediaSaldo = mediaPrimeirosMeses(
    dados.map((d) => d.saldo ?? 0),
    mesesFechados(ano)
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={dados}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => `${Number(value).toFixed(2)} €`} />
        <Legend />
        <ReferenceLine y={0} stroke="#cbd5e1" />
        <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
        {mediaSaldo !== null && (
          <ReferenceLine
            y={mediaSaldo}
            stroke="#0ea5e9"
            strokeDasharray="5 4"
            strokeOpacity={0.6}
            label={{
              value: `Saldo médio: ${mediaSaldo.toFixed(2)} €`,
              position: "insideTopRight",
              fill: "#0ea5e9",
              fontSize: 11,
            }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
