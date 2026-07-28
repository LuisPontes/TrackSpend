import { IDespesa } from "../models/Despesa";
import { IOrcamento } from "../models/Orcamento";

export interface ResumoUsuario {
  [usuarioId: string]: number;
}

export interface LinhaCategoria {
  categoria: string;
  porUsuario: ResumoUsuario;
  previsto: number;
  total: number;
  diferenca: number;
}

export interface Transferencia {
  de: string;
  para: string;
  valor: number;
}

export interface DashboardResumo {
  fixas: LinhaCategoria[];
  variaveis: LinhaCategoria[];
  resumo: {
    totalFixas: number;
    totalVariaveis: number;
    totalGeral: number;
    porPessoa: ResumoUsuario;
  };
  saldos: ResumoUsuario;
  transferencias: Transferencia[];
}

function agruparPorCategoria(despesas: IDespesa[], tipo: "FIXA" | "VARIAVEL"): LinhaCategoria[] {
  const porCategoria = new Map<string, LinhaCategoria>();

  for (const despesa of despesas) {
    if (despesa.tipo !== tipo) continue;

    const linha = porCategoria.get(despesa.categoria) ?? {
      categoria: despesa.categoria,
      porUsuario: {},
      previsto: 0,
      total: 0,
      diferenca: 0,
    };

    const usuarioId = String(despesa.usuarioId);
    linha.porUsuario[usuarioId] = (linha.porUsuario[usuarioId] ?? 0) + despesa.valor;
    linha.total += despesa.valor;

    porCategoria.set(despesa.categoria, linha);
  }

  return Array.from(porCategoria.values());
}

function aplicarPrevisto(linhas: LinhaCategoria[], orcamento: IOrcamento | null, tipo: "FIXA" | "VARIAVEL") {
  if (!orcamento) return;

  for (const item of orcamento.categorias) {
    if (item.tipo !== tipo) continue;

    let linha = linhas.find((l) => l.categoria === item.categoriaNome);
    if (!linha) {
      linha = { categoria: item.categoriaNome, porUsuario: {}, previsto: 0, total: 0, diferenca: 0 };
      linhas.push(linha);
    }
    linha.previsto = item.valorPrevisto;
  }

  for (const linha of linhas) {
    linha.diferenca = linha.previsto - linha.total;
  }
}

export function calcularDashboard(
  despesas: IDespesa[],
  orcamento: IOrcamento | null,
  membros: string[]
): DashboardResumo {
  const fixas = agruparPorCategoria(despesas, "FIXA");
  const variaveis = agruparPorCategoria(despesas, "VARIAVEL");

  aplicarPrevisto(fixas, orcamento, "FIXA");
  aplicarPrevisto(variaveis, orcamento, "VARIAVEL");

  const totalFixas = fixas.reduce((soma, linha) => soma + linha.total, 0);
  const totalVariaveis = variaveis.reduce((soma, linha) => soma + linha.total, 0);

  const porPessoa: ResumoUsuario = {};
  for (const despesa of despesas) {
    const usuarioId = String(despesa.usuarioId);
    porPessoa[usuarioId] = (porPessoa[usuarioId] ?? 0) + despesa.valor;
  }

  const divisao = orcamento?.divisao ?? { tipo: "50/50" as const, detalhes: {} };
  const saldos = calcularSaldos(porPessoa, divisao, membros);
  const transferencias = calcularTransferencias(saldos);

  return {
    fixas,
    variaveis,
    resumo: {
      totalFixas,
      totalVariaveis,
      totalGeral: totalFixas + totalVariaveis,
      porPessoa,
    },
    saldos,
    transferencias,
  };
}

/**
 * Given how much each member actually paid and the group's split rule, returns
 * net transfers needed to settle up (positive = this member should receive).
 */
export function calcularSaldos(
  gastoPorUsuario: ResumoUsuario,
  divisao: { tipo: "50/50" | "percentual" | "fixo"; detalhes: Record<string, number> },
  membros: string[]
): ResumoUsuario {
  const totalGasto = Object.values(gastoPorUsuario).reduce((soma, valor) => soma + valor, 0);

  const cotaPorUsuario: ResumoUsuario = {};
  if (divisao.tipo === "50/50") {
    const cota = totalGasto / membros.length;
    membros.forEach((id) => (cotaPorUsuario[id] = cota));
  } else if (divisao.tipo === "percentual") {
    membros.forEach((id) => (cotaPorUsuario[id] = totalGasto * ((divisao.detalhes[id] ?? 0) / 100)));
  } else {
    membros.forEach((id) => (cotaPorUsuario[id] = divisao.detalhes[id] ?? 0));
  }

  const saldos: ResumoUsuario = {};
  membros.forEach((id) => {
    const pago = gastoPorUsuario[id] ?? 0;
    const cota = cotaPorUsuario[id] ?? 0;
    saldos[id] = pago - cota;
  });

  return saldos;
}

/**
 * Reduz os saldos (positivo = tem a receber, negativo = deve) a um conjunto
 * mínimo de transferências devedor→credor que acertam as contas do grupo.
 */
export function calcularTransferencias(saldos: ResumoUsuario): Transferencia[] {
  const EPS = 0.01;

  const devedores = Object.entries(saldos)
    .filter(([, v]) => v < -EPS)
    .map(([id, v]) => ({ id, valor: -v }))
    .sort((a, b) => b.valor - a.valor);

  const credores = Object.entries(saldos)
    .filter(([, v]) => v > EPS)
    .map(([id, v]) => ({ id, valor: v }))
    .sort((a, b) => b.valor - a.valor);

  const transferencias: Transferencia[] = [];
  let i = 0;
  let j = 0;

  while (i < devedores.length && j < credores.length) {
    const devedor = devedores[i];
    const credor = credores[j];
    const valor = Math.min(devedor.valor, credor.valor);

    if (valor > EPS) {
      transferencias.push({ de: devedor.id, para: credor.id, valor: Number(valor.toFixed(2)) });
    }

    devedor.valor -= valor;
    credor.valor -= valor;
    if (devedor.valor <= EPS) i++;
    if (credor.valor <= EPS) j++;
  }

  return transferencias;
}
