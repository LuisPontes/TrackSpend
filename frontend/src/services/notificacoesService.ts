import { api } from "./api";
import type { Notificacao } from "../types";

export async function listarNotificacoes(grupoId: string): Promise<Notificacao[]> {
  const { data } = await api.get<{ notificacoes: Notificacao[] }>(`/grupos/${grupoId}/notificacoes`);
  return data.notificacoes;
}

export async function marcarLido(grupoId: string, id: string): Promise<void> {
  await api.patch(`/grupos/${grupoId}/notificacoes/${id}/lido`);
}
