import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireGrupoMembro } from "../middleware/requireGrupoMembro";
import { listar, criar, editar, remover } from "../controllers/categoriasController";

const router = Router({ mergeParams: true });

router.use(requireAuth, requireGrupoMembro);

router.get("/", listar);
router.post("/", criar);
router.put("/:id", editar);
router.delete("/:id", remover);

export default router;
