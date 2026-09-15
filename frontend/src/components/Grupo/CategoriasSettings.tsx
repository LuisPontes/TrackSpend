import { type FormEvent, useState } from "react";
import type { Categoria } from "../../types";
import * as categoriasService from "../../services/categoriasService";

interface Props {
  grupoId: string;
  categorias: Categoria[];
  aoAtualizar: () => void;
}

export function CategoriasSettings({ grupoId, categorias, aoAtualizar }: Props) {
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function iniciarEdicao(categoria: Categoria) {
    setEditandoId(categoria._id);
    setNovoNome(categoria.nome);
    setErro(null);
  }

  function cancelar() {
    setEditandoId(null);
    setErro(null);
  }

  async function handleGuardar(event: FormEvent, categoriaId: string) {
    event.preventDefault();
    if (!novoNome.trim()) return;
    setAGuardar(true);
    setErro(null);
    try {
      await categoriasService.editarCategoria(grupoId, categoriaId, { nome: novoNome.trim() });
      setEditandoId(null);
      aoAtualizar();
    } catch (err: unknown) {
      const mensagem =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setErro(mensagem ?? "Não foi possível renomear a categoria");
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Categorias</h3>
      <ul className="divide-y divide-slate-100">
        {categorias.map((categoria) => (
          <li key={categoria._id} className="flex min-h-11 items-center justify-between gap-2 py-2 text-sm">
            {editandoId === categoria._id ? (
              <form onSubmit={(e) => handleGuardar(e, categoria._id)} className="flex flex-1 items-center gap-2">
                <input
                  autoFocus
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="min-h-9 flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
                />
                <button
                  type="submit"
                  disabled={aGuardar}
                  className="min-h-9 rounded bg-slate-900 px-3 text-xs font-medium text-white disabled:opacity-50"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={cancelar}
                  className="min-h-9 rounded border border-slate-300 px-3 text-xs hover:bg-slate-100"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <>
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: categoria.cor }} />
                  {categoria.nome}
                  <span className="text-xs text-slate-400">{categoria.tipo === "FIXA" ? "Fixa" : "Variável"}</span>
                </span>
                <button
                  onClick={() => iniciarEdicao(categoria)}
                  className="text-xs text-slate-500 underline hover:text-slate-700"
                >
                  renomear
                </button>
              </>
            )}
          </li>
        ))}
        {categorias.length === 0 && <li className="py-2 text-sm text-slate-500">Ainda não há categorias.</li>}
      </ul>
      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
    </div>
  );
}
