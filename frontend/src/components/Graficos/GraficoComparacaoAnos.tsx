import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import * as despesasService from "../../services/despesasService";
import * as categoriasService from "../../services/categoriasService";
import type { Categoria } from "../../types";

const MESES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const CORES = ["#0ea5e9", "#f97316", "#22c55e", "#a855f7", "#ef4444", "#64748b"];

interface Props {
  grupoId: string;
  anosDisponiveis: number[];
}

export function GraficoComparacaoAnos({ grupoId, anosDisponiveis }: Props) {
  const [anosSelecionados, setAnosSelecionados] = useState<number[]>(() => anosDisponiveis.slice(-2));
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [dados, setDados] = useState<Record<string, number | string>[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    categoriasService.listarCategorias(grupoId).then(setCategorias);
  }, [grupoId]);

  useEffect(() => {
    setAnosSelecionados((atual) => {
      const validos = atual.filter((a) => anosDisponiveis.includes(a));
      return validos.length > 0 ? validos : anosDisponiveis.slice(-2);
    });
  }, [anosDisponiveis]);

  useEffect(() => {
    if (anosSelecionados.length === 0) {
      setDados([]);
      return;
    }
    setCarregando(true);
    const filtros = categoriaSelecionada ? { categoria: categoriaSelecionada } : {};
    Promise.all(anosSelecionados.map((ano) => despesasService.listarDespesas(grupoId, { ano, ...filtros })))
      .then((porAno) => {
        const linhas = MESES_ABREV.map((mes) => ({ mes } as Record<string, number | string>));
        anosSelecionados.forEach((ano, index) => {
          const totalPorMes = new Array(12).fill(0);
          porAno[index].forEach((d) => {
            totalPorMes[d.mes - 1] += d.valor;
          });
          totalPorMes.forEach((total, mesIndex) => {
            linhas[mesIndex][ano] = Number(total.toFixed(2));
          });
        });
        setDados(linhas);
      })
      .finally(() => setCarregando(false));
  }, [grupoId, anosSelecionados, categoriaSelecionada]);

  function alternarAno(ano: number) {
    setAnosSelecionados((atual) =>
      atual.includes(ano) ? atual.filter((a) => a !== ano) : [...atual, ano].sort((a, b) => a - b)
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-sm text-slate-700">
          Categoria
          <select
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c._id} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
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
            {anosSelecionados.map((ano, index) => (
              <Line key={ano} type="monotone" dataKey={ano} stroke={CORES[index % CORES.length]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
