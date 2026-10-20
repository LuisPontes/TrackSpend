import { Request, Response } from "express";
import mongoose from "mongoose";
import { MovimentoArrendamento } from "../models/MovimentoArrendamento";
import { AppError } from "../middleware/errorHandler";
import { requireFields } from "../utils/validators";
import { capitalizarInicial } from "../utils/texto";

export async function listar(req: Request, res: Response) {
  const { mes, ano } = req.query as Record<string, string | undefined>;

  const filtro: Record<string, unknown> = { grupoId: req.params.grupoId };
  if (mes) filtro.mes = Number(mes);
  if (ano) filtro.ano = Number(ano);

  const movimentos = await MovimentoArrendamento.find(filtro).sort({ data: -1 });
  res.json({ movimentos });
}

export async function listarAnos(req: Request, res: Response) {
  const anos = await MovimentoArrendamento.distinct("ano", { grupoId: req.params.grupoId });
  res.json({ anos: anos.sort((a, b) => a - b) });
}

function chaveCategoria(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * As categorias de arrendamento são as já usadas em movimentos do grupo (sem
 * coleção própria): criar um movimento com uma categoria nova torna-a logo uma
 * opção. Variantes que só diferem em maiúsculas/acentos contam como uma só.
 */
export async function listarCategorias(req: Request, res: Response) {
  const linhas = await MovimentoArrendamento.aggregate<{ _id: { tipo: string; categoria: string } }>([
    { $match: { grupoId: new mongoose.Types.ObjectId(req.params.grupoId) } },
    { $group: { _id: { tipo: "$tipo", categoria: "$categoria" } } },
  ]);

  const porTipo: Record<"RECEITA" | "DESPESA", Map<string, string>> = {
    RECEITA: new Map(),
    DESPESA: new Map(),
  };
  for (const { _id } of linhas) {
    const mapa = porTipo[_id.tipo as "RECEITA" | "DESPESA"];
    const chave = chaveCategoria(_id.categoria);
    if (mapa && chave && !mapa.has(chave)) {
      mapa.set(chave, capitalizarInicial(_id.categoria));
    }
  }

  const ordenar = (mapa: Map<string, string>) =>
    Array.from(mapa.values()).sort((a, b) => a.localeCompare(b, "pt"));

  res.json({ categorias: { RECEITA: ordenar(porTipo.RECEITA), DESPESA: ordenar(porTipo.DESPESA) } });
}

export async function criar(req: Request, res: Response) {
  requireFields(req.body, ["tipo", "categoria", "valor", "data"]);
  const { tipo, valor, data, descricao } = req.body as {
    tipo: string;
    categoria: string;
    valor: number;
    data: string;
    descricao?: string;
  };
  const categoria = capitalizarInicial(req.body.categoria as string);

  const dataMovimento = new Date(data);
  if (Number.isNaN(dataMovimento.getTime())) {
    throw new AppError("Data inválida", 422);
  }

  const movimento = await MovimentoArrendamento.create({
    grupoId: req.params.grupoId,
    usuarioId: req.auth?.userId,
    tipo,
    categoria,
    valor,
    data: dataMovimento,
    mes: dataMovimento.getMonth() + 1,
    ano: dataMovimento.getFullYear(),
    descricao,
  });

  res.status(201).json({ movimento });
}

export async function editar(req: Request, res: Response) {
  const movimento = await MovimentoArrendamento.findOne({ _id: req.params.id, grupoId: req.params.grupoId });
  if (!movimento) {
    throw new AppError("Movimento não encontrado", 404);
  }

  const { tipo, categoria, valor, data, descricao } = req.body as Partial<{
    tipo: string;
    categoria: string;
    valor: number;
    data: string;
    descricao: string;
  }>;

  if (tipo !== undefined) movimento.tipo = tipo as typeof movimento.tipo;
  if (categoria !== undefined) movimento.categoria = capitalizarInicial(categoria);
  if (valor !== undefined) movimento.valor = valor;
  if (descricao !== undefined) movimento.descricao = descricao;
  if (data !== undefined) {
    const dataMovimento = new Date(data);
    if (Number.isNaN(dataMovimento.getTime())) {
      throw new AppError("Data inválida", 422);
    }
    movimento.data = dataMovimento;
    movimento.mes = dataMovimento.getMonth() + 1;
    movimento.ano = dataMovimento.getFullYear();
  }

  await movimento.save();
  res.json({ movimento });
}

export async function remover(req: Request, res: Response) {
  const movimento = await MovimentoArrendamento.findOneAndDelete({ _id: req.params.id, grupoId: req.params.grupoId });
  if (!movimento) {
    throw new AppError("Movimento não encontrado", 404);
  }
  res.status(204).send();
}
