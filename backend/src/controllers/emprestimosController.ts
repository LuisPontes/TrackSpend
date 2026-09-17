import { Request, Response } from "express";
import { Emprestimo, IPagamentoEmprestimo } from "../models/Emprestimo";
import { AppError } from "../middleware/errorHandler";
import { requireFields } from "../utils/validators";

function comSaldo(emprestimo: InstanceType<typeof Emprestimo>) {
  const totalPago = emprestimo.pagamentos.reduce((soma, p) => soma + p.valor, 0);
  return {
    ...emprestimo.toObject(),
    totalPago,
    saldo: emprestimo.valor - totalPago,
  };
}

export async function listar(req: Request, res: Response) {
  const emprestimos = await Emprestimo.find({ grupoId: req.params.grupoId }).sort({ data: -1 });
  res.json({ emprestimos: emprestimos.map(comSaldo) });
}

export async function criar(req: Request, res: Response) {
  requireFields(req.body, ["credorId", "devedorId", "valor", "data"]);
  const { credorId, devedorId, valor, data, descricao } = req.body as {
    credorId: string;
    devedorId: string;
    valor: number;
    data: string;
    descricao?: string;
  };

  if (credorId === devedorId) {
    throw new AppError("Credor e devedor têm de ser pessoas diferentes", 422);
  }

  const grupo = req.grupo!;
  if (!grupo.membros.some((id) => id.toString() === credorId) || !grupo.membros.some((id) => id.toString() === devedorId)) {
    throw new AppError("Credor e devedor têm de ser membros deste grupo", 422);
  }

  const dataEmprestimo = new Date(data);
  if (Number.isNaN(dataEmprestimo.getTime())) {
    throw new AppError("Data inválida", 422);
  }

  const emprestimo = await Emprestimo.create({
    grupoId: req.params.grupoId,
    credorId,
    devedorId,
    valor,
    data: dataEmprestimo,
    descricao,
    pagamentos: [],
  });

  res.status(201).json({ emprestimo: comSaldo(emprestimo) });
}

export async function editar(req: Request, res: Response) {
  const emprestimo = await Emprestimo.findOne({ _id: req.params.id, grupoId: req.params.grupoId });
  if (!emprestimo) {
    throw new AppError("Empréstimo não encontrado", 404);
  }

  const { valor, data, descricao } = req.body as Partial<{ valor: number; data: string; descricao: string }>;

  if (valor !== undefined) emprestimo.valor = valor;
  if (descricao !== undefined) emprestimo.descricao = descricao;
  if (data !== undefined) {
    const dataEmprestimo = new Date(data);
    if (Number.isNaN(dataEmprestimo.getTime())) {
      throw new AppError("Data inválida", 422);
    }
    emprestimo.data = dataEmprestimo;
  }

  await emprestimo.save();
  res.json({ emprestimo: comSaldo(emprestimo) });
}

export async function registarPagamento(req: Request, res: Response) {
  requireFields(req.body, ["valor", "data"]);
  const { valor, data, descricao } = req.body as { valor: number; data: string; descricao?: string };

  const emprestimo = await Emprestimo.findOne({ _id: req.params.id, grupoId: req.params.grupoId });
  if (!emprestimo) {
    throw new AppError("Empréstimo não encontrado", 404);
  }

  const dataPagamento = new Date(data);
  if (Number.isNaN(dataPagamento.getTime())) {
    throw new AppError("Data inválida", 422);
  }

  emprestimo.pagamentos.push({ valor, data: dataPagamento, descricao } as IPagamentoEmprestimo);
  await emprestimo.save();

  res.status(201).json({ emprestimo: comSaldo(emprestimo) });
}

export async function remover(req: Request, res: Response) {
  const emprestimo = await Emprestimo.findOneAndDelete({ _id: req.params.id, grupoId: req.params.grupoId });
  if (!emprestimo) {
    throw new AppError("Empréstimo não encontrado", 404);
  }
  res.status(204).send();
}

export async function removerPagamento(req: Request, res: Response) {
  const emprestimo = await Emprestimo.findOne({ _id: req.params.id, grupoId: req.params.grupoId });
  if (!emprestimo) {
    throw new AppError("Empréstimo não encontrado", 404);
  }

  const existe = emprestimo.pagamentos.some((p) => p._id.toString() === req.params.pagamentoId);
  if (!existe) {
    throw new AppError("Pagamento não encontrado", 404);
  }
  emprestimo.pagamentos.pull({ _id: req.params.pagamentoId });

  await emprestimo.save();
  res.json({ emprestimo: comSaldo(emprestimo) });
}
