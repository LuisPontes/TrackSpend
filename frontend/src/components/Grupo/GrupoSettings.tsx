import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Grupo } from "../../types";
import * as gruposService from "../../services/gruposService";
import { useAuth } from "../../hooks/useAuth";

export function GrupoSettings({ grupo, aoAtualizar }: { grupo: Grupo; aoAtualizar: () => void }) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [aEliminar, setAEliminar] = useState(false);
  const [erroEliminar, setErroEliminar] = useState<string | null>(null);
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState(grupo.nome);
  const [aGuardarNome, setAGuardarNome] = useState(false);
  const [erroNome, setErroNome] = useState<string | null>(null);

  const souCriador = grupo.criadorId === usuario?.id;

  async function handleRenomear(event: FormEvent) {
    event.preventDefault();
    if (!novoNome.trim() || novoNome.trim() === grupo.nome) {
      setEditandoNome(false);
      return;
    }
    setErroNome(null);
    setAGuardarNome(true);
    try {
      await gruposService.editarGrupo(grupo._id, { nome: novoNome.trim() });
      setEditandoNome(false);
      aoAtualizar();
    } catch (err: unknown) {
      const mensagem =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setErroNome(mensagem ?? "Não foi possível renomear o grupo");
    } finally {
      setAGuardarNome(false);
    }
  }

  async function handleAdicionarMembro(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await gruposService.adicionarMembro(grupo._id, email);
      setEmail("");
      aoAtualizar();
    } catch (err: unknown) {
      const mensagem =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setErro(mensagem ?? "Não foi possível adicionar o membro");
    } finally {
      setEnviando(false);
    }
  }

  async function handleEliminar() {
    const confirmado = window.confirm(
      `Eliminar o grupo "${grupo.nome}"? Isto apaga TODAS as despesas, categorias e orçamentos deste grupo, para sempre. Não há como desfazer.`
    );
    if (!confirmado) return;

    setErroEliminar(null);
    setAEliminar(true);
    try {
      await gruposService.eliminarGrupo(grupo._id);
      navigate("/grupos", { replace: true });
    } catch (err: unknown) {
      const mensagem =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setErroEliminar(mensagem ?? "Não foi possível eliminar o grupo");
      setAEliminar(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        {editandoNome ? (
          <form onSubmit={handleRenomear} className="mb-4 flex items-center gap-2">
            <input
              autoFocus
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className="rounded border border-slate-300 px-2 py-1 text-lg font-semibold"
            />
            <button
              type="submit"
              disabled={aGuardarNome}
              className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                setNovoNome(grupo.nome);
                setEditandoNome(false);
                setErroNome(null);
              }}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
            >
              Cancelar
            </button>
          </form>
        ) : (
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-semibold">{grupo.nome}</h2>
            <button
              onClick={() => setEditandoNome(true)}
              className="text-xs text-slate-500 underline hover:text-slate-700"
            >
              renomear
            </button>
          </div>
        )}
        {erroNome && <p className="mb-2 text-sm text-red-600">{erroNome}</p>}
        <dl className="grid grid-cols-2 gap-2 text-sm text-slate-600">
          <dt>Moeda</dt>
          <dd>{grupo.moeda}</dd>
          <dt>Membros</dt>
          <dd>{grupo.membros.length}</dd>
        </dl>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Adicionar membro</h3>
        <form onSubmit={handleAdicionarMembro} className="flex gap-2">
          <input
            type="email"
            required
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={enviando}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Adicionar
          </button>
        </form>
        {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
      </div>

      {souCriador && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="mb-1 text-sm font-semibold text-red-800">Zona de perigo</h3>
          <p className="mb-3 text-sm text-red-700">
            Eliminar este grupo apaga permanentemente todas as despesas, categorias e orçamentos associados.
          </p>
          <button
            onClick={handleEliminar}
            disabled={aEliminar}
            className="rounded border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            {aEliminar ? "A eliminar..." : "Eliminar grupo"}
          </button>
          {erroEliminar && <p className="mt-2 text-sm text-red-600">{erroEliminar}</p>}
        </div>
      )}
    </div>
  );
}
