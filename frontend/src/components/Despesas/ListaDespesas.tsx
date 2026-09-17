import { type FormEvent, useEffect, useState } from "react";
import type { Categoria, Despesa, MembroGrupo, TipoDespesa } from "../../types";
import * as categoriasService from "../../services/categoriasService";
import * as despesasService from "../../services/despesasService";

interface Props {
  grupoId: string;
  despesas: Despesa[];
  membros: MembroGrupo[];
  permitirDespesaEmNomeOutro: boolean;
  aoRemover: (id: string) => void;
  aoAtualizar: () => void;
}

function nomeDe(membros: MembroGrupo[], id: string): string {
  return membros.find((m) => m._id === id)?.nome ?? id.slice(-4);
}

interface FormularioEdicaoProps {
  despesa: Despesa;
  categorias: Categoria[];
  membros: MembroGrupo[];
  permitirDespesaEmNomeOutro: boolean;
  aoGuardar: (dados: {
    categoria: string;
    tipo: TipoDespesa;
    valor: number;
    data: string;
    descricao?: string;
    usuarioId?: string;
  }) => Promise<void>;
  aoCancelar: () => void;
}

function FormularioEdicao({
  despesa,
  categorias,
  membros,
  permitirDespesaEmNomeOutro,
  aoGuardar,
  aoCancelar,
}: FormularioEdicaoProps) {
  const [categoria, setCategoria] = useState(despesa.categoria);
  const [tipo, setTipo] = useState<TipoDespesa>(despesa.tipo);
  const [valor, setValor] = useState(String(despesa.valor));
  const [data, setData] = useState(despesa.data.slice(0, 10));
  const [descricao, setDescricao] = useState(despesa.descricao ?? "");
  const [quemGastou, setQuemGastou] = useState(despesa.usuarioId);
  const [aGuardar, setAGuardar] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setAGuardar(true);
    try {
      await aoGuardar({
        categoria,
        tipo,
        valor: Number(valor),
        data,
        descricao: descricao || undefined,
        usuarioId: permitirDespesaEmNomeOutro ? quemGastou : undefined,
      });
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2 rounded-lg border border-slate-300 bg-slate-50 p-3 md:grid-cols-6">
      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        required
        className="col-span-2 min-h-10 rounded border border-slate-300 px-2 py-1 text-sm md:col-span-2"
      >
        {categorias.map((c) => (
          <option key={c._id} value={c.nome}>
            {c.nome}
          </option>
        ))}
      </select>

      {permitirDespesaEmNomeOutro && (
        <select
          value={quemGastou}
          onChange={(e) => setQuemGastou(e.target.value)}
          className="col-span-2 min-h-10 rounded border border-slate-300 px-2 py-1 text-sm md:col-span-2"
        >
          {membros.map((m) => (
            <option key={m._id} value={m._id}>
              Quem gastou: {m.nome}
            </option>
          ))}
        </select>
      )}

      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value as TipoDespesa)}
        className="min-h-10 rounded border border-slate-300 px-2 py-1 text-sm"
      >
        <option value="FIXA">Fixa</option>
        <option value="VARIAVEL">Variável</option>
      </select>

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
        placeholder="Descrição (opcional)"
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

export function ListaDespesas({ grupoId, despesas, membros, permitirDespesaEmNomeOutro, aoRemover, aoAtualizar }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    categoriasService.listarCategorias(grupoId).then(setCategorias);
  }, [grupoId]);

  async function handleGuardarEdicao(
    despesaId: string,
    dados: { categoria: string; tipo: TipoDespesa; valor: number; data: string; descricao?: string; usuarioId?: string }
  ) {
    await despesasService.editarDespesa(grupoId, despesaId, dados);
    setEditandoId(null);
    aoAtualizar();
  }

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
            <th>Quem gastou</th>
            <th>Descrição</th>
            <th className="text-right">Valor</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {despesas.map((despesa) =>
            editandoId === despesa._id ? (
              <tr key={despesa._id}>
                <td colSpan={7} className="py-2">
                  <FormularioEdicao
                    despesa={despesa}
                    categorias={categorias}
                    membros={membros}
                    permitirDespesaEmNomeOutro={permitirDespesaEmNomeOutro}
                    aoGuardar={(dados) => handleGuardarEdicao(despesa._id, dados)}
                    aoCancelar={() => setEditandoId(null)}
                  />
                </td>
              </tr>
            ) : (
              <tr key={despesa._id} className="border-b border-slate-100">
                <td className="py-2">{new Date(despesa.data).toLocaleDateString("pt-PT")}</td>
                <td>{despesa.categoria}</td>
                <td>{despesa.tipo === "FIXA" ? "Fixa" : "Variável"}</td>
                <td>
                  <span className="font-medium">{nomeDe(membros, despesa.usuarioId)}</span>
                  {despesa.adicionadoPor && despesa.adicionadoPor !== despesa.usuarioId && (
                    <span className="text-xs text-slate-500"> (registado por {nomeDe(membros, despesa.adicionadoPor)})</span>
                  )}
                </td>
                <td className="text-slate-500">{despesa.descricao}</td>
                <td className="text-right font-medium">{despesa.valor.toFixed(2)} €</td>
                <td className="whitespace-nowrap text-right">
                  <button onClick={() => setEditandoId(despesa._id)} className="mr-3 text-xs text-slate-600 hover:underline">
                    editar
                  </button>
                  <button onClick={() => aoRemover(despesa._id)} className="text-xs text-red-600 hover:underline">
                    remover
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <div className="space-y-3 md:hidden">
        {despesas.map((despesa) =>
          editandoId === despesa._id ? (
            <FormularioEdicao
              key={despesa._id}
              despesa={despesa}
              categorias={categorias}
              membros={membros}
              permitirDespesaEmNomeOutro={permitirDespesaEmNomeOutro}
              aoGuardar={(dados) => handleGuardarEdicao(despesa._id, dados)}
              aoCancelar={() => setEditandoId(null)}
            />
          ) : (
            <div key={despesa._id} className="rounded-lg border border-slate-200 p-4 text-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-base font-semibold text-slate-800">{despesa.valor.toFixed(2)} €</span>
                <div className="flex gap-3">
                  <button onClick={() => setEditandoId(despesa._id)} className="min-h-11 px-2 text-sm text-slate-600">
                    editar
                  </button>
                  <button onClick={() => aoRemover(despesa._id)} className="min-h-11 px-2 text-sm text-red-600">
                    remover
                  </button>
                </div>
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
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Quem gastou</span>
                <span className="text-right">
                  {nomeDe(membros, despesa.usuarioId)}
                  {despesa.adicionadoPor && despesa.adicionadoPor !== despesa.usuarioId && (
                    <span className="block text-xs text-slate-500">
                      registado por {nomeDe(membros, despesa.adicionadoPor)}
                    </span>
                  )}
                </span>
              </div>
              {despesa.descricao && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Descrição</span>
                  <span className="text-right">{despesa.descricao}</span>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </>
  );
}
