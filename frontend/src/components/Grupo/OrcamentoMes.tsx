import { useEffect, useState } from "react";
import type { Categoria, Divisao, MembroGrupo, Orcamento, OrcamentoCategoria, TipoDivisao } from "../../types";
import * as orcamentoService from "../../services/orcamentoService";

interface Props {
  grupoId: string;
  mes: number;
  ano: number;
  categorias: Categoria[];
  membros: MembroGrupo[];
}

export function OrcamentoMes({ grupoId, mes, ano, categorias, membros }: Props) {
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
  const [valores, setValores] = useState<Record<string, number>>({});
  const [tipoDivisao, setTipoDivisao] = useState<TipoDivisao>("50/50");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    orcamentoService.obterOrcamento(grupoId, mes, ano).then((existente) => {
      setOrcamento(existente);
      if (existente) {
        setTipoDivisao(existente.divisao.tipo);
        const mapa: Record<string, number> = {};
        existente.categorias.forEach((c) => (mapa[c.categoriaNome] = c.valorPrevisto));
        setValores(mapa);
      }
    });
  }, [grupoId, mes, ano]);

  async function handleSalvar() {
    setSalvando(true);
    setMensagem(null);
    try {
      const categoriasOrcamento: OrcamentoCategoria[] = categorias.map((c) => ({
        categoriaNome: c.nome,
        valorPrevisto: valores[c.nome] ?? 0,
        tipo: c.tipo,
      }));
      const divisao: Divisao = { tipo: tipoDivisao, detalhes: {} };

      if (orcamento) {
        await orcamentoService.editarOrcamento(grupoId, orcamento._id, categoriasOrcamento, divisao);
      } else {
        const criado = await orcamentoService.criarOrcamento(grupoId, mes, ano, categoriasOrcamento, divisao);
        setOrcamento(criado);
      }
      setMensagem("Orçamento guardado");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">
        Orçamento previsto — {mes}/{ano}
      </h3>

      <div className="mb-4">
        <label className="mb-1 block text-sm text-slate-600">Divisão entre {membros.length} membros</label>
        <select
          value={tipoDivisao}
          onChange={(e) => setTipoDivisao(e.target.value as TipoDivisao)}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="50/50">50/50</option>
          <option value="percentual">Percentual customizado</option>
          <option value="fixo">Valor fixo por pessoa</option>
        </select>
      </div>

      <div className="space-y-2">
        {categorias.map((categoria) => (
          <div key={categoria._id} className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-700">{categoria.nome}</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={valores[categoria.nome] ?? ""}
              onChange={(e) =>
                setValores((v) => ({ ...v, [categoria.nome]: Number(e.target.value) }))
              }
              className="w-32 rounded border border-slate-300 px-2 py-1 text-right text-sm"
            />
          </div>
        ))}
        {categorias.length === 0 && (
          <p className="text-sm text-slate-500">Cria categorias nas Despesas antes de definir o orçamento.</p>
        )}
      </div>

      <button
        onClick={handleSalvar}
        disabled={salvando || categorias.length === 0}
        className="mt-4 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {salvando ? "A guardar..." : "Guardar orçamento"}
      </button>
      {mensagem && <p className="mt-2 text-sm text-emerald-600">{mensagem}</p>}
    </div>
  );
}
