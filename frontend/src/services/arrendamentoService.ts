import { api } from "./api";
import type { MovimentoArrendamento, TipoMovimentoArrendamento } from "../types";

export interface FiltrosArrendamento {
  mes?: number;
  ano?: number;
}

export interface NovoMovimentoArrendamento {
  tipo: TipoMovimentoArrendamento;
  categoria: string;
  valor: number;
  data: string;
  descricao?: string;
}

export async function listarMovimentos(
  grupoId: string,
  filtros: FiltrosArrendamento = {}
): Promise<MovimentoArrendamento[]> {
  const { data } = await api.get<{ movimentos: MovimentoArrendamento[] }>(`/grupos/${grupoId}/arrendamento`, {
    params: filtros,
  });
  return data.movimentos;
}

export async function criarMovimento(
  grupoId: string,
  movimento: NovoMovimentoArrendamento
): Promise<MovimentoArrendamento> {
  const { data } = await api.post<{ movimento: MovimentoArrendamento }>(`/grupos/${grupoId}/arrendamento`, movimento);
  return data.movimento;
}

export async function removerMovimento(grupoId: string, movimentoId: string): Promise<void> {
  await api.delete(`/grupos/${grupoId}/arrendamento/${movimentoId}`);
}

export async function editarMovimento(
  grupoId: string,
  movimentoId: string,
  dados: Partial<NovoMovimentoArrendamento>
): Promise<MovimentoArrendamento> {
  const { data } = await api.put<{ movimento: MovimentoArrendamento }>(
    `/grupos/${grupoId}/arrendamento/${movimentoId}`,
    dados
  );
  return data.movimento;
}

export async function listarAnosDisponiveis(grupoId: string): Promise<number[]> {
  const { data } = await api.get<{ anos: number[] }>(`/grupos/${grupoId}/arrendamento/anos`);
  const anoAtual = new Date().getFullYear();
  const anos = new Set(data.anos);
  anos.add(anoAtual);
  return Array.from(anos).sort((a, b) => a - b);
}
