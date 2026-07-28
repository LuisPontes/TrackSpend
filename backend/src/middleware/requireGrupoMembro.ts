import { Request, Response, NextFunction } from "express";
import { Grupo } from "../models/Grupo";
import { AppError } from "./errorHandler";

/**
 * Must run after requireAuth. Loads the group from req.params.grupoId and
 * ensures the authenticated user is a member, attaching it as req.grupo.
 */
export async function requireGrupoMembro(req: Request, _res: Response, next: NextFunction) {
  const { grupoId } = req.params;
  const grupo = await Grupo.findById(grupoId);
  if (!grupo) {
    throw new AppError("Grupo não encontrado", 404);
  }

  const isMembro = grupo.membros.some((membroId) => membroId.toString() === req.auth?.userId);
  if (!isMembro) {
    throw new AppError("Sem acesso a este grupo", 403);
  }

  req.grupo = grupo;
  next();
}

declare global {
  namespace Express {
    interface Request {
      grupo?: InstanceType<typeof Grupo>;
    }
  }
}
