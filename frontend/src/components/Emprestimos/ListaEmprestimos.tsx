import { type FormEvent, useState } from "react";
import type { Emprestimo, MembroGrupo } from "../../types";
import * as emprestimosService from "../../services/emprestimosService";

interface Props {
  grupoId: string;
  emprestimos: Emprestimo[];
  membros: MembroGrupo[];
  aoAtualizar: () => void;
}

function nomeDe(membros: MembroGrupo[], id: string): string {
  return membros.find((m) => m._id === id)?.nome ?? id.slice(-4);
}

function FormPagamento({
  grupoId,
  emprestimoId,
  aoRegistar,
}: {
  grupoId: string;
  emprestimoId: string;
  aoRegistar: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setEnviando(true);
    try {
      await emprestimosService.registarPagamento(grupoId, emprestimoId, { valor: Number(valor), data });
      setValor("");
      setAberto(false);
      aoRegistar();
    } finally {
      setEnviando(false);
    }
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="min-h-9 text-xs text-slate-600 underline hover:text-slate-900">
        + Registar pagamento
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        min={0}
        step="0.01"
        placeholder="Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        required
        autoFocus
        className="min-h-9 w-28 rounded border border-slate-300 px-2 py-1 text-sm"
      />
      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        required
        className="min-h-9 rounded border border-slate-300 px-2 py-1 text-sm"
      />
      <button type="submit" disabled={enviando} className="min-h-9 rounded bg-slate-900 px-3 text-xs font-medium text-white disabled:opacity-50">
        Guardar
      </button>
      <button type="button" onClick={() => setAberto(false)} className="min-h-9 rounded border border-slate-300 px-3 text-xs hover:bg-slate-100">
        Cancelar
      </button>
    </form>
  );
}

function FormEdicaoEmprestimo({
  grupoId,
  emprestimo,
  aoGuardar,
  aoCancelar,
}: {
  grupoId: string;
  emprestimo: Emprestimo;
  aoGuardar: () => void;
  aoCancelar: () => void;
}) {
  const [valor, setValor] = useState(String(emprestimo.valor));
  const [data, setData] = useState(emprestimo.data.slice(0, 10));
  const [descricao, setDescricao] = useState(emprestimo.descricao ?? "");
  const [aGuardar, setAGuardar] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setAGuardar(true);
    try {
      await emprestimosService.editarEmprestimo(grupoId, emprestimo._id, {
        valor: Number(valor),
        data,
        descricao: descricao || undefined,
      });
      aoGuardar();
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        min={0}
        step="0.01"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        required
        autoFocus
        className="min-h-9 w-28 rounded border border-slate-300 px-2 py-1 text-sm"
      />
      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        required
        className="min-h-9 rounded border border-slate-300 px-2 py-1 text-sm"
      />
      <input
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="min-h-9 flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
      />
      <button type="submit" disabled={aGuardar} className="min-h-9 rounded bg-slate-900 px-3 text-xs font-medium text-white disabled:opacity-50">
        Guardar
      </button>
      <button type="button" onClick={aoCancelar} className="min-h-9 rounded border border-slate-300 px-3 text-xs hover:bg-slate-100">
        Cancelar
      </button>
    </form>
  );
}

export function ListaEmprestimos({ grupoId, emprestimos, membros, aoAtualizar }: Props) {
  const [editandoId, setEditandoId] = useState<string | null>(null);

  async function handleRemover(emprestimoId: string) {
    await emprestimosService.removerEmprestimo(grupoId, emprestimoId);
    aoAtualizar();
  }

  async function handleRemoverPagamento(emprestimoId: string, pagamentoId: string) {
    await emprestimosService.removerPagamento(grupoId, emprestimoId, pagamentoId);
    aoAtualizar();
  }

  if (emprestimos.length === 0) {
    return <p className="text-sm text-slate-500">Ainda não há empréstimos registados.</p>;
  }

  return (
    <div className="space-y-3">
      {emprestimos.map((emprestimo) => {
        const pago = emprestimo.saldo <= 0.01;

        if (editandoId === emprestimo._id) {
          return (
            <div key={emprestimo._id} className="rounded-lg border border-slate-300 bg-slate-50 p-4">
              <FormEdicaoEmprestimo
                grupoId={grupoId}
                emprestimo={emprestimo}
                aoGuardar={() => {
                  setEditandoId(null);
                  aoAtualizar();
                }}
                aoCancelar={() => setEditandoId(null)}
              />
            </div>
          );
        }

        return (
          <div key={emprestimo._id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-medium">{nomeDe(membros, emprestimo.credorId)}</span>
                <span className="text-slate-500"> emprestou a </span>
                <span className="font-medium">{nomeDe(membros, emprestimo.devedorId)}</span>
                {emprestimo.descricao && <span className="text-slate-500"> — {emprestimo.descricao}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{new Date(emprestimo.data).toLocaleDateString("pt-PT")}</span>
                <button onClick={() => setEditandoId(emprestimo._id)} className="text-xs text-slate-600 underline hover:text-slate-900">
                  editar
                </button>
                <button onClick={() => handleRemover(emprestimo._id)} className="text-xs text-red-600 underline hover:text-red-800">
                  remover
                </button>
              </div>
            </div>

            <div className="mb-2 flex flex-wrap items-center gap-4 text-sm">
              <span>
                Emprestado: <span className="font-medium">{emprestimo.valor.toFixed(2)} €</span>
              </span>
              <span>
                Pago: <span className="font-medium">{emprestimo.totalPago.toFixed(2)} €</span>
              </span>
              <span className={pago ? "font-medium text-emerald-600" : "font-medium text-red-600"}>
                {pago ? "Liquidado" : `Falta: ${emprestimo.saldo.toFixed(2)} €`}
              </span>
            </div>

            {emprestimo.pagamentos.length > 0 && (
              <ul className="mb-2 space-y-1 text-xs text-slate-500">
                {emprestimo.pagamentos.map((p) => (
                  <li key={p._id} className="flex items-center gap-2">
                    <span>
                      {new Date(p.data).toLocaleDateString("pt-PT")} — {p.valor.toFixed(2)} €
                      {p.descricao && ` (${p.descricao})`}
                    </span>
                    <button
                      onClick={() => handleRemoverPagamento(emprestimo._id, p._id)}
                      className="text-red-600 underline hover:text-red-800"
                    >
                      remover
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!pago && <FormPagamento grupoId={grupoId} emprestimoId={emprestimo._id} aoRegistar={aoAtualizar} />}
          </div>
        );
      })}
    </div>
  );
}
