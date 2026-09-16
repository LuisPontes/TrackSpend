import type { MovimentoArrendamento } from "../../types";

interface Props {
  movimentos: MovimentoArrendamento[];
  aoRemover: (id: string) => void;
}

export function ListaMovimentos({ movimentos, aoRemover }: Props) {
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
          {movimentos.map((m) => (
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
              <td className="text-right">
                <button onClick={() => aoRemover(m._id)} className="text-xs text-red-600 hover:underline">
                  remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-3 md:hidden">
        {movimentos.map((m) => (
          <div key={m._id} className="rounded-lg border border-slate-200 p-4 text-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className={`text-base font-semibold ${m.tipo === "RECEITA" ? "text-emerald-600" : "text-red-600"}`}>
                {m.tipo === "DESPESA" ? "-" : ""}
                {m.valor.toFixed(2)} €
              </span>
              <button onClick={() => aoRemover(m._id)} className="min-h-11 px-2 text-sm text-red-600">
                remover
              </button>
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
        ))}
      </div>
    </>
  );
}
