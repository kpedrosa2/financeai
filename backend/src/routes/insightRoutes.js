import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getInsights } from "../controllers/insightController.js";

export const insightRoutes = Router();

insightRoutes.use(requireAuth);
insightRoutes.get("/insights", getInsights);
