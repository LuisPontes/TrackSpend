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
  chaveCategoria,
  mediaPrimeirosMeses,
  mesesFechados,
  totaisPorMes,
  ultimoMesVisivel,
} from "./utilsGraficos";

const CORES = ["#0ea5e9", "#f97316", "#22c55e", "#a855f7", "#ef4444", "#64748b"];

type Metrica = "RECEITA" | "DESPESA" | "SALDO";

interface Props {
  grupoId: string;
  anosDisponiveis: number[];
  categorias: arrendamentoService.CategoriasArrendamento;
}

export function GraficoComparacaoArrendamento({ grupoId, anosDisponiveis, categorias }: Props) {
  const [anosSelecionados, setAnosSelecionados] = useState<number[]>(() => anosDisponiveis.slice(-2));
  const [metrica, setMetrica] = useState<Metrica>("SALDO");
  const [categoria, setCategoria] = useState("");
  const [valoresPorAno, setValoresPorAno] = useState<Record<number, number[]>>({});
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    setAnosSelecionados((atual) => {
      const validos = atual.filter((a) => anosDisponiveis.includes(a));
      return validos.length > 0 ? validos : anosDisponiveis.slice(-2);
    });
  }, [anosDisponiveis]);

  useEffect(() => {
    if (anosSelecionados.length === 0) {
      setValoresPorAno({});
      return;
    }
    let cancelado = false;
    setCarregando(true);
    Promise.all(anosSelecionados.map((ano) => arrendamentoService.listarMovimentos(grupoId, { ano })))
      .then((porAno) => {
        if (cancelado) return;
        const resultado: Record<number, number[]> = {};
        anosSelecionados.forEach((ano, index) => {
          const movimentos =
            categoria && metrica !== "SALDO"
              ? porAno[index].filter((m) => chaveCategoria(m.categoria) === chaveCategoria(categoria))
              : porAno[index];
          const { receitas, despesas } = totaisPorMes(movimentos);
          resultado[ano] = MESES_ABREV.map((_, i) => {
            if (metrica === "RECEITA") return arredondar(receitas[i]);
            if (metrica === "DESPESA") return arredondar(despesas[i]);
            return arredondar(receitas[i] - despesas[i]);
          });
        });
        setValoresPorAno(resultado);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [grupoId, anosSelecionados, metrica, categoria]);

  function alternarAno(ano: number) {
    setAnosSelecionados((atual) =>
      atual.includes(ano) ? atual.filter((a) => a !== ano) : [...atual, ano].sort((a, b) => a - b)
    );
  }

  function mudarMetrica(nova: Metrica) {
    setMetrica(nova);
    setCategoria("");
  }

  const dados = MESES_ABREV.map((mes, i) => {
    const linha: Record<string, number | string | null> = { mes };
    anosSelecionados.forEach((ano) => {
      linha[ano] = i > ultimoMesVisivel(ano) ? null : (valoresPorAno[ano]?.[i] ?? 0);
    });
    return linha;
  });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-sm text-slate-700">
          Valor
          <select
            value={metrica}
            onChange={(e) => mudarMetrica(e.target.value as Metrica)}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="SALDO">Saldo</option>
            <option value="RECEITA">Receitas</option>
            <option value="DESPESA">Despesas</option>
          </select>
        </label>

        {metrica !== "SALDO" && (
          <label className="flex items-center gap-1.5 text-sm text-slate-700">
            Categoria
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            >
              <option value="">Todas as categorias</option>
              {categorias[metrica].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        {anosDisponiveis.map((ano) => (
          <label key={ano} className="flex items-center gap-1.5 text-sm text-slate-700">
            <input type="checkbox" checked={anosSelecionados.includes(ano)} onChange={() => alternarAno(ano)} />
            {ano}
          </label>
        ))}
      </div>

      {anosSelecionados.length === 0 ? (
        <p className="text-sm text-slate-500">Seleciona pelo menos um ano.</p>
      ) : carregando ? (
        <p className="text-sm text-slate-500">A carregar...</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => `${Number(value).toFixed(2)} €`} />
            <Legend />
            <ReferenceLine y={0} stroke="#cbd5e1" />
            {anosSelecionados.map((ano, index) => (
              <Line key={ano} type="monotone" dataKey={ano} stroke={CORES[index % CORES.length]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
            {anosSelecionados.map((ano, index) => {
              const media = mediaPrimeirosMeses(valoresPorAno[ano] ?? [], mesesFechados(ano));
              if (media === null) return null;
              return (
                <ReferenceLine
                  key={`media-${ano}`}
                  y={media}
                  stroke={CORES[index % CORES.length]}
                  strokeDasharray="5 4"
                  strokeOpacity={0.6}
                  label={{
                    value: `${ano}: ${media.toFixed(2)} €`,
                    position: index % 2 === 0 ? "insideTopRight" : "insideBottomRight",
                    fill: CORES[index % CORES.length],
                    fontSize: 11,
                  }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
