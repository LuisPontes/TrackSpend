import { Request, Response } from "express";
import { Despesa } from "../models/Despesa";
import { AppError } from "../middleware/errorHandler";
import { requireFields } from "../utils/validators";
import { capitalizarInicial } from "../utils/texto";

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
  const categoria = capitalizarInicial(req.body.categoria as string);

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

  res.status(201).json({ despesa });
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

  if (categoria !== undefined) despesa.categoria = capitalizarInicial(categoria);
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
