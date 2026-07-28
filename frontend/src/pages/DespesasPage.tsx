import { useState } from "react";
import { useGrupo } from "../hooks/useGrupo";
import { useFetch } from "../hooks/useFetch";
import { useAnosDisponiveis } from "../hooks/useAnosDisponiveis";
import * as despesasService from "../services/despesasService";
import { FormDespesa } from "../components/Despesas/FormDespesa";
import { ListaDespesas } from "../components/Despesas/ListaDespesas";
import { Filtros } from "../components/Dashboard/Filtros";

export function DespesasPage() {
  const { grupoId } = useGrupo();
  const agora = new Date();
  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());
  const anosDisponiveis = useAnosDisponiveis(grupoId);

  const { dados: despesas, carregando, recarregar } = useFetch(
    () => despesasService.listarDespesas(grupoId, { mes, ano }),
    [grupoId, mes, ano]
  );

  async function handleRemover(id: string) {
    await despesasService.removerDespesa(grupoId, id);
    recarregar();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Despesas</h1>
        <Filtros mes={mes} ano={ano} anosDisponiveis={anosDisponiveis} aoMudarMes={setMes} aoMudarAno={setAno} />
      </div>

      <FormDespesa grupoId={grupoId} aoCriar={recarregar} />

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {carregando || !despesas ? (
          <p className="text-sm text-slate-500">A carregar...</p>
        ) : (
          <ListaDespesas despesas={despesas} aoRemover={handleRemover} />
        )}
      </div>
    </div>
  );
}
