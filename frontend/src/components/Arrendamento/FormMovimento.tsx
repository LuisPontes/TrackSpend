import { type FormEvent, useState } from "react";
import type { TipoMovimentoArrendamento } from "../../types";
import * as arrendamentoService from "../../services/arrendamentoService";

export function FormMovimento({ grupoId, aoCriar }: { grupoId: string; aoCriar: () => void }) {
  const [tipo, setTipo] = useState<TipoMovimentoArrendamento>("RECEITA");
  const [categoria, setCategoria] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setEnviando(true);
    try {
      await arrendamentoService.criarMovimento(grupoId, {
        tipo,
        categoria: categoria.trim(),
        valor: Number(valor),
        data,
        descricao: descricao || undefined,
      });
      setCategoria("");
      setValor("");
      setDescricao("");
      aoCriar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value as TipoMovimentoArrendamento)}
        className="min-h-11 rounded border border-slate-300 px-2 py-2 text-sm"
      >
        <option value="RECEITA">Receita</option>
        <option value="DESPESA">Despesa</option>
      </select>

      <input
        placeholder="Categoria (ex: Renda, Manutenção)"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        required
        className="col-span-2 min-h-11 rounded border border-slate-300 px-2 py-2 text-sm md:col-span-2"
      />

      <input
        type="number"
        min={0}
        step="0.01"
        placeholder="Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        required
        className="min-h-11 rounded border border-slate-300 px-2 py-2 text-sm"
      />

      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        required
        className="min-h-11 rounded border border-slate-300 px-2 py-2 text-sm"
      />

      <input
        placeholder="Descrição (opcional)"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="col-span-2 min-h-11 rounded border border-slate-300 px-2 py-2 text-sm md:col-span-2"
      />

      <button
        type="submit"
        disabled={enviando}
        className="col-span-2 min-h-12 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 md:col-span-1"
      >
        {enviando ? "A adicionar..." : "+ Adicionar"}
      </button>
    </form>
  );
}
