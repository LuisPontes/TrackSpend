import { api } from "./api";
import type { Grupo } from "../types";

export async function listarGrupos(): Promise<Grupo[]> {
  const { data } = await api.get<{ grupos: Grupo[] }>("/grupos");
  return data.grupos;
}

export async function criarGrupo(nome: string, descricao?: string): Promise<Grupo> {
  const { data } = await api.post<{ grupo: Grupo }>("/grupos", { nome, descricao });
  return data.grupo;
}

export async function obterGrupo(grupoId: string): Promise<Grupo> {
  const { data } = await api.get<{ grupo: Grupo }>(`/grupos/${grupoId}`);
  return data.grupo;
}

export async function adicionarMembro(grupoId: string, email: string): Promise<Grupo> {
  const { data } = await api.post<{ grupo: Grupo }>(`/grupos/${grupoId}/membros`, { email });
  return data.grupo;
}

export async function editarGrupo(grupoId: string, dados: { nome?: string; descricao?: string }): Promise<Grupo> {
  const { data } = await api.put<{ grupo: Grupo }>(`/grupos/${grupoId}`, dados);
  return data.grupo;
}

export async function eliminarGrupo(grupoId: string): Promise<void> {
  await api.delete(`/grupos/${grupoId}`);
}
