import { useParams } from "react-router-dom";
import { useFetch } from "./useFetch";
import * as gruposService from "../services/gruposService";

export function useGrupo() {
  const { grupoId } = useParams<{ grupoId: string }>();
  const { dados: grupo, carregando, erro, recarregar } = useFetch(
    () => gruposService.obterGrupo(grupoId as string),
    [grupoId]
  );

  return { grupoId: grupoId as string, grupo, carregando, erro, recarregar };
}
