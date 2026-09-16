import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Grupo, TipoGrupo } from "../types";
import * as gruposService from "../services/gruposService";

const TIPOS: { valor: TipoGrupo; label: string }[] = [
  { valor: "PARTILHADO", label: "Despesas partilhadas" },
  { valor: "EMPRESTIMO", label: "Empréstimo" },
  { valor: "ARRENDAMENTO", label: "Arrendamento" },
];

function labelTipo(tipo: TipoGrupo): string {
  return TIPOS.find((t) => t.valor === tipo)?.label ?? tipo;
}

function rotaGrupo(grupo: Grupo): string {
  if (grupo.tipo === "EMPRESTIMO") return `/grupos/${grupo._id}/emprestimos`;
  if (grupo.tipo === "ARRENDAMENTO") return `/grupos/${grupo._id}/arrendamento`;
  return `/grupos/${grupo._id}/dashboard`;
}

export function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoGrupo>("PARTILHADO");
  const [carregando, setCarregando] = useState(true);

  function carregar() {
    setCarregando(true);
    gruposService.listarGrupos().then((g) => {
      setGrupos(g);
      setCarregando(false);
    });
  }

  useEffect(carregar, []);

  async function handleCriar(event: FormEvent) {
    event.preventDefault();
    if (!nome.trim()) return;
    await gruposService.criarGrupo(nome.trim(), tipo);
    setNome("");
    setTipo("PARTILHADO");
    carregar();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold">Os teus grupos</h1>

      {carregando ? (
        <p className="text-sm text-slate-500">A carregar...</p>
      ) : (
        <div className="mb-6 space-y-2">
          {grupos.map((grupo) => (
            <Link
              key={grupo._id}
              to={rotaGrupo(grupo)}
              className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
            >
              <span className="font-medium">{grupo.nome}</span>
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {labelTipo(grupo.tipo)}
              </span>
              <span className="ml-2 text-sm text-slate-500">{grupo.membros.length} membro(s)</span>
            </Link>
          ))}
          {grupos.length === 0 && <p className="text-sm text-slate-500">Ainda não tens grupos.</p>}
        </div>
      )}

      <form onSubmit={handleCriar} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <input
          placeholder="Nome do grupo (ex: Casa)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="min-h-11 w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoGrupo)}
          className="min-h-11 w-full rounded border border-slate-300 px-3 py-2 text-sm"
        >
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.label}
            </option>
          ))}
        </select>
        <button type="submit" className="min-h-11 w-full rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Criar grupo
        </button>
      </form>
    </div>
  );
}
