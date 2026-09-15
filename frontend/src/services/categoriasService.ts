import { api } from "./api";
import type { Categoria, TipoDespesa } from "../types";

export async function listarCategorias(grupoId: string): Promise<Categoria[]> {
  const { data } = await api.get<{ categorias: Categoria[] }>(`/grupos/${grupoId}/categorias`);
  return data.categorias;
}

export async function criarCategoria(
  grupoId: string,
  nome: string,
  tipo: TipoDespesa,
  cor?: string
): Promise<Categoria> {
  const { data } = await api.post<{ categoria: Categoria }>(`/grupos/${grupoId}/categorias`, { nome, tipo, cor });
  return data.categoria;
}

export async function editarCategoria(
  grupoId: string,
  categoriaId: string,
  dados: Partial<{ nome: string; tipo: TipoDespesa; cor: string; ativo: boolean }>
): Promise<Categoria> {
  const { data } = await api.put<{ categoria: Categoria }>(`/grupos/${grupoId}/categorias/${categoriaId}`, dados);
  return data.categoria;
}
