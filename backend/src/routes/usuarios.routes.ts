import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { listar } from "../controllers/usuariosController";

const router = Router();

router.use(requireAuth);

router.get("/", listar);

export default router;
