export type TipoDespesa = "FIXA" | "VARIAVEL";
export type TipoDivisao = "50/50" | "percentual" | "fixo";
export type TipoGrupo = "PARTILHADO" | "EMPRESTIMO" | "ARRENDAMENTO";

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

export interface GrupoSettings {
  permitirDespesaEmNomeOutro: boolean;
}

export interface Grupo {
  _id: string;
  nome: string;
  descricao?: string;
  tipo: TipoGrupo;
  criadorId: string;
  membros: MembroGrupo[];
  moeda: string;
  settings: GrupoSettings;
  criadoEm: string;
}

export interface Despesa {
  _id: string;
  grupoId: string;
  usuarioId: string;
  adicionadoPor?: string;
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

export type TipoNotificacao = "orcamento_ultrapassado" | "despesa_em_meu_nome";

export interface Notificacao {
  _id: string;
  grupoId: string;
  memberId: string;
  tipo: TipoNotificacao;
  categoria?: string;
  mes?: string;
  orcamentoPrevisao?: number;
  gastoReal?: number;
  excesso?: number;
  despesaId?: string;
  mensagem?: string;
  lido: boolean;
  criadoEm: string;
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

export interface PagamentoEmprestimo {
  _id: string;
  valor: number;
  data: string;
  descricao?: string;
  criadoEm: string;
}

export interface Emprestimo {
  _id: string;
  grupoId: string;
  credorId: string;
  devedorId: string;
  valor: number;
  data: string;
  descricao?: string;
  pagamentos: PagamentoEmprestimo[];
  totalPago: number;
  saldo: number;
  criadoEm: string;
}

export type TipoMovimentoArrendamento = "RECEITA" | "DESPESA";

export interface MovimentoArrendamento {
  _id: string;
  grupoId: string;
  usuarioId: string;
  tipo: TipoMovimentoArrendamento;
  categoria: string;
  valor: number;
  data: string;
  mes: number;
  ano: number;
  descricao?: string;
}
