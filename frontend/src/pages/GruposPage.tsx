import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Grupo } from "../types";
import * as gruposService from "../services/gruposService";

export function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [nome, setNome] = useState("");
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
    await gruposService.criarGrupo(nome.trim());
    setNome("");
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
              to={`/grupos/${grupo._id}/dashboard`}
              className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
            >
              <span className="font-medium">{grupo.nome}</span>
              <span className="ml-2 text-sm text-slate-500">{grupo.membros.length} membro(s)</span>
            </Link>
          ))}
          {grupos.length === 0 && <p className="text-sm text-slate-500">Ainda não tens grupos.</p>}
        </div>
      )}

      <form onSubmit={handleCriar} className="flex gap-2">
        <input
          placeholder="Nome do grupo (ex: Casa)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Criar grupo
        </button>
      </form>
    </div>
  );
}
