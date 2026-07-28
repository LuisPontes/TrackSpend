import { useState } from "react";
import { useGrupo } from "../hooks/useGrupo";
import { useFetch } from "../hooks/useFetch";
import { useAnosDisponiveis } from "../hooks/useAnosDisponiveis";
import * as despesasService from "../services/despesasService";
import { Filtros } from "../components/Dashboard/Filtros";
import { TabelaDespesas } from "../components/Dashboard/TabelaDespesas";
import { AcertoContas } from "../components/Dashboard/AcertoContas";

export function DashboardPage() {
  const { grupoId, grupo } = useGrupo();
  const agora = new Date();
  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());
  const anosDisponiveis = useAnosDisponiveis(grupoId);

  const { dados: dashboard, carregando } = useFetch(
    () => despesasService.obterDashboard(grupoId, mes, ano),
    [grupoId, mes, ano]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Filtros mes={mes} ano={ano} anosDisponiveis={anosDisponiveis} aoMudarMes={setMes} aoMudarAno={setAno} />
      </div>

      {carregando || !dashboard || !grupo ? (
        <p className="text-sm text-slate-500">A carregar...</p>
      ) : (
        <>
          <TabelaDespesas dashboard={dashboard} membros={grupo.membros} />
          <AcertoContas dashboard={dashboard} membros={grupo.membros} />
        </>
      )}
    </div>
  );
}
