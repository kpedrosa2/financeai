import bcrypt from "bcrypt";
import { prisma } from "../prisma.js";
import { signToken } from "../utils/jwt.js";
import { makeUniqueSlug } from "../utils/slug.js";

export async function registerUser(input) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    const err = new Error("E-mail já cadastrado.");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const orgName = `Organização de ${input.name}`.slice(0, 120);

  const result = await prisma.$transaction(async (tx) => {
    let attempts = 0;
    let org;
    while (attempts < 8) {
      const slug = makeUniqueSlug(`${input.email.split("@")[0]}-${input.name}`);
      try {
        org = await tx.organization.create({
          data: {
            name: orgName,
            slug,
            plan: "FREE",
          },
        });
        break;
      } catch (e) {
        if (e?.code !== "P2002") throw e;
        attempts += 1;
      }
    }
    if (!org) {
      const err = new Error("Não foi possível criar a organização.");
      err.status = 500;
      throw err;
    }

    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        organizationId: org.id,
        role: "OWNER",
      },
      include: { organization: true },
    });
    const token = signToken(user);
    return { token, user };
  });

  return { token: result.token, user: sanitizeUser(result.user) };
}

export async function loginUser(input) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { organization: true },
  });
  if (!user) {
    const err = new Error("Credenciais inválidas.");
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    const err = new Error("Credenciais inválidas.");
    err.status = 401;
    throw err;
  }
  const token = signToken(user);
  return { token, user: sanitizeUser(user) };
}

export async function me(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  });
  if (!user) {
    const err = new Error("Usuário não encontrado.");
    err.status = 404;
    throw err;
  }
  return sanitizeUser(user);
}

function sanitizeUser(user) {
  const org = user.organization;
  return {
    id: user.id,
    email: user.email,
    full_name: user.name,
    name: user.name,
    createdAt: user.createdAt,
    organizationId: user.organizationId,
    organization_id: user.organizationId,
    role: user.role,
    organization: org
      ? {
          id: org.id,
          name: org.name,
          slug: org.slug,
          plan: org.plan,
        }
      : undefined,
  };
}
