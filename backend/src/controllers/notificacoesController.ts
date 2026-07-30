import { Request, Response } from "express";
import { Notificacao } from "../models/Notificacao";
import { AppError } from "../middleware/errorHandler";

export async function listar(req: Request, res: Response) {
  const { incluirLidas } = req.query as Record<string, string | undefined>;

  const filtro: Record<string, unknown> = {
    grupoId: req.params.grupoId,
    memberId: req.auth?.userId,
  };
  if (incluirLidas !== "true") filtro.lido = false;

  const notificacoes = await Notificacao.find(filtro).sort({ criadoEm: -1 }).limit(50);
  res.json({ notificacoes });
}

export async function marcarLido(req: Request, res: Response) {
  const notificacao = await Notificacao.findOneAndUpdate(
    { _id: req.params.id, grupoId: req.params.grupoId, memberId: req.auth?.userId },
    { lido: true },
    { new: true }
  );
  if (!notificacao) {
    throw new AppError("Notificação não encontrada", 404);
  }
  res.json({ notificacao });
}
