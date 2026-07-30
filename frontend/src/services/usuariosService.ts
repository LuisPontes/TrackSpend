import { api } from "./api";
import type { MembroGrupo } from "../types";

export async function listarUsuarios(): Promise<MembroGrupo[]> {
  const { data } = await api.get<{ usuarios: MembroGrupo[] }>("/usuarios");
  return data.usuarios;
}
