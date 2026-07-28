import { api } from "./api";
import type { Orcamento, OrcamentoCategoria, Divisao } from "../types";

export async function obterOrcamento(grupoId: string, mes: number, ano: number): Promise<Orcamento | null> {
  const { data } = await api.get<{ orcamento: Orcamento | null }>(`/grupos/${grupoId}/orcamentos/${mes}/${ano}`);
  return data.orcamento;
}

export async function criarOrcamento(
  grupoId: string,
  mes: number,
  ano: number,
  categorias: OrcamentoCategoria[],
  divisao: Divisao
): Promise<Orcamento> {
  const { data } = await api.post<{ orcamento: Orcamento }>(`/grupos/${grupoId}/orcamentos`, {
    mes,
    ano,
    categorias,
    divisao,
  });
  return data.orcamento;
}

export async function editarOrcamento(
  grupoId: string,
  orcamentoId: string,
  categorias?: OrcamentoCategoria[],
  divisao?: Divisao
): Promise<Orcamento> {
  const { data } = await api.put<{ orcamento: Orcamento }>(`/grupos/${grupoId}/orcamentos/${orcamentoId}`, {
    categorias,
    divisao,
  });
  return data.orcamento;
}
