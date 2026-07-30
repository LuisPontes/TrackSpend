import { useState } from "react";
import type { Notificacao } from "../../types";
import { useNotificacoes } from "../../hooks/useNotificacoes";

function mensagemDe(n: Notificacao): string {
  if (n.tipo === "orcamento_ultrapassado") {
    return `⚠️ Categoria "${n.categoria}" ultrapassou orçamento: €${(n.orcamentoPrevisao ?? 0).toFixed(2)} previstos, €${(n.gastoReal ?? 0).toFixed(2)} gastos`;
  }
  return n.mensagem ?? "Nova notificação";
}

export function NotificacaoBadge() {
  const { notificacoes, marcarComoLida } = useNotificacoes();
  const [aberto, setAberto] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setAberto((a) => !a)}
        className="relative flex h-11 w-11 items-center justify-center rounded text-lg hover:bg-slate-100"
        aria-label="Notificações"
      >
        🔔
        {notificacoes.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white">
            {notificacoes.length}
          </span>
        )}
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />
          <div className="fixed right-4 top-16 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              Notificações
            </div>
            {notificacoes.length === 0 ? (
              <p className="px-4 py-4 text-sm text-slate-500">Sem notificações novas.</p>
            ) : (
              <ul className="max-h-96 overflow-y-auto">
                {notificacoes.map((n) => (
                  <li key={n._id} className="border-b border-slate-100 px-4 py-3 text-sm last:border-0">
                    <p className="text-slate-700">{mensagemDe(n)}</p>
                    <button
                      onClick={() => marcarComoLida(n._id)}
                      className="mt-1 text-xs text-slate-500 underline hover:text-slate-700"
                    >
                      Descartar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
