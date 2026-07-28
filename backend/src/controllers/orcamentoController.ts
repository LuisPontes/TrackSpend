import { Request, Response } from "express";
import { Orcamento } from "../models/Orcamento";
import { AppError } from "../middleware/errorHandler";
import { requireFields } from "../utils/validators";

export async function obterPorMes(req: Request, res: Response) {
  const { mes, ano } = req.params;
  const orcamento = await Orcamento.findOne({
    grupoId: req.params.grupoId,
    mes: Number(mes),
    ano: Number(ano),
  });
  res.json({ orcamento });
}

export async function criar(req: Request, res: Response) {
  requireFields(req.body, ["mes", "ano", "categorias", "divisao"]);
  const { mes, ano, categorias, divisao } = req.body as {
    mes: number;
    ano: number;
    categorias: unknown;
    divisao: unknown;
  };

  const existente = await Orcamento.findOne({ grupoId: req.params.grupoId, mes, ano });
  if (existente) {
    throw new AppError("Já existe um orçamento para este mês/ano — usa PUT para editar", 409);
  }

  const orcamento = await Orcamento.create({
    grupoId: req.params.grupoId,
    mes,
    ano,
    categorias,
    divisao,
  });

  res.status(201).json({ orcamento });
}

export async function editar(req: Request, res: Response) {
  const orcamento = await Orcamento.findOne({ _id: req.params.id, grupoId: req.params.grupoId });
  if (!orcamento) {
    throw new AppError("Orçamento não encontrado", 404);
  }

  const { categorias, divisao } = req.body as Partial<{ categorias: unknown; divisao: unknown }>;
  if (categorias !== undefined) orcamento.categorias = categorias as typeof orcamento.categorias;
  if (divisao !== undefined) orcamento.divisao = divisao as typeof orcamento.divisao;

  await orcamento.save();
  res.json({ orcamento });
}
