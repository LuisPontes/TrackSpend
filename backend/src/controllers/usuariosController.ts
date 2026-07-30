import { Request, Response } from "express";
import { Usuario } from "../models/Usuario";

export async function listar(_req: Request, res: Response) {
  const usuarios = await Usuario.find({}, "nome email").sort({ nome: 1 });
  res.json({ usuarios });
}
