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
    <table className="w-full text-left text-sm">
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
  );
}
