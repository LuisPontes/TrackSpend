import { useState } from "react";
import { useGrupo } from "../hooks/useGrupo";
import { useFetch } from "../hooks/useFetch";
import { useAnosDisponiveis } from "../hooks/useAnosDisponiveis";
import * as despesasService from "../services/despesasService";
import { Filtros } from "../components/Dashboard/Filtros";
import { GraficoCategoria } from "../components/Graficos/GraficoCategoria";
import { GraficoPessoa } from "../components/Graficos/GraficoPessoa";
import { GraficoAnual } from "../components/Graficos/GraficoAnual";
import { GraficoComparacaoAnos } from "../components/Graficos/GraficoComparacaoAnos";

export function GraficosPage() {
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
        <h1 className="text-xl font-semibold">Gráficos</h1>
        <Filtros mes={mes} ano={ano} anosDisponiveis={anosDisponiveis} aoMudarMes={setMes} aoMudarAno={setAno} />
      </div>

      {carregando || !dashboard || !grupo ? (
        <p className="text-sm text-slate-500">A carregar...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Por categoria</h2>
            <GraficoCategoria dashboard={dashboard} />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Por pessoa</h2>
            <GraficoPessoa dashboard={dashboard} membros={grupo.membros} />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 md:col-span-2">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Evolução anual ({ano})</h2>
            <GraficoAnual grupoId={grupoId} ano={ano} />
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Comparar anos</h2>
        <GraficoComparacaoAnos grupoId={grupoId} anosDisponiveis={anosDisponiveis} />
      </div>
    </div>
  );
}
