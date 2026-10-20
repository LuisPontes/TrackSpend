import type { MovimentoArrendamento } from "../../types";

export const MESES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function arredondar(valor: number): number {
  return Number(valor.toFixed(2));
}

/** Meses já terminados: 12 em anos passados, os anteriores ao atual no ano corrente. */
export function mesesFechados(ano: number): number {
  const hoje = new Date();
  if (ano < hoje.getFullYear()) return 12;
  return ano === hoje.getFullYear() ? hoje.getMonth() : 0;
}

/** Índice (0-11) do último mês a desenhar: no ano corrente os meses futuros ficam de fora. */
export function ultimoMesVisivel(ano: number): number {
  const hoje = new Date();
  return ano === hoje.getFullYear() ? hoje.getMonth() : 11;
}

export function chaveCategoria(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

export function totaisPorMes(movimentos: MovimentoArrendamento[]) {
  const receitas: number[] = new Array(12).fill(0);
  const despesas: number[] = new Array(12).fill(0);
  for (const m of movimentos) {
    (m.tipo === "RECEITA" ? receitas : despesas)[m.mes - 1] += m.valor;
  }
  return { receitas, despesas };
}

export function mediaPrimeirosMeses(valores: number[], n: number): number | null {
  if (n <= 0) return null;
  return valores.slice(0, n).reduce((soma, v) => soma + v, 0) / n;
}
