export type TipoDespesa = "FIXA" | "VARIAVEL";
export type TipoDivisao = "50/50" | "percentual" | "fixo";

export interface Usuario {
  id: string;
  email: string;
  nome: string;
}

export interface MembroGrupo {
  _id: string;
  nome: string;
  email: string;
}

export interface Grupo {
  _id: string;
  nome: string;
  descricao?: string;
  criadorId: string;
  membros: MembroGrupo[];
  moeda: string;
  criadoEm: string;
}

export interface Despesa {
  _id: string;
  grupoId: string;
  usuarioId: string;
  categoria: string;
  tipo: TipoDespesa;
  valor: number;
  data: string;
  mes: number;
  ano: number;
  descricao?: string;
}

export interface Categoria {
  _id: string;
  grupoId: string;
  nome: string;
  tipo: TipoDespesa;
  cor: string;
  ativo: boolean;
}

export interface OrcamentoCategoria {
  categoriaNome: string;
  valorPrevisto: number;
  tipo: TipoDespesa;
}

export interface Divisao {
  tipo: TipoDivisao;
  detalhes: Record<string, number>;
}

export interface Orcamento {
  _id: string;
  grupoId: string;
  mes: number;
  ano: number;
  categorias: OrcamentoCategoria[];
  divisao: Divisao;
}

export interface Acerto {
  _id: string;
  grupoId: string;
  de: string;
  para: string;
  valor: number;
  mes: number;
  ano: number;
  descricao?: string;
  pago: boolean;
  dataPagamento?: string;
}

export interface LinhaCategoriaDashboard {
  categoria: string;
  porUsuario: Record<string, number>;
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
  fixas: LinhaCategoriaDashboard[];
  variaveis: LinhaCategoriaDashboard[];
  resumo: {
    totalFixas: number;
    totalVariaveis: number;
    totalGeral: number;
    porPessoa: Record<string, number>;
  };
  saldos: Record<string, number>;
  transferencias: Transferencia[];
}
