import type { Despesa } from "../../types";

interface Props {
  despesas: Despesa[];
  aoRemover: (id: string) => void;
}

export function ListaDespesas({ despesas, aoRemover }: Props) {
  if (despesas.length === 0) {
    return <p className="text-sm text-slate-500">Sem despesas neste período.</p>;
  }

  return (
    <>
      <table className="hidden w-full text-left text-sm md:table">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="py-2">Data</th>
            <th>Categoria</th>
            <th>Tipo</th>
            <th>Descrição</th>
            <th className="text-right">Valor</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {despesas.map((despesa) => (
            <tr key={despesa._id} className="border-b border-slate-100">
              <td className="py-2">{new Date(despesa.data).toLocaleDateString("pt-PT")}</td>
              <td>{despesa.categoria}</td>
              <td>{despesa.tipo === "FIXA" ? "Fixa" : "Variável"}</td>
              <td className="text-slate-500">{despesa.descricao}</td>
              <td className="text-right font-medium">{despesa.valor.toFixed(2)} €</td>
              <td className="text-right">
                <button onClick={() => aoRemover(despesa._id)} className="text-xs text-red-600 hover:underline">
                  remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-3 md:hidden">
        {despesas.map((despesa) => (
          <div key={despesa._id} className="rounded-lg border border-slate-200 p-4 text-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-base font-semibold text-slate-800">{despesa.valor.toFixed(2)} €</span>
              <button onClick={() => aoRemover(despesa._id)} className="min-h-11 px-2 text-sm text-red-600">
                remover
              </button>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Data</span>
              <span>{new Date(despesa.data).toLocaleDateString("pt-PT")}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Categoria</span>
              <span>{despesa.categoria}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Tipo</span>
              <span>{despesa.tipo === "FIXA" ? "Fixa" : "Variável"}</span>
            </div>
            {despesa.descricao && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Descrição</span>
                <span className="text-right">{despesa.descricao}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
