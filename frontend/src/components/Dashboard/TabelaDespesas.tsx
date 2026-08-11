import { Fragment, useEffect, useState } from "react";
import type { Despesa, DashboardResumo, LinhaCategoriaDashboard, MembroGrupo } from "../../types";
import * as despesasService from "../../services/despesasService";

interface DetalheState {
  aCarregar: boolean;
  erro: string | null;
  despesas: Despesa[] | null;
}

function nomeMembro(membros: MembroGrupo[], usuarioId: string): string {
  return membros.find((m) => m._id === usuarioId)?.nome ?? "—";
}

function DetalhesCategoria({ estado, membros }: { estado: DetalheState; membros: MembroGrupo[] }) {
  if (estado.aCarregar) return <p className="text-sm text-slate-500">A carregar registos…</p>;
  if (estado.erro) return <p className="text-sm text-red-600">{estado.erro}</p>;
  if (!estado.despesas || estado.despesas.length === 0) {
    return <p className="text-sm text-slate-500">Sem registos nesta categoria.</p>;
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="text-xs uppercase text-slate-400">
          <th className="py-1 px-2">Data</th>
          <th className="px-2">Descrição</th>
          <th className="px-2">Quem gastou</th>
          <th className="px-2 text-right">Valor</th>
        </tr>
      </thead>
      <tbody>
        {estado.despesas.map((despesa) => {
          const gastoPor = nomeMembro(membros, despesa.usuarioId);
          const registadoPor = despesa.adicionadoPor ? nomeMembro(membros, despesa.adicionadoPor) : null;
          return (
            <tr key={despesa._id} className="border-b border-slate-100 last:border-0">
              <td className="py-1 px-2 whitespace-nowrap text-slate-500">
                {new Date(despesa.data).toLocaleDateString("pt-PT")}
              </td>
              <td className="py-1 px-2">{despesa.descricao || "—"}</td>
              <td className="py-1 px-2 text-slate-500">
                {gastoPor}
                {registadoPor && registadoPor !== gastoPor && (
                  <span className="text-xs text-slate-400"> (registado por {registadoPor})</span>
                )}
              </td>
              <td className="py-1 px-2 text-right font-medium">{despesa.valor.toFixed(2)} €</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function DetalhesCategoriaCartoes({ estado, membros }: { estado: DetalheState; membros: MembroGrupo[] }) {
  if (estado.aCarregar) return <p className="text-sm text-slate-500">A carregar registos…</p>;
  if (estado.erro) return <p className="text-sm text-red-600">{estado.erro}</p>;
  if (!estado.despesas || estado.despesas.length === 0) {
    return <p className="text-sm text-slate-500">Sem registos nesta categoria.</p>;
  }

  return (
    <div className="space-y-2">
      {estado.despesas.map((despesa) => {
        const gastoPor = nomeMembro(membros, despesa.usuarioId);
        return (
          <div key={despesa._id} className="rounded-md border border-slate-100 bg-slate-50 p-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{despesa.descricao || "Sem descrição"}</span>
              <span className="font-semibold">{despesa.valor.toFixed(2)} €</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {new Date(despesa.data).toLocaleDateString("pt-PT")} · {gastoPor}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Secao({
  titulo,
  linhas,
  membros,
  expandidas,
  detalhes,
  aoAlternar,
}: {
  titulo: string;
  linhas: LinhaCategoriaDashboard[];
  membros: MembroGrupo[];
  expandidas: Set<string>;
  detalhes: Record<string, DetalheState>;
  aoAlternar: (categoria: string) => void;
}) {
  if (linhas.length === 0) return null;

  return (
    <>
      <tr className="bg-slate-50">
        <td colSpan={membros.length + 4} className="py-2 px-2 text-xs font-semibold uppercase text-slate-500">
          {titulo}
        </td>
      </tr>
      {linhas.map((linha) => {
        const aberto = expandidas.has(linha.categoria);
        return (
          <Fragment key={linha.categoria}>
            <tr
              onClick={() => aoAlternar(linha.categoria)}
              className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
              role="button"
              tabIndex={0}
              aria-expanded={aberto}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  aoAlternar(linha.categoria);
                }
              }}
            >
              <td className="py-2 px-2">
                <span className="mr-1 inline-block w-3 text-slate-400">{aberto ? "▾" : "▸"}</span>
                {linha.categoria}
              </td>
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
            {aberto && (
              <tr className="bg-slate-50/60">
                <td colSpan={membros.length + 4} className="p-0">
                  <div className="px-4 py-3">
                    <DetalhesCategoria
                      estado={detalhes[linha.categoria] ?? { aCarregar: true, erro: null, despesas: null }}
                      membros={membros}
                    />
                  </div>
                </td>
              </tr>
            )}
          </Fragment>
        );
      })}
    </>
  );
}

function CartaoLinha({
  linha,
  membros,
  aberto,
  estado,
  aoAlternar,
}: {
  linha: LinhaCategoriaDashboard;
  membros: MembroGrupo[];
  aberto: boolean;
  estado: DetalheState | undefined;
  aoAlternar: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 text-sm">
      <button
        type="button"
        onClick={aoAlternar}
        aria-expanded={aberto}
        className="mb-2 flex min-h-11 w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-base font-semibold text-slate-800">
          <span className="text-slate-400">{aberto ? "▾" : "▸"}</span>
          {linha.categoria}
        </span>
        <span className="font-medium">{linha.total.toFixed(2)} €</span>
      </button>
      {membros.map((membro) => (
        <div key={membro._id} className="flex justify-between py-1">
          <span className="text-slate-500">{membro.nome}</span>
          <span>{(linha.porUsuario[membro._id] ?? 0).toFixed(2)} €</span>
        </div>
      ))}
      <div className="flex justify-between py-1">
        <span className="text-slate-500">Previsto</span>
        <span>{linha.previsto.toFixed(2)} €</span>
      </div>
      <div className="flex justify-between py-1">
        <span className="text-slate-500">Diferença</span>
        <span className={linha.diferenca < 0 ? "text-red-600" : "text-emerald-600"}>
          {linha.diferenca.toFixed(2)} €
        </span>
      </div>
      {aberto && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <DetalhesCategoriaCartoes
            estado={estado ?? { aCarregar: true, erro: null, despesas: null }}
            membros={membros}
          />
        </div>
      )}
    </div>
  );
}

function SecaoCartoes({
  titulo,
  linhas,
  membros,
  expandidas,
  detalhes,
  aoAlternar,
}: {
  titulo: string;
  linhas: LinhaCategoriaDashboard[];
  membros: MembroGrupo[];
  expandidas: Set<string>;
  detalhes: Record<string, DetalheState>;
  aoAlternar: (categoria: string) => void;
}) {
  if (linhas.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{titulo}</p>
      {linhas.map((linha) => (
        <CartaoLinha
          key={linha.categoria}
          linha={linha}
          membros={membros}
          aberto={expandidas.has(linha.categoria)}
          estado={detalhes[linha.categoria]}
          aoAlternar={() => aoAlternar(linha.categoria)}
        />
      ))}
    </div>
  );
}

export function TabelaDespesas({
  dashboard,
  membros,
  grupoId,
  mes,
  ano,
}: {
  dashboard: DashboardResumo;
  membros: MembroGrupo[];
  grupoId: string;
  mes: number;
  ano: number;
}) {
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());
  const [detalhes, setDetalhes] = useState<Record<string, DetalheState>>({});

  useEffect(() => {
    setExpandidas(new Set());
    setDetalhes({});
  }, [grupoId, mes, ano]);

  function alternar(categoria: string) {
    setExpandidas((atual) => {
      const nova = new Set(atual);
      if (nova.has(categoria)) {
        nova.delete(categoria);
      } else {
        nova.add(categoria);
      }
      return nova;
    });

    if (detalhes[categoria]) return;

    setDetalhes((atual) => ({ ...atual, [categoria]: { aCarregar: true, erro: null, despesas: null } }));
    despesasService
      .listarDespesasPorCategoria(grupoId, { categoria, mes, ano })
      .then((despesas) =>
        setDetalhes((atual) => ({ ...atual, [categoria]: { aCarregar: false, erro: null, despesas } }))
      )
      .catch((err) =>
        setDetalhes((atual) => ({
          ...atual,
          [categoria]: {
            aCarregar: false,
            erro: err instanceof Error ? err.message : "Erro ao carregar registos",
            despesas: null,
          },
        }))
      );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white md:block">
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
            <Secao
              titulo="Despesas fixas"
              linhas={dashboard.fixas}
              membros={membros}
              expandidas={expandidas}
              detalhes={detalhes}
              aoAlternar={alternar}
            />
            <Secao
              titulo="Despesas variáveis"
              linhas={dashboard.variaveis}
              membros={membros}
              expandidas={expandidas}
              detalhes={detalhes}
              aoAlternar={alternar}
            />
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

      <div className="space-y-4 md:hidden">
        <SecaoCartoes
          titulo="Despesas fixas"
          linhas={dashboard.fixas}
          membros={membros}
          expandidas={expandidas}
          detalhes={detalhes}
          aoAlternar={alternar}
        />
        <SecaoCartoes
          titulo="Despesas variáveis"
          linhas={dashboard.variaveis}
          membros={membros}
          expandidas={expandidas}
          detalhes={detalhes}
          aoAlternar={alternar}
        />

        <div className="rounded-lg border border-slate-300 bg-white p-4 text-sm">
          <div className="mb-2 flex items-center justify-between font-semibold">
            <span>Total geral</span>
            <span>{dashboard.resumo.totalGeral.toFixed(2)} €</span>
          </div>
          {membros.map((membro) => (
            <div key={membro._id} className="flex justify-between py-1 text-slate-600">
              <span>{membro.nome}</span>
              <span>{(dashboard.resumo.porPessoa[membro._id] ?? 0).toFixed(2)} €</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
