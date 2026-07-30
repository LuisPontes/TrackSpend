import { type FormEvent, useEffect, useState } from "react";
import type { Categoria, TipoDespesa } from "../../types";
import * as categoriasService from "../../services/categoriasService";
import * as despesasService from "../../services/despesasService";
import { useNotificacoes } from "../../hooks/useNotificacoes";

const CORES = ["#f97316", "#0ea5e9", "#22c55e", "#a855f7", "#ef4444", "#64748b"];

export function FormDespesa({ grupoId, aoCriar }: { grupoId: string; aoCriar: () => void }) {
  const { recarregar: recarregarNotificacoes } = useNotificacoes();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoria, setCategoria] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [tipo, setTipo] = useState<TipoDespesa>("VARIAVEL");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    categoriasService.listarCategorias(grupoId).then(setCategorias);
  }, [grupoId]);

  useEffect(() => {
    if (!aviso) return;
    const timeout = setTimeout(() => setAviso(null), 5000);
    return () => clearTimeout(timeout);
  }, [aviso]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setEnviando(true);
    try {
      let nomeCategoria = categoria;

      if (categoria === "__nova__") {
        if (!novaCategoria.trim()) return;
        const cor = CORES[categorias.length % CORES.length];
        const criada = await categoriasService.criarCategoria(grupoId, novaCategoria.trim(), tipo, cor);
        setCategorias((c) => [...c, criada]);
        nomeCategoria = criada.nome;
      }

      const { notificacao } = await despesasService.criarDespesa(grupoId, {
        categoria: nomeCategoria,
        tipo,
        valor: Number(valor),
        data,
        descricao: descricao || undefined,
      });

      if (notificacao) {
        setAviso(`⚠️ Categoria "${notificacao.categoria}" ultrapassou orçamento! (+€${(notificacao.excesso ?? 0).toFixed(2)})`);
        recarregarNotificacoes();
      }

      setValor("");
      setDescricao("");
      setNovaCategoria("");
      aoCriar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="relative">
      {aviso && (
        <button
          onClick={() => setAviso(null)}
          className="mb-3 w-full rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800"
        >
          {aviso}
        </button>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        required
        className="col-span-2 rounded border border-slate-300 px-2 py-2 text-sm min-h-11 md:col-span-2"
      >
        <option value="" disabled>
          Categoria
        </option>
        {categorias.map((c) => (
          <option key={c._id} value={c.nome}>
            {c.nome}
          </option>
        ))}
        <option value="__nova__">+ Nova categoria</option>
      </select>

      {categoria === "__nova__" && (
        <input
          placeholder="Nome da categoria"
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          required
          className="col-span-2 rounded border border-slate-300 px-2 py-2 text-sm min-h-11"
        />
      )}

      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value as TipoDespesa)}
        className="rounded border border-slate-300 px-2 py-2 text-sm min-h-11"
      >
        <option value="FIXA">Fixa</option>
        <option value="VARIAVEL">Variável</option>
      </select>

      <input
        type="number"
        min={0}
        step="0.01"
        placeholder="Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        required
        className="rounded border border-slate-300 px-2 py-2 text-sm min-h-11"
      />

      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        required
        className="rounded border border-slate-300 px-2 py-2 text-sm min-h-11"
      />

      <input
        placeholder="Descrição (opcional)"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="col-span-2 rounded border border-slate-300 px-2 py-2 text-sm min-h-11 md:col-span-2"
      />

      <button
        type="submit"
        disabled={enviando}
        className="col-span-2 min-h-12 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 md:col-span-1"
      >
        {enviando ? "A adicionar..." : "+ Adicionar"}
      </button>
      </form>
    </div>
  );
}
