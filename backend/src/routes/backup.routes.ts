import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { executar } from "../controllers/backupController";

const router = Router();

router.use(requireAuth);

router.post("/", executar);

export default router;
