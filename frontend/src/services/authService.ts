import { api } from "./api";
import type { Usuario } from "../types";

interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export async function registar(email: string, nome: string, senha: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", { email, nome, senha });
  return data;
}

export async function login(email: string, senha: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, senha });
  return data;
}

export async function obterPerfil(): Promise<Usuario> {
  const { data } = await api.get<{ usuario: Usuario }>("/auth/me");
  return data.usuario;
}
