import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getDashboard } from "../controllers/dashboardController.js";

export const dashboardRoutes = Router();

dashboardRoutes.use(requireAuth);
dashboardRoutes.get("/dashboard", getDashboard);
