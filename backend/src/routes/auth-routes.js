import { Router } from "express";
import { getMe, login, register } from "../controllers/auth-controller.js";
import { requireAuth } from "../middlewares/auth.js";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", requireAuth, getMe);
