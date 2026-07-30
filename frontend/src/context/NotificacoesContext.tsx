import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { Notificacao } from "../types";
import * as notificacoesService from "../services/notificacoesService";

interface NotificacoesContextValue {
  notificacoes: Notificacao[];
  recarregar: () => void;
  marcarComoLida: (id: string) => Promise<void>;
}

export const NotificacoesContext = createContext<NotificacoesContextValue | undefined>(undefined);

export function NotificacoesProvider({ grupoId, children }: { grupoId: string; children: ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  const carregar = useCallback(() => {
    notificacoesService.listarNotificacoes(grupoId).then(setNotificacoes).catch(() => {});
  }, [grupoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const marcarComoLida = useCallback(
    async (id: string) => {
      await notificacoesService.marcarLido(grupoId, id);
      setNotificacoes((atual) => atual.filter((n) => n._id !== id));
    },
    [grupoId]
  );

  return (
    <NotificacoesContext.Provider value={{ notificacoes, recarregar: carregar, marcarComoLida }}>
      {children}
    </NotificacoesContext.Provider>
  );
}
