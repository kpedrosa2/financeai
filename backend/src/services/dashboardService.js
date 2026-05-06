import { prisma } from "../prisma.js";
import { isExpenseType, isIncomeType } from "../utils/account-types.js";

function monthKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function mapRecentRow(row) {
  const payload = row.payload && typeof row.payload === "object" ? row.payload : {};
  const rawCat =
    row.category?.name ||
    payload.category ||
    (payload.categoryName ? String(payload.categoryName) : null) ||
    "outros";
  const legacyType = isIncomeType(row.type) ? "receita" : isExpenseType(row.type) ? "despesa" : row.type;
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    date: row.date.toISOString().slice(0, 10),
    type: legacyType,
    category: String(rawCat).toLowerCase().replace(/\s+/g, "_"),
    status: payload.status || "pago",
    categoryId: row.categoryId || null,
    ...payload,
  };
}

export async function buildDashboard(ctx) {
  const { userId, organizationId } = ctx;

  const rows = await prisma.transaction.findMany({
    where: { userId, organizationId },
    include: { category: true },
    orderBy: { date: "asc" },
  });

  let incomeTotal = 0;
  let expenseTotal = 0;
  const transactionCount = rows.length;

  const monthTotals = new Map();

  function bumpMonth(date, income, expense) {
    const k = monthKey(date);
    const cur = monthTotals.get(k) || { income: 0, expense: 0 };
    cur.income += income;
    cur.expense += expense;
    monthTotals.set(k, cur);
  }

  const expenseByCategory = new Map();

  for (const row of rows) {
    const amt = Number(row.amount);
    if (isIncomeType(row.type)) {
      incomeTotal += amt;
      bumpMonth(row.date, amt, 0);
    } else if (isExpenseType(row.type)) {
      expenseTotal += amt;
      bumpMonth(row.date, 0, amt);
      const catId = row.categoryId ?? "uncategorized";
      const catName = row.category?.name || "Sem categoria";
      const prev = expenseByCategory.get(catId) || {
        categoryId: row.categoryId,
        categoryName: catName,
        total: 0,
      };
      prev.total += amt;
      expenseByCategory.set(catId, prev);
    }
  }

  const balance = incomeTotal - expenseTotal;

  const monthlyEvolution = [...monthTotals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      income: v.income,
      expense: v.expense,
      balance: v.income - v.expense,
    }));

  const expensesOnlyTotal = expenseTotal > 0 ? expenseTotal : 1;
  const expensesByCategory = [...expenseByCategory.values()]
    .map((c) => ({
      categoryId: c.categoryId ?? null,
      categoryName: c.categoryName,
      total: c.total,
      percentage: Math.round((c.total / expensesOnlyTotal) * 1000) / 10,
    }))
    .sort((a, b) => b.total - a.total);

  const recentDb = await prisma.transaction.findMany({
    where: { userId, organizationId },
    include: { category: true },
    orderBy: { date: "desc" },
    take: 10,
  });

  const recentTransactions = recentDb.map(mapRecentRow);

  return {
    summary: {
      balance,
      incomeTotal,
      expenseTotal,
      transactionCount,
    },
    monthlyEvolution,
    expensesByCategory,
    recentTransactions,
  };
}
