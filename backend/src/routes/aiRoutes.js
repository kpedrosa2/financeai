import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middlewares/auth.js";
import { postAnalyze } from "../controllers/aiController.js";

export const aiRoutes = Router();

const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

aiRoutes.use(requireAuth);
aiRoutes.post("/analyze", analyzeLimiter, postAnalyze);
