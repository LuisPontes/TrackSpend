import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Usuario } from "../models/Usuario";
import { AppError } from "../middleware/errorHandler";
import { requireFields, isValidEmail } from "../utils/validators";

const SALT_ROUNDS = 10;

function signToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  } as jwt.SignOptions);
}

function toPublicUser(usuario: { _id: unknown; email: string; nome: string }) {
  return { id: usuario._id, email: usuario.email, nome: usuario.nome };
}

export async function register(req: Request, res: Response) {
  requireFields(req.body, ["email", "nome", "senha"]);
  const { email, nome, senha } = req.body as { email: string; nome: string; senha: string };

  if (!isValidEmail(email)) {
    throw new AppError("Email inválido", 422);
  }
  if (senha.length < 8) {
    throw new AppError("A senha deve ter pelo menos 8 caracteres", 422);
  }

  const existente = await Usuario.findOne({ email: email.toLowerCase() });
  if (existente) {
    throw new AppError("Já existe uma conta com este email", 409);
  }

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  const usuario = await Usuario.create({ email, nome, senha: senhaHash });

  const token = signToken(String(usuario._id));
  res.status(201).json({ token, usuario: toPublicUser(usuario) });
}

export async function login(req: Request, res: Response) {
  requireFields(req.body, ["email", "senha"]);
  const { email, senha } = req.body as { email: string; senha: string };

  const usuario = await Usuario.findOne({ email: email.toLowerCase() });
  if (!usuario) {
    throw new AppError("Credenciais inválidas", 401);
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    throw new AppError("Credenciais inválidas", 401);
  }

  const token = signToken(String(usuario._id));
  res.json({ token, usuario: toPublicUser(usuario) });
}

export async function logout(_req: Request, res: Response) {
  // JWT is stateless — logout is handled client-side by discarding the token.
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const usuario = await Usuario.findById(req.auth?.userId);
  if (!usuario) {
    throw new AppError("Utilizador não encontrado", 404);
  }
  res.json({ usuario: toPublicUser(usuario) });
}
