import "express-async-errors";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import gruposRoutes from "./routes/grupos.routes";
import despesasRoutes from "./routes/despesas.routes";
import categoriasRoutes from "./routes/categorias.routes";
import orcamentosRoutes from "./routes/orcamentos.routes";
import acertosRoutes from "./routes/acertos.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/grupos/:grupoId/despesas", despesasRoutes);
app.use("/api/grupos/:grupoId/categorias", categoriasRoutes);
app.use("/api/grupos/:grupoId/orcamentos", orcamentosRoutes);
app.use("/api/grupos/:grupoId/acertos", acertosRoutes);
app.use("/api/grupos/:grupoId/dashboard", dashboardRoutes);

app.use(errorHandler);

const port = process.env.PORT ?? 4000;

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`TrackSpend API listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });
