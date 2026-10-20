import { useState } from "react";
import { useGrupo } from "../hooks/useGrupo";
import { useFetch } from "../hooks/useFetch";
import * as arrendamentoService from "../services/arrendamentoService";
import { Filtros } from "../components/Dashboard/Filtros";
import { ResumoArrendamento } from "../components/Arrendamento/ResumoArrendamento";
import { GraficoCategoriaArrendamento } from "../components/Arrendamento/GraficoCategoriaArrendamento";
import { GraficoAnualArrendamento } from "../components/Arrendamento/GraficoAnualArrendamento";
import { GraficoComparacaoArrendamento } from "../components/Arrendamento/GraficoComparacaoArrendamento";

export function ArrendamentoGraficosPage() {
  const { grupoId, grupo } = useGrupo();
  const agora = new Date();
  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());

  const { dados: anosDisponiveis } = useFetch(() => arrendamentoService.listarAnosDisponiveis(grupoId), [grupoId]);
  const { dados: categorias } = useFetch(() => arrendamentoService.listarCategorias(grupoId), [grupoId]);
  const { dados: movimentos, carregando } = useFetch(
    () => arrendamentoService.listarMovimentos(grupoId, { mes, ano }),
    [grupoId, mes, ano]
  );

  if (!grupo || !anosDisponiveis || !categorias) {
    return <p className="text-sm text-slate-500">A carregar...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Gráficos</h1>
        <Filtros mes={mes} ano={ano} anosDisponiveis={anosDisponiveis} aoMudarMes={setMes} aoMudarAno={setAno} />
      </div>

      {carregando || !movimentos ? (
        <p className="text-sm text-slate-500">A carregar...</p>
      ) : (
        <>
          <ResumoArrendamento movimentos={movimentos} />
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Por categoria</h2>
            <GraficoCategoriaArrendamento movimentos={movimentos} />
          </div>
        </>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Evolução anual ({ano})</h2>
        <GraficoAnualArrendamento grupoId={grupoId} ano={ano} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Comparar anos</h2>
        <GraficoComparacaoArrendamento grupoId={grupoId} anosDisponiveis={anosDisponiveis} categorias={categorias} />
      </div>
    </div>
  );
}
