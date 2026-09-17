import { type FormEvent, useState } from "react";
import type { MovimentoArrendamento, TipoMovimentoArrendamento } from "../../types";
import * as arrendamentoService from "../../services/arrendamentoService";

interface Props {
  grupoId: string;
  movimentos: MovimentoArrendamento[];
  aoRemover: (id: string) => void;
  aoAtualizar: () => void;
}

function FormEdicaoMovimento({
  grupoId,
  movimento,
  aoGuardar,
  aoCancelar,
}: {
  grupoId: string;
  movimento: MovimentoArrendamento;
  aoGuardar: () => void;
  aoCancelar: () => void;
}) {
  const [tipo, setTipo] = useState<TipoMovimentoArrendamento>(movimento.tipo);
  const [categoria, setCategoria] = useState(movimento.categoria);
  const [valor, setValor] = useState(String(movimento.valor));
  const [data, setData] = useState(movimento.data.slice(0, 10));
  const [descricao, setDescricao] = useState(movimento.descricao ?? "");
  const [aGuardar, setAGuardar] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setAGuardar(true);
    try {
      await arrendamentoService.editarMovimento(grupoId, movimento._id, {
        tipo,
        categoria: categoria.trim(),
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
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2 rounded-lg border border-slate-300 bg-slate-50 p-3 md:grid-cols-6">
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value as TipoMovimentoArrendamento)}
        className="min-h-10 rounded border border-slate-300 px-2 py-1 text-sm"
      >
        <option value="RECEITA">Receita</option>
        <option value="DESPESA">Despesa</option>
      </select>
      <input
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        required
        className="col-span-2 min-h-10 rounded border border-slate-300 px-2 py-1 text-sm md:col-span-2"
      />
      <input
        type="number"
        min={0}
        step="0.01"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        required
        className="min-h-10 rounded border border-slate-300 px-2 py-1 text-sm"
      />
      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        required
        className="min-h-10 rounded border border-slate-300 px-2 py-1 text-sm"
      />
      <input
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="col-span-2 min-h-10 rounded border border-slate-300 px-2 py-1 text-sm md:col-span-2"
      />
      <div className="col-span-2 flex gap-2 md:col-span-6">
        <button type="submit" disabled={aGuardar} className="min-h-10 rounded bg-slate-900 px-3 text-sm font-medium text-white disabled:opacity-50">
          Guardar
        </button>
        <button type="button" onClick={aoCancelar} className="min-h-10 rounded border border-slate-300 px-3 text-sm hover:bg-slate-100">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function ListaMovimentos({ grupoId, movimentos, aoRemover, aoAtualizar }: Props) {
  const [editandoId, setEditandoId] = useState<string | null>(null);

  if (movimentos.length === 0) {
    return <p className="text-sm text-slate-500">Sem movimentos neste período.</p>;
  }

  return (
    <>
      <table className="hidden w-full text-left text-sm md:table">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="py-2">Data</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Descrição</th>
            <th className="text-right">Valor</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {movimentos.map((m) =>
            editandoId === m._id ? (
              <tr key={m._id}>
                <td colSpan={6} className="py-2">
                  <FormEdicaoMovimento
                    grupoId={grupoId}
                    movimento={m}
                    aoGuardar={() => {
                      setEditandoId(null);
                      aoAtualizar();
                    }}
                    aoCancelar={() => setEditandoId(null)}
                  />
                </td>
              </tr>
            ) : (
              <tr key={m._id} className="border-b border-slate-100">
                <td className="py-2">{new Date(m.data).toLocaleDateString("pt-PT")}</td>
                <td className={m.tipo === "RECEITA" ? "text-emerald-600" : "text-red-600"}>
                  {m.tipo === "RECEITA" ? "Receita" : "Despesa"}
                </td>
                <td>{m.categoria}</td>
                <td className="text-slate-500">{m.descricao}</td>
                <td className="text-right font-medium">
                  {m.tipo === "DESPESA" ? "-" : ""}
                  {m.valor.toFixed(2)} €
                </td>
                <td className="whitespace-nowrap text-right">
                  <button onClick={() => setEditandoId(m._id)} className="mr-3 text-xs text-slate-600 hover:underline">
                    editar
                  </button>
                  <button onClick={() => aoRemover(m._id)} className="text-xs text-red-600 hover:underline">
                    remover
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <div className="space-y-3 md:hidden">
        {movimentos.map((m) =>
          editandoId === m._id ? (
            <FormEdicaoMovimento
              key={m._id}
              grupoId={grupoId}
              movimento={m}
              aoGuardar={() => {
                setEditandoId(null);
                aoAtualizar();
              }}
              aoCancelar={() => setEditandoId(null)}
            />
          ) : (
            <div key={m._id} className="rounded-lg border border-slate-200 p-4 text-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className={`text-base font-semibold ${m.tipo === "RECEITA" ? "text-emerald-600" : "text-red-600"}`}>
                  {m.tipo === "DESPESA" ? "-" : ""}
                  {m.valor.toFixed(2)} €
                </span>
                <div className="flex gap-3">
                  <button onClick={() => setEditandoId(m._id)} className="min-h-11 px-2 text-sm text-slate-600">
                    editar
                  </button>
                  <button onClick={() => aoRemover(m._id)} className="min-h-11 px-2 text-sm text-red-600">
                    remover
                  </button>
                </div>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Data</span>
                <span>{new Date(m.data).toLocaleDateString("pt-PT")}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Categoria</span>
                <span>{m.categoria}</span>
              </div>
              {m.descricao && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Descrição</span>
                  <span className="text-right">{m.descricao}</span>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </>
  );
}
