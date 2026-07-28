import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireGrupoMembro } from "../middleware/requireGrupoMembro";
import { obterPorMes, criar, editar } from "../controllers/orcamentoController";

const router = Router({ mergeParams: true });

router.use(requireAuth, requireGrupoMembro);

router.get("/:mes/:ano", obterPorMes);
router.post("/", criar);
router.put("/:id", editar);

export default router;
