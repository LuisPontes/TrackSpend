import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { Usuario } from "../types";
import * as authService from "../services/authService";

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  registar: (email: string, nome: string, senha: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "trackspend_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setCarregando(false);
      return;
    }

    authService
      .obterPerfil()
      .then(setUsuario)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setCarregando(false));
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const { token, usuario: dadosUsuario } = await authService.login(email, senha);
    localStorage.setItem(TOKEN_KEY, token);
    setUsuario(dadosUsuario);
  }, []);

  const registar = useCallback(async (email: string, nome: string, senha: string) => {
    const { token, usuario: dadosUsuario } = await authService.registar(email, nome, senha);
    localStorage.setItem(TOKEN_KEY, token);
    setUsuario(dadosUsuario);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, registar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
