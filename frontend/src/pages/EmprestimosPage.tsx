import { useGrupo } from "../hooks/useGrupo";
import { useFetch } from "../hooks/useFetch";
import * as emprestimosService from "../services/emprestimosService";
import { FormEmprestimo } from "../components/Emprestimos/FormEmprestimo";
import { ListaEmprestimos } from "../components/Emprestimos/ListaEmprestimos";

export function EmprestimosPage() {
  const { grupoId, grupo } = useGrupo();
  const { dados: emprestimos, carregando, recarregar } = useFetch(
    () => emprestimosService.listarEmprestimos(grupoId),
    [grupoId]
  );

  if (!grupo) return <p className="text-sm text-slate-500">A carregar...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Empréstimos</h1>

      <FormEmprestimo grupoId={grupoId} membros={grupo.membros} aoCriar={recarregar} />

      {carregando || !emprestimos ? (
        <p className="text-sm text-slate-500">A carregar...</p>
      ) : (
        <ListaEmprestimos grupoId={grupoId} emprestimos={emprestimos} membros={grupo.membros} aoAtualizar={recarregar} />
      )}
    </div>
  );
}
