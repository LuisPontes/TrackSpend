import { Request, Response } from "express";
import { Grupo } from "../models/Grupo";
import { Usuario } from "../models/Usuario";
import { Despesa } from "../models/Despesa";
import { Categoria } from "../models/Categoria";
import { Orcamento } from "../models/Orcamento";
import { Acerto } from "../models/Acerto";
import { AppError } from "../middleware/errorHandler";
import { requireFields } from "../utils/validators";

export async function listar(req: Request, res: Response) {
  const grupos = await Grupo.find({ membros: req.auth?.userId })
    .populate("membros", "nome email")
    .sort({ criadoEm: -1 });
  res.json({ grupos });
}

export async function criar(req: Request, res: Response) {
  requireFields(req.body, ["nome"]);
  const { nome, descricao, moeda } = req.body as { nome: string; descricao?: string; moeda?: string };
  const userId = req.auth?.userId as string;

  const grupo = await Grupo.create({
    nome,
    descricao,
    moeda: moeda ?? "EUR",
    criadorId: userId,
    membros: [userId],
  });

  await Usuario.findByIdAndUpdate(userId, { $addToSet: { grupos: grupo._id } });
  await grupo.populate("membros", "nome email");

  res.status(201).json({ grupo });
}

export async function obter(req: Request, res: Response) {
  const grupo = await Grupo.findById(req.grupo!._id).populate("membros", "nome email");
  res.json({ grupo });
}

export async function editar(req: Request, res: Response) {
  const grupo = req.grupo!;
  const { nome, descricao, moeda } = req.body as { nome?: string; descricao?: string; moeda?: string };

  if (nome !== undefined) grupo.nome = nome;
  if (descricao !== undefined) grupo.descricao = descricao;
  if (moeda !== undefined) grupo.moeda = moeda;

  await grupo.save();
  res.json({ grupo });
}

export async function adicionarMembro(req: Request, res: Response) {
  requireFields(req.body, ["email"]);
  const { email } = req.body as { email: string };

  const usuario = await Usuario.findOne({ email: email.toLowerCase() });
  if (!usuario) {
    throw new AppError("Não existe utilizador com este email", 404);
  }

  const grupo = req.grupo!;
  if (grupo.membros.some((id) => id.toString() === String(usuario._id))) {
    throw new AppError("Utilizador já é membro do grupo", 409);
  }

  grupo.membros.push(usuario._id);
  await grupo.save();
  await Usuario.findByIdAndUpdate(usuario._id, { $addToSet: { grupos: grupo._id } });
  await grupo.populate("membros", "nome email");

  res.status(201).json({ grupo });
}

export async function eliminar(req: Request, res: Response) {
  const grupo = req.grupo!;

  if (grupo.criadorId.toString() !== req.auth?.userId) {
    throw new AppError("Só quem criou o grupo o pode eliminar", 403);
  }

  await Promise.all([
    Despesa.deleteMany({ grupoId: grupo._id }),
    Categoria.deleteMany({ grupoId: grupo._id }),
    Orcamento.deleteMany({ grupoId: grupo._id }),
    Acerto.deleteMany({ grupoId: grupo._id }),
    Usuario.updateMany({ grupos: grupo._id }, { $pull: { grupos: grupo._id } }),
  ]);
  await Grupo.findByIdAndDelete(grupo._id);

  res.status(204).send();
}

export async function removerMembro(req: Request, res: Response) {
  const grupo = req.grupo!;
  const { usuarioId } = req.params;

  grupo.membros = grupo.membros.filter((id) => id.toString() !== usuarioId);
  await grupo.save();
  await Usuario.findByIdAndUpdate(usuarioId, { $pull: { grupos: grupo._id } });
  await grupo.populate("membros", "nome email");

  res.json({ grupo });
}
