import { Request, Response } from "express";
import { Despesa } from "../models/Despesa";
import { Orcamento } from "../models/Orcamento";
import { calcularDashboard } from "../utils/calculos";

export async function obterDashboard(req: Request, res: Response) {
  const { mes, ano } = req.params;
  const grupoId = req.params.grupoId;

  const [despesas, orcamento] = await Promise.all([
    Despesa.find({ grupoId, mes: Number(mes), ano: Number(ano) }),
    Orcamento.findOne({ grupoId, mes: Number(mes), ano: Number(ano) }),
  ]);

  const membros = req.grupo!.membros.map((id) => String(id));
  const dashboard = calcularDashboard(despesas, orcamento, membros);
  res.json(dashboard);
}
