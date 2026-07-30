import { useContext } from "react";
import { NotificacoesContext } from "../context/NotificacoesContext";

export function useNotificacoes() {
  const context = useContext(NotificacoesContext);
  if (!context) {
    throw new Error("useNotificacoes deve ser usado dentro de um NotificacoesProvider");
  }
  return context;
}
