import { api } from "./api";

export async function executarBackup(): Promise<{ sucesso: boolean; mensagem: string }> {
  const { data } = await api.post<{ sucesso: boolean; mensagem: string }>("/backup");
  return data;
}
