import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireGrupoMembro } from "../middleware/requireGrupoMembro";
import { listar, listarAnos, criar, obter, editar, remover } from "../controllers/despesasController";

const router = Router({ mergeParams: true });

router.use(requireAuth, requireGrupoMembro);

router.get("/", listar);
router.post("/", criar);
router.get("/anos", listarAnos);
router.get("/:id", obter);
router.put("/:id", editar);
router.delete("/:id", remover);

export default router;
