import { execFile } from "node:child_process";
import path from "node:path";
import { Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";

const SCRIPT_PATH = path.resolve(__dirname, "../../../scripts/backup-db.sh");

let backupEmCurso = false;

export async function executar(_req: Request, res: Response) {
  if (backupEmCurso) {
    throw new AppError("Já existe um backup em curso, aguarda que termine", 409);
  }

  backupEmCurso = true;
  try {
    const stdout = await new Promise<string>((resolve, reject) => {
      execFile(
        "bash",
        [SCRIPT_PATH],
        { timeout: 5 * 60 * 1000, maxBuffer: 10 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            reject(new AppError(`Falha ao executar o backup: ${stderr || error.message}`, 500));
            return;
          }
          resolve(stdout);
        }
      );
    });

    const mensagem = stdout.trim().split("\n").pop() ?? "Backup concluído";
    res.json({ sucesso: true, mensagem });
  } finally {
    backupEmCurso = false;
  }
}
