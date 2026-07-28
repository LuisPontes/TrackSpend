import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireGrupoMembro } from "../middleware/requireGrupoMembro";
import { obterDashboard } from "../controllers/dashboardController";

const router = Router({ mergeParams: true });

router.use(requireAuth, requireGrupoMembro);

router.get("/:mes/:ano", obterDashboard);

export default router;
