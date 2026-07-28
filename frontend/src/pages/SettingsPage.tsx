import { useState } from "react";
import { useGrupo } from "../hooks/useGrupo";
import { useFetch } from "../hooks/useFetch";
import * as categoriasService from "../services/categoriasService";
import { GrupoSettings } from "../components/Grupo/GrupoSettings";
import { OrcamentoMes } from "../components/Grupo/OrcamentoMes";

export function SettingsPage() {
  const { grupoId, grupo, recarregar } = useGrupo();
  const agora = new Date();
  const [mes] = useState(agora.getMonth() + 1);
  const [ano] = useState(agora.getFullYear());

  const { dados: categorias } = useFetch(() => categoriasService.listarCategorias(grupoId), [grupoId]);

  if (!grupo) return <p className="text-sm text-slate-500">A carregar...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Definições</h1>
      <GrupoSettings grupo={grupo} aoAtualizar={recarregar} />
      <OrcamentoMes
        grupoId={grupoId}
        mes={mes}
        ano={ano}
        categorias={categorias ?? []}
        membros={grupo.membros}
      />
    </div>
  );
}
