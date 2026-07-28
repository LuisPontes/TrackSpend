import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireGrupoMembro } from "../middleware/requireGrupoMembro";
import { listar, criar, editar } from "../controllers/acertosController";

const router = Router({ mergeParams: true });

router.use(requireAuth, requireGrupoMembro);

router.get("/", listar);
router.post("/", criar);
router.put("/:id", editar);

export default router;
