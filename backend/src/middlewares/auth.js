import { verifyToken } from "../utils/jwt.js";
import { prisma } from "../prisma.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Token não informado." });
  }

  try {
    const payload = verifyToken(token);
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { organization: true },
    });
    if (!dbUser) {
      return res.status(401).json({ message: "Usuário inválido ou removido." });
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      organizationId: dbUser.organizationId,
      role: dbUser.role,
    };
    req.organization = dbUser.organization;
    return next();
  } catch (err) {
    if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token inválido ou expirado." });
    }
    console.error("Auth middleware:", err);
    return res.status(401).json({ message: "Não foi possível validar sua sessão." });
  }
}
