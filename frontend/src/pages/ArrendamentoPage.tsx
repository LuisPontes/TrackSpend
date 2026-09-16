import { useState } from "react";
import { useGrupo } from "../hooks/useGrupo";
import { useFetch } from "../hooks/useFetch";
import * as arrendamentoService from "../services/arrendamentoService";
import { Filtros } from "../components/Dashboard/Filtros";
import { FormMovimento } from "../components/Arrendamento/FormMovimento";
import { ListaMovimentos } from "../components/Arrendamento/ListaMovimentos";
import { ResumoArrendamento } from "../components/Arrendamento/ResumoArrendamento";

export function ArrendamentoPage() {
  const { grupoId, grupo } = useGrupo();
  const agora = new Date();
  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());

  const { dados: anosDisponiveis } = useFetch(
    () => arrendamentoService.listarAnosDisponiveis(grupoId),
    [grupoId]
  );

  const { dados: movimentos, carregando, recarregar } = useFetch(
    () => arrendamentoService.listarMovimentos(grupoId, { mes, ano }),
    [grupoId, mes, ano]
  );

  async function handleRemover(id: string) {
    await arrendamentoService.removerMovimento(grupoId, id);
    recarregar();
  }

  if (!grupo) return <p className="text-sm text-slate-500">A carregar...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Arrendamento</h1>
        <Filtros mes={mes} ano={ano} anosDisponiveis={anosDisponiveis ?? [ano]} aoMudarMes={setMes} aoMudarAno={setAno} />
      </div>

      {movimentos && <ResumoArrendamento movimentos={movimentos} />}

      <FormMovimento grupoId={grupoId} aoCriar={recarregar} />

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {carregando || !movimentos ? (
          <p className="text-sm text-slate-500">A carregar...</p>
        ) : (
          <ListaMovimentos movimentos={movimentos} aoRemover={handleRemover} />
        )}
      </div>
    </div>
  );
}
