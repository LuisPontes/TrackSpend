import type { DashboardResumo, LinhaCategoriaDashboard, MembroGrupo } from "../../types";

function Secao({
  titulo,
  linhas,
  membros,
}: {
  titulo: string;
  linhas: LinhaCategoriaDashboard[];
  membros: MembroGrupo[];
}) {
  if (linhas.length === 0) return null;

  return (
    <>
      <tr className="bg-slate-50">
        <td colSpan={membros.length + 4} className="py-2 px-2 text-xs font-semibold uppercase text-slate-500">
          {titulo}
        </td>
      </tr>
      {linhas.map((linha) => (
        <tr key={linha.categoria} className="border-b border-slate-100">
          <td className="py-2 px-2">{linha.categoria}</td>
          {membros.map((membro) => (
            <td key={membro._id} className="px-2 text-right">
              {(linha.porUsuario[membro._id] ?? 0).toFixed(2)} €
            </td>
          ))}
          <td className="px-2 text-right text-slate-500">{linha.previsto.toFixed(2)} €</td>
          <td className="px-2 text-right font-medium">{linha.total.toFixed(2)} €</td>
          <td className={`px-2 text-right ${linha.diferenca < 0 ? "text-red-600" : "text-emerald-600"}`}>
            {linha.diferenca.toFixed(2)} €
          </td>
        </tr>
      ))}
    </>
  );
}

export function TabelaDespesas({ dashboard, membros }: { dashboard: DashboardResumo; membros: MembroGrupo[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="py-2 px-2">Categoria</th>
            {membros.map((membro) => (
              <th key={membro._id} className="px-2 text-right">
                {membro.nome}
              </th>
            ))}
            <th className="px-2 text-right">Previsto</th>
            <th className="px-2 text-right">Total</th>
            <th className="px-2 text-right">Diferença</th>
          </tr>
        </thead>
        <tbody>
          <Secao titulo="Despesas fixas" linhas={dashboard.fixas} membros={membros} />
          <Secao titulo="Despesas variáveis" linhas={dashboard.variaveis} membros={membros} />
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-300 font-semibold">
            <td className="py-2 px-2">Total geral</td>
            {membros.map((membro) => (
              <td key={membro._id} className="px-2 text-right">
                {(dashboard.resumo.porPessoa[membro._id] ?? 0).toFixed(2)} €
              </td>
            ))}
            <td />
            <td className="px-2 text-right">{dashboard.resumo.totalGeral.toFixed(2)} €</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
