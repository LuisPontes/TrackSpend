import { Request, Response } from "express";
import { Despesa } from "../models/Despesa";
import { Orcamento } from "../models/Orcamento";
import { Notificacao } from "../models/Notificacao";
import { AppError } from "../middleware/errorHandler";
import { requireFields } from "../utils/validators";
import { normalizarCategoria } from "../utils/categorias";

/**
 * Se a despesa fizer a categoria ultrapassar o orçamento do mês, cria (ou
 * atualiza, se já houver uma por ler) uma notificação para quem a registou.
 */
async function notificarSeUltrapassouOrcamento(despesa: InstanceType<typeof Despesa>, criadoPorId: string) {
  const orcamento = await Orcamento.findOne({ grupoId: despesa.grupoId, mes: despesa.mes, ano: despesa.ano });
  const itemOrcamento = orcamento?.categorias.find((c) => c.categoriaNome === despesa.categoria);
  if (!itemOrcamento) return null;

  const soma = await Despesa.aggregate([
    { $match: { grupoId: despesa.grupoId, categoria: despesa.categoria, mes: despesa.mes, ano: despesa.ano } },
    { $group: { _id: null, total: { $sum: "$valor" } } },
  ]);
  const gastoReal: number = soma[0]?.total ?? 0;
  if (gastoReal <= itemOrcamento.valorPrevisto) return null;

  const mes = `${despesa.ano}-${String(despesa.mes).padStart(2, "0")}`;
  return Notificacao.findOneAndUpdate(
    {
      grupoId: despesa.grupoId,
      memberId: criadoPorId,
      tipo: "orcamento_ultrapassado",
      categoria: despesa.categoria,
      mes,
      lido: false,
    },
    {
      $set: {
        orcamentoPrevisao: itemOrcamento.valorPrevisto,
        gastoReal,
        excesso: gastoReal - itemOrcamento.valorPrevisto,
      },
    },
    { upsert: true, new: true }
  );
}

export async function listar(req: Request, res: Response) {
  const { grupoId } = req.params;
  const { mes, ano, categoria, tipo } = req.query as Record<string, string | undefined>;

  const filtro: Record<string, unknown> = { grupoId };
  if (mes) filtro.mes = Number(mes);
  if (ano) filtro.ano = Number(ano);
  if (categoria) filtro.categoria = categoria;
  if (tipo) filtro.tipo = tipo;

  const despesas = await Despesa.find(filtro).sort({ data: -1 });
  res.json({ despesas });
}

export async function listarAnos(req: Request, res: Response) {
  const anos = await Despesa.distinct("ano", { grupoId: req.params.grupoId });
  res.json({ anos: anos.sort((a, b) => a - b) });
}

export async function criar(req: Request, res: Response) {
  requireFields(req.body, ["categoria", "tipo", "valor", "data"]);
  const { tipo, valor, data, descricao } = req.body as {
    categoria: string;
    tipo: string;
    valor: number;
    data: string;
    descricao?: string;
  };
  const categoria = normalizarCategoria(req.body.categoria as string);

  const dataDespesa = new Date(data);
  if (Number.isNaN(dataDespesa.getTime())) {
    throw new AppError("Data inválida", 422);
  }

  const despesa = await Despesa.create({
    grupoId: req.params.grupoId,
    usuarioId: req.auth?.userId,
    categoria,
    tipo,
    valor,
    data: dataDespesa,
    mes: dataDespesa.getMonth() + 1,
    ano: dataDespesa.getFullYear(),
    descricao,
  });

  const notificacao = await notificarSeUltrapassouOrcamento(despesa, req.auth?.userId as string);

  res.status(201).json({ despesa, notificacao });
}

export async function obter(req: Request, res: Response) {
  const despesa = await Despesa.findOne({ _id: req.params.id, grupoId: req.params.grupoId });
  if (!despesa) {
    throw new AppError("Despesa não encontrada", 404);
  }
  res.json({ despesa });
}

export async function editar(req: Request, res: Response) {
  const despesa = await Despesa.findOne({ _id: req.params.id, grupoId: req.params.grupoId });
  if (!despesa) {
    throw new AppError("Despesa não encontrada", 404);
  }

  const { categoria, tipo, valor, data, descricao } = req.body as Partial<{
    categoria: string;
    tipo: string;
    valor: number;
    data: string;
    descricao: string;
  }>;

  if (categoria !== undefined) despesa.categoria = normalizarCategoria(categoria);
  if (tipo !== undefined) despesa.tipo = tipo as typeof despesa.tipo;
  if (valor !== undefined) despesa.valor = valor;
  if (descricao !== undefined) despesa.descricao = descricao;
  if (data !== undefined) {
    const dataDespesa = new Date(data);
    if (Number.isNaN(dataDespesa.getTime())) {
      throw new AppError("Data inválida", 422);
    }
    despesa.data = dataDespesa;
    despesa.mes = dataDespesa.getMonth() + 1;
    despesa.ano = dataDespesa.getFullYear();
  }

  await despesa.save();
  res.json({ despesa });
}

export async function remover(req: Request, res: Response) {
  const despesa = await Despesa.findOneAndDelete({ _id: req.params.id, grupoId: req.params.grupoId });
  if (!despesa) {
    throw new AppError("Despesa não encontrada", 404);
  }
  res.status(204).send();
}
