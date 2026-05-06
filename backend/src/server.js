import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { prisma } from "./prisma.js";
import { authRoutes } from "./routes/auth-routes.js";
import { domainRoutes } from "./routes/domain-routes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import { insightRoutes } from "./routes/insightRoutes.js";
import { aiRoutes } from "./routes/aiRoutes.js";
import { errorHandler } from "./middlewares/error-handler.js";

function requireEnv(name) {
  if (!process.env[name]?.trim()) {
    console.error(`Variável obrigatória ausente: ${name}`);
    process.exit(1);
  }
}

requireEnv("DATABASE_URL");
requireEnv("JWT_SECRET");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/api/health", async (_req, res) => {
  const timestamp = new Date().toISOString();
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    res.json({
      status: "ok",
      database: "connected",
      timestamp,
    });
  } catch {
    res.status(503).json({
      status: "degraded",
      database: "disconnected",
      timestamp,
    });
  }
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register", loginLimiter);

app.use("/api/auth", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", insightRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", domainRoutes);

app.use(errorHandler);

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});
