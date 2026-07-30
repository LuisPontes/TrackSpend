import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireGrupoMembro } from "../middleware/requireGrupoMembro";
import { listar, marcarLido } from "../controllers/notificacoesController";

const router = Router({ mergeParams: true });

router.use(requireAuth, requireGrupoMembro);

router.get("/", listar);
router.patch("/:id/lido", marcarLido);

export default router;
