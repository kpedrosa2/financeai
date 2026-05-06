import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_SLUG = "demo-financeai-local";

function dayAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(12, 0, 0, 0);
  return d;
}

async function main() {
  const existingOrg = await prisma.organization.findUnique({ where: { slug: DEMO_SLUG } });
  if (existingOrg) {
    await prisma.user.deleteMany({ where: { organizationId: existingOrg.id } });
    await prisma.organization.delete({ where: { id: existingOrg.id } });
  }

  const passwordHash = await bcrypt.hash("demo123456", 10);

  const org = await prisma.organization.create({
    data: {
      name: "Demo FinanceAI",
      slug: DEMO_SLUG,
      plan: "FREE",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@financeai.local",
      passwordHash,
      organizationId: org.id,
      role: "OWNER",
    },
  });

  await prisma.category.createMany({
    data: [
      { name: "Salário", type: "income", userId: user.id, organizationId: org.id },
      { name: "Freelance", type: "income", userId: user.id, organizationId: org.id },
      { name: "Alimentação", type: "expense", userId: user.id, organizationId: org.id },
      { name: "Transporte", type: "expense", userId: user.id, organizationId: org.id },
      { name: "Moradia", type: "expense", userId: user.id, organizationId: org.id },
      { name: "Saúde", type: "expense", userId: user.id, organizationId: org.id },
      { name: "Lazer", type: "expense", userId: user.id, organizationId: org.id },
    ],
  });

  const createdCats = await prisma.category.findMany({ where: { organizationId: org.id } });
  const byName = Object.fromEntries(createdCats.map((c) => [c.name, c]));

  const txPayload = [];

  for (let m = 0; m < 3; m++) {
    txPayload.push(
      {
        description: `Salário ${m + 1}`,
        amount: 9000 + m * 120,
        type: "income",
        date: dayAgo(m * 32 + 1),
        categoryId: byName["Salário"]?.id ?? null,
        payload: { category: "salario", status: "pago" },
      },
      {
        description: `Freelance ${m + 1}`,
        amount: 1200 + m * 150,
        type: "income",
        date: dayAgo(m * 30 + 3),
        categoryId: byName["Freelance"]?.id ?? null,
        payload: { category: "freelance", status: "pago" },
      },
      {
        description: `Mercado ${m + 1}`,
        amount: 1400 + m * 260,
        type: "expense",
        date: dayAgo(m * 31 + 2),
        categoryId: byName["Alimentação"]?.id ?? null,
        payload: { category: "alimentacao", status: "pago" },
      },
      {
        description: `Transporte ${m + 1}`,
        amount: 420 + m * 80,
        type: "expense",
        date: dayAgo(m * 29 + 4),
        categoryId: byName["Transporte"]?.id ?? null,
        payload: { category: "transporte", status: "pago" },
      },
      {
        description: `Aluguel ${m + 1}`,
        amount: 3100 + m * 50,
        type: "expense",
        date: dayAgo(m * 33 + 5),
        categoryId: byName["Moradia"]?.id ?? null,
        payload: { category: "moradia", status: "pago" },
      },
      {
        description: `Lazer ${m + 1}`,
        amount: 380 + m * 120,
        type: "expense",
        date: dayAgo(m * 28 + 6),
        categoryId: byName["Lazer"]?.id ?? null,
        payload: { category: "lazer", status: "pago" },
      },
    );
  }

  await prisma.transaction.createMany({
    data: txPayload.map((t) => ({
      description: t.description.slice(0, 200),
      amount: t.amount,
      type: t.type,
      date: t.date,
      categoryId: t.categoryId,
      payload: t.payload ?? {},
      userId: user.id,
      organizationId: org.id,
    })),
  });

  console.log("Seed concluído: demo@financeai.local / demo123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
