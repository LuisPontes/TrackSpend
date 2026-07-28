import { Request, Response } from "express";
import { Categoria } from "../models/Categoria";
import { AppError } from "../middleware/errorHandler";
import { requireFields } from "../utils/validators";
import { capitalizarInicial } from "../utils/texto";

export async function listar(req: Request, res: Response) {
  const categorias = await Categoria.find({ grupoId: req.params.grupoId, ativo: true }).sort({ nome: 1 });
  res.json({ categorias });
}

export async function criar(req: Request, res: Response) {
  requireFields(req.body, ["nome", "tipo"]);
  const { tipo, cor } = req.body as { nome: string; tipo: string; cor?: string };
  const nome = capitalizarInicial(req.body.nome as string);

  const existente = await Categoria.findOne({ grupoId: req.params.grupoId, nome });
  if (existente) {
    throw new AppError("Já existe uma categoria com este nome", 409);
  }

  const categoria = await Categoria.create({ grupoId: req.params.grupoId, nome, tipo, cor });
  res.status(201).json({ categoria });
}

export async function editar(req: Request, res: Response) {
  const categoria = await Categoria.findOne({ _id: req.params.id, grupoId: req.params.grupoId });
  if (!categoria) {
    throw new AppError("Categoria não encontrada", 404);
  }

  const { nome, tipo, cor, ativo } = req.body as Partial<{
    nome: string;
    tipo: string;
    cor: string;
    ativo: boolean;
  }>;

  if (nome !== undefined) categoria.nome = capitalizarInicial(nome);
  if (tipo !== undefined) categoria.tipo = tipo as typeof categoria.tipo;
  if (cor !== undefined) categoria.cor = cor;
  if (ativo !== undefined) categoria.ativo = ativo;

  await categoria.save();
  res.json({ categoria });
}

export async function remover(req: Request, res: Response) {
  // Soft-delete so historical despesas keep pointing at a meaningful category name.
  const categoria = await Categoria.findOneAndUpdate(
    { _id: req.params.id, grupoId: req.params.grupoId },
    { ativo: false },
    { new: true }
  );
  if (!categoria) {
    throw new AppError("Categoria não encontrada", 404);
  }
  res.status(204).send();
}
