import { loginSchema, registerSchema } from "../validators/auth-validator.js";
import { loginUser, me, registerUser } from "../services/auth-service.js";

export async function register(req, res, next) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await registerUser(input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await me(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}
