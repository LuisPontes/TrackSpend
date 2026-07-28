import { api } from "./api";
import type { Despesa, TipoDespesa, DashboardResumo } from "../types";

export interface FiltrosDespesas {
  mes?: number;
  ano?: number;
  categoria?: string;
  tipo?: TipoDespesa;
}

export interface NovaDespesa {
  categoria: string;
  tipo: TipoDespesa;
  valor: number;
  data: string;
  descricao?: string;
}

export async function listarDespesas(grupoId: string, filtros: FiltrosDespesas = {}): Promise<Despesa[]> {
  const { data } = await api.get<{ despesas: Despesa[] }>(`/grupos/${grupoId}/despesas`, { params: filtros });
  return data.despesas;
}

export async function criarDespesa(grupoId: string, despesa: NovaDespesa): Promise<Despesa> {
  const { data } = await api.post<{ despesa: Despesa }>(`/grupos/${grupoId}/despesas`, despesa);
  return data.despesa;
}

export async function editarDespesa(
  grupoId: string,
  despesaId: string,
  despesa: Partial<NovaDespesa>
): Promise<Despesa> {
  const { data } = await api.put<{ despesa: Despesa }>(`/grupos/${grupoId}/despesas/${despesaId}`, despesa);
  return data.despesa;
}

export async function removerDespesa(grupoId: string, despesaId: string): Promise<void> {
  await api.delete(`/grupos/${grupoId}/despesas/${despesaId}`);
}

export async function obterDashboard(grupoId: string, mes: number, ano: number): Promise<DashboardResumo> {
  const { data } = await api.get<DashboardResumo>(`/grupos/${grupoId}/dashboard/${mes}/${ano}`);
  return data;
}

export async function listarAnosDisponiveis(grupoId: string): Promise<number[]> {
  const { data } = await api.get<{ anos: number[] }>(`/grupos/${grupoId}/despesas/anos`);
  const anoAtual = new Date().getFullYear();
  const anos = new Set(data.anos);
  anos.add(anoAtual);
  return Array.from(anos).sort((a, b) => a - b);
}
