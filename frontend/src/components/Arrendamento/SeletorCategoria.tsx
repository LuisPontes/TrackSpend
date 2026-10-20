import { useState } from "react";

interface Props {
  opcoes: string[];
  valor: string;
  aoMudar: (valor: string) => void;
  className?: string;
}

const NOVA = "__nova__";

/**
 * Lista as categorias já usadas e permite criar uma nova; a nova passa a ser
 * opção sempre que o movimento for guardado. Remontar (via `key`) volta ao
 * estado inicial.
 */
export function SeletorCategoria({ opcoes, valor, aoMudar, className = "" }: Props) {
  const [modoNova, setModoNova] = useState(false);

  return (
    <>
      <select
        value={modoNova ? NOVA : valor}
        onChange={(e) => {
          if (e.target.value === NOVA) {
            setModoNova(true);
            aoMudar("");
          } else {
            setModoNova(false);
            aoMudar(e.target.value);
          }
        }}
        required
        aria-label="Categoria"
        className={`min-h-11 rounded border border-slate-300 px-2 py-2 text-sm ${className}`}
      >
        <option value="" disabled>
          Categoria
        </option>
        {opcoes.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value={NOVA}>+ Nova categoria</option>
      </select>

      {modoNova && (
        <input
          autoFocus
          placeholder="Nome da categoria"
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          required
          className={`min-h-11 rounded border border-slate-300 px-2 py-2 text-sm ${className}`}
        />
      )}
    </>
  );
}
