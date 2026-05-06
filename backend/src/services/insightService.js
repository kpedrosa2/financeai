import { prisma } from "../prisma.js";
import { isExpenseType, isIncomeType } from "../utils/account-types.js";

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function aggregateMonth(rows, monthStart) {
  const next = addMonths(monthStart, 1);
  const inMonth = rows.filter((r) => r.date >= monthStart && r.date < next);
  let income = 0;
  let expense = 0;
  const byCategory = new Map();

  for (const r of inMonth) {
    const amt = Number(r.amount);
    if (isIncomeType(r.type)) income += amt;
    if (isExpenseType(r.type)) {
      expense += amt;
      const name = r.category?.name || "Sem categoria";
      byCategory.set(name, (byCategory.get(name) || 0) + amt);
    }
  }
  return { income, expense, balance: income - expense, byCategory };
}

export async function buildInsights(ctx) {
  const { userId, organizationId } = ctx;
  const now = new Date();
  const currentStart = startOfMonth(now);
  const prevStart = addMonths(currentStart, -1);

  const rows = await prisma.transaction.findMany({
    where: { userId, organizationId },
    include: { category: true },
  });

  const cur = aggregateMonth(rows, currentStart);
  const prev = aggregateMonth(rows, prevStart);

  const insights = [];

  if (cur.income === 0) {
    insights.push({
      type: "warning",
      title: "Sem receitas no mês",
      message:
        "Não há receitas registradas no mês atual. Cadastre entradas para acompanhar seu fluxo de caixa.",
      priority: "medium",
    });
  }

  if (cur.expense > cur.income && cur.income > 0) {
    insights.push({
      type: "danger",
      title: "Saldo mensal negativo",
      message: "Suas despesas ultrapassaram as receitas neste mês. Revise gastos recorrentes e prioridades.",
      priority: "high",
    });
  }

  if (prev.expense > 0 && cur.expense > prev.expense * 1.25) {
    const pct = Math.round(((cur.expense - prev.expense) / prev.expense) * 100);
    insights.push({
      type: "warning",
      title: "Evolução de despesas",
      message: `Suas despesas subiram cerca de ${pct}% em relação ao mês anterior (acima de 25%).`,
      priority: "high",
    });
  }

  const totalExp = cur.expense;
  if (totalExp > 0) {
    let topCat = null;
    let topVal = 0;
    for (const [name, val] of cur.byCategory.entries()) {
      if (val > topVal) {
        topCat = name;
        topVal = val;
      }
    }
    if (topCat && topVal / totalExp > 0.4) {
      const share = Math.round((topVal / totalExp) * 100);
      insights.push({
        type: "info",
        title: "Categoria dominante",
        message: `A categoria "${topCat}" concentra cerca de ${share}% das despesas deste mês.`,
        priority: "medium",
      });

      const minCut = Math.round(topVal * 0.1);
      const maxCut = Math.round(topVal * 0.2);
      insights.push({
        type: "success",
        title: "Sugestão de economia",
        message: `Tente reduzir de 10% a 20% os gastos com "${topCat}" (economia estimada entre R$ ${minCut} e R$ ${maxCut} no mês, neste patamar de gastos).`,
        priority: "low",
      });
    }
  }

  insights.sort((a, b) => {
    const p = { high: 3, medium: 2, low: 1 };
    return (p[b.priority] || 0) - (p[a.priority] || 0);
  });

  return { insights };
}
