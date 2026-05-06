import jwt from "jsonwebtoken";

export function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado.");
  }
  return jwt.sign(
    {
      sub: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado.");
  }
  return jwt.verify(token, process.env.JWT_SECRET);
}
