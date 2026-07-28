import { Request, Response } from "express";
import { Acerto } from "../models/Acerto";
import { AppError } from "../middleware/errorHandler";
import { requireFields } from "../utils/validators";

export async function listar(req: Request, res: Response) {
  const { mes, ano } = req.query as Record<string, string | undefined>;
  const filtro: Record<string, unknown> = { grupoId: req.params.grupoId };
  if (mes) filtro.mes = Number(mes);
  if (ano) filtro.ano = Number(ano);

  const acertos = await Acerto.find(filtro).sort({ criadoEm: -1 });
  res.json({ acertos });
}

export async function criar(req: Request, res: Response) {
  requireFields(req.body, ["de", "para", "valor", "mes", "ano"]);
  const { de, para, valor, mes, ano, descricao } = req.body as {
    de: string;
    para: string;
    valor: number;
    mes: number;
    ano: number;
    descricao?: string;
  };

  const acerto = await Acerto.create({
    grupoId: req.params.grupoId,
    de,
    para,
    valor,
    mes,
    ano,
    descricao,
  });

  res.status(201).json({ acerto });
}

export async function editar(req: Request, res: Response) {
  const acerto = await Acerto.findOne({ _id: req.params.id, grupoId: req.params.grupoId });
  if (!acerto) {
    throw new AppError("Acerto não encontrado", 404);
  }

  const { pago, valor, descricao } = req.body as Partial<{ pago: boolean; valor: number; descricao: string }>;
  if (pago !== undefined) {
    acerto.pago = pago;
    acerto.dataPagamento = pago ? new Date() : undefined;
  }
  if (valor !== undefined) acerto.valor = valor;
  if (descricao !== undefined) acerto.descricao = descricao;

  await acerto.save();
  res.json({ acerto });
}
