import { useState } from "react";
import { useGrupo } from "../hooks/useGrupo";
import { useFetch } from "../hooks/useFetch";
import * as categoriasService from "../services/categoriasService";
import * as backupService from "../services/backupService";
import { GrupoSettings } from "../components/Grupo/GrupoSettings";
import { OrcamentoMes } from "../components/Grupo/OrcamentoMes";

export function SettingsPage() {
  const { grupoId, grupo, recarregar } = useGrupo();
  const agora = new Date();
  const [mes] = useState(agora.getMonth() + 1);
  const [ano] = useState(agora.getFullYear());
  const [aFazerBackup, setAFazerBackup] = useState(false);
  const [mensagemBackup, setMensagemBackup] = useState<string | null>(null);
  const [erroBackup, setErroBackup] = useState<string | null>(null);

  const { dados: categorias } = useFetch(() => categoriasService.listarCategorias(grupoId), [grupoId]);

  async function handleBackup() {
    setErroBackup(null);
    setMensagemBackup(null);
    setAFazerBackup(true);
    try {
      const { mensagem } = await backupService.executarBackup();
      setMensagemBackup(mensagem);
    } catch (err: unknown) {
      const mensagem =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setErroBackup(mensagem ?? "Não foi possível concluir o backup");
    } finally {
      setAFazerBackup(false);
    }
  }

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

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-1 text-sm font-semibold text-slate-700">Backup da base de dados</h3>
        <p className="mb-3 text-sm text-slate-500">
          Cria uma cópia de segurança da base de dados de produção (todos os grupos).
        </p>
        <button
          onClick={handleBackup}
          disabled={aFazerBackup}
          className="min-h-12 rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {aFazerBackup ? "A criar backup..." : "Criar backup agora"}
        </button>
        {mensagemBackup && <p className="mt-2 text-sm text-emerald-600">{mensagemBackup}</p>}
        {erroBackup && <p className="mt-2 text-sm text-red-600">{erroBackup}</p>}
      </div>
    </div>
  );
}
