import { useEffect, useState, useCallback } from "react";

interface UseFetchResult<T> {
  dados: T | null;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
}

export function useFetch<T>(fn: () => Promise<T>, deps: unknown[] = []): UseFetchResult<T> {
  const [dados, setDados] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  const recarregar = useCallback(() => setTentativa((t) => t + 1), []);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    fn()
      .then((resultado) => {
        if (!cancelado) setDados(resultado);
      })
      .catch((err) => {
        if (!cancelado) setErro(err instanceof Error ? err.message : "Erro ao carregar dados");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tentativa]);

  return { dados, carregando, erro, recarregar };
}
