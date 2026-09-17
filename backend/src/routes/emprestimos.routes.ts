import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireGrupoMembro } from "../middleware/requireGrupoMembro";
import { listar, criar, editar, registarPagamento, removerPagamento, remover } from "../controllers/emprestimosController";

const router = Router({ mergeParams: true });

router.use(requireAuth, requireGrupoMembro);

router.get("/", listar);
router.post("/", criar);
router.put("/:id", editar);
router.post("/:id/pagamentos", registarPagamento);
router.delete("/:id/pagamentos/:pagamentoId", removerPagamento);
router.delete("/:id", remover);

export default router;
