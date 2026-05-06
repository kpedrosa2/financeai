import { prisma } from "../prisma.js";
import { isExpenseType, isIncomeType } from "../utils/account-types.js";

function txnTypeLabelFromRow(typeRaw) {
  const t = String(typeRaw || "").toLowerCase();
  if (t === "investimento") return "investimento";
  if (isIncomeType(t)) return "receita";
  if (isExpenseType(t) || t === "despesa" || t === "expense") return "despesa";
  return "despesa";
}

function normalize(data) {
  return JSON.parse(JSON.stringify(data));
}

function orgWhere(ctx) {
  return { userId: ctx.userId, organizationId: ctx.organizationId };
}

export async function listCategories(ctx) {
  return prisma.category.findMany({
    where: orgWhere(ctx),
    orderBy: { createdAt: "desc" },
  });
}

export async function createCategory(ctx, data) {
  return prisma.category.create({
    data: {
      ...data,
      userId: ctx.userId,
      organizationId: ctx.organizationId,
    },
  });
}

export async function updateCategory(ctx, id, data) {
  const item = await prisma.category.findFirst({ where: { id, ...orgWhere(ctx) } });
  if (!item) throw notFound();
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(ctx, id) {
  const item = await prisma.category.findFirst({ where: { id, ...orgWhere(ctx) } });
  if (!item) throw notFound();
  await prisma.category.delete({ where: { id } });
  return { ok: true };
}

function paymentPayloadToLabel(pm) {
  const p = String(pm || "").toLowerCase();
  if (!p) return "PIX";
  if (p.includes("pix")) return "PIX";
  if (p === "dinheiro") return "Dinheiro";
  if (p === "boleto") return "Boleto";
  if (p === "transferencia") return "Transferência";
  if (p.includes("debit")) return "Cartão";
  if (p.includes("cartao")) return "Cartão";
  return "PIX";
}

/** Sugestões inteligentes por descrições já usadas (Histórico local). */
export async function getTransactionSuggestions(ctx, query) {
  const q = String(query || "").trim();
  if (q.length < 2) {
    return { suggestions: [] };
  }

  const rows = await prisma.transaction.findMany({
    where: {
      ...orgWhere(ctx),
      description: { contains: q, mode: "insensitive" },
    },
    include: { category: true },
    orderBy: { date: "desc" },
    take: 150,
  });

  const ql = q.toLowerCase();
  const byDesc = new Map();

  for (const r of rows) {
    const normalized = r.description.trim().replace(/\s+/g, " ");
    const key = normalized.toLowerCase();
    if (!key.includes(ql)) continue;
    if (byDesc.has(key)) continue;

    const payload = r.payload && typeof r.payload === "object" ? r.payload : {};
    const pmRaw =
      typeof payload.payment_method === "string" && payload.payment_method.trim()
        ? payload.payment_method.trim()
        : "";

    const slug = typeof payload.category === "string" ? payload.category : null;

    byDesc.set(key, {
      description: normalized,
      categoryId: r.categoryId,
      categoryName: r.category?.name || null,
      category: slug,
      payment_method: pmRaw || null,
      paymentMethod: paymentPayloadToLabel(pmRaw),
      type: txnTypeLabelFromRow(r.type),
    });
    if (byDesc.size >= 10) break;
  }

  return { suggestions: [...byDesc.values()] };
}

export async function listTransactions(ctx) {
  const rows = await prisma.transaction.findMany({
    where: orgWhere(ctx),
    orderBy: { date: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    date: row.date.toISOString().slice(0, 10),
    categoryId: row.categoryId,
    created_date: row.createdAt.toISOString(),
    ...((row.payload && typeof row.payload === "object") ? row.payload : {}),
  }));
}

export async function createTransaction(ctx, data) {
  const created = await prisma.transaction.create({
    data: {
      description: data.description,
      amount: data.amount,
      type: data.type,
      date: new Date(data.date),
      categoryId: data.categoryId ?? null,
      payload: data.payload ?? {},
      userId: ctx.userId,
      organizationId: ctx.organizationId,
    },
  });
  return {
    id: created.id,
    description: created.description,
    amount: Number(created.amount),
    type: created.type,
    date: created.date.toISOString().slice(0, 10),
    categoryId: created.categoryId,
    created_date: created.createdAt.toISOString(),
    ...normalize(created.payload ?? {}),
  };
}

export async function updateTransaction(ctx, id, data) {
  const existing = await prisma.transaction.findFirst({ where: { id, ...orgWhere(ctx) } });
  if (!existing) throw notFound();
  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      description: data.description ?? existing.description,
      amount: data.amount ?? Number(existing.amount),
      type: data.type ?? existing.type,
      date: data.date ? new Date(data.date) : existing.date,
      categoryId: data.categoryId ?? existing.categoryId,
      payload: { ...(existing.payload ?? {}), ...(data.payload ?? {}) },
      organizationId: ctx.organizationId,
    },
  });
  return {
    id: updated.id,
    description: updated.description,
    amount: Number(updated.amount),
    type: updated.type,
    date: updated.date.toISOString().slice(0, 10),
    categoryId: updated.categoryId,
    created_date: updated.createdAt.toISOString(),
    ...normalize(updated.payload ?? {}),
  };
}

export async function deleteTransaction(ctx, id) {
  const existing = await prisma.transaction.findFirst({ where: { id, ...orgWhere(ctx) } });
  if (!existing) throw notFound();
  await prisma.transaction.delete({ where: { id } });
  return { ok: true };
}

export async function listEntityRecords(ctx, entity, query) {
  const where = { ...orgWhere(ctx), entity };
  let rows = await prisma.entityRecord.findMany({ where, orderBy: { createdAt: "desc" } });
  rows = rows.map((row) => ({ id: row.id, created_date: row.createdAt.toISOString(), ...normalize(row.data) }));
  return rows.filter((row) => Object.entries(query || {}).every(([k, v]) => row[k] === v));
}

export async function createEntityRecord(ctx, entity, data) {
  const row = await prisma.entityRecord.create({
    data: {
      entity,
      data,
      userId: ctx.userId,
      organizationId: ctx.organizationId,
    },
  });
  return { id: row.id, created_date: row.createdAt.toISOString(), ...normalize(row.data) };
}

export async function updateEntityRecord(ctx, entity, id, data) {
  const existing = await prisma.entityRecord.findFirst({ where: { id, entity, ...orgWhere(ctx) } });
  if (!existing) throw notFound();
  const row = await prisma.entityRecord.update({
    where: { id },
    data: { data: { ...(existing.data ?? {}), ...data } },
  });
  return { id: row.id, created_date: row.createdAt.toISOString(), ...normalize(row.data) };
}

export async function deleteEntityRecord(ctx, entity, id) {
  const existing = await prisma.entityRecord.findFirst({ where: { id, entity, ...orgWhere(ctx) } });
  if (!existing) throw notFound();
  await prisma.entityRecord.delete({ where: { id } });
  return { ok: true };
}

function notFound() {
  const err = new Error("Registro não encontrado.");
  err.status = 404;
  return err;
}
