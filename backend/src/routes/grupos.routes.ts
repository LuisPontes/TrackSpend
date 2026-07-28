import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireGrupoMembro } from "../middleware/requireGrupoMembro";
import {
  listar,
  criar,
  obter,
  editar,
  eliminar,
  adicionarMembro,
  removerMembro,
} from "../controllers/gruposController";

const router = Router();

router.use(requireAuth);

router.get("/", listar);
router.post("/", criar);
router.get("/:grupoId", requireGrupoMembro, obter);
router.put("/:grupoId", requireGrupoMembro, editar);
router.delete("/:grupoId", requireGrupoMembro, eliminar);
router.post("/:grupoId/membros", requireGrupoMembro, adicionarMembro);
router.delete("/:grupoId/membros/:usuarioId", requireGrupoMembro, removerMembro);

export default router;
