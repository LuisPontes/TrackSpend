import { useFetch } from "./useFetch";
import * as despesasService from "../services/despesasService";

export function useAnosDisponiveis(grupoId: string) {
  const { dados: anos } = useFetch(() => despesasService.listarAnosDisponiveis(grupoId), [grupoId]);
  return anos ?? [new Date().getFullYear()];
}
