import { type FormEvent, useState } from "react";
import type { MembroGrupo } from "../../types";
import * as emprestimosService from "../../services/emprestimosService";

interface Props {
  grupoId: string;
  membros: MembroGrupo[];
  aoCriar: () => void;
}

export function FormEmprestimo({ grupoId, membros, aoCriar }: Props) {
  const [credorId, setCredorId] = useState(membros[0]?._id ?? "");
  const [devedorId, setDevedorId] = useState(membros[1]?._id ?? membros[0]?._id ?? "");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (credorId === devedorId) {
      setErro("Quem empresta e quem deve têm de ser pessoas diferentes.");
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      await emprestimosService.criarEmprestimo(grupoId, {
        credorId,
        devedorId,
        valor: Number(valor),
        data,
        descricao: descricao || undefined,
      });
      setValor("");
      setDescricao("");
      aoCriar();
    } catch (err: unknown) {
      const mensagem =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setErro(mensagem ?? "Não foi possível registar o empréstimo");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-6">
      <select
        value={credorId}
        onChange={(e) => setCredorId(e.target.value)}
        required
        className="col-span-2 min-h-11 rounded border border-slate-300 px-2 py-2 text-sm md:col-span-2"
        aria-label="Quem emprestou?"
      >
        {membros.map((m) => (
          <option key={m._id} value={m._id}>
            Emprestou: {m.nome}
          </option>
        ))}
      </select>

      <select
        value={devedorId}
        onChange={(e) => setDevedorId(e.target.value)}
        required
        className="col-span-2 min-h-11 rounded border border-slate-300 px-2 py-2 text-sm md:col-span-2"
        aria-label="Quem deve?"
      >
        {membros.map((m) => (
          <option key={m._id} value={m._id}>
            Deve: {m.nome}
          </option>
        ))}
      </select>

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
        {enviando ? "A registar..." : "+ Registar empréstimo"}
      </button>

      {erro && <p className="col-span-2 text-sm text-red-600 md:col-span-6">{erro}</p>}
    </form>
  );
}
