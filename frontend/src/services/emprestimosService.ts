import { api } from "./api";
import type { Emprestimo } from "../types";

export async function listarEmprestimos(grupoId: string): Promise<Emprestimo[]> {
  const { data } = await api.get<{ emprestimos: Emprestimo[] }>(`/grupos/${grupoId}/emprestimos`);
  return data.emprestimos;
}

export async function criarEmprestimo(
  grupoId: string,
  dados: { credorId: string; devedorId: string; valor: number; data: string; descricao?: string }
): Promise<Emprestimo> {
  const { data } = await api.post<{ emprestimo: Emprestimo }>(`/grupos/${grupoId}/emprestimos`, dados);
  return data.emprestimo;
}

export async function registarPagamento(
  grupoId: string,
  emprestimoId: string,
  dados: { valor: number; data: string; descricao?: string }
): Promise<Emprestimo> {
  const { data } = await api.post<{ emprestimo: Emprestimo }>(
    `/grupos/${grupoId}/emprestimos/${emprestimoId}/pagamentos`,
    dados
  );
  return data.emprestimo;
}

export async function removerEmprestimo(grupoId: string, emprestimoId: string): Promise<void> {
  await api.delete(`/grupos/${grupoId}/emprestimos/${emprestimoId}`);
}
