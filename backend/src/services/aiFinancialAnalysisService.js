import { prisma } from "../prisma.js";
import { isExpenseType, isIncomeType } from "../utils/account-types.js";

function brl(n) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n) || 0);
}

function sameMonth(d, ref) {
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

function daysInMonth(year, month0) {
  return new Date(year, month0 + 1, 0).getDate();
}

function categoryLabel(row) {
  return row.category?.name || "Sem categoria";
}

/**
 * Análise financeira local (regras) — respeita userId + organizationId.
 * @param {{ userId: string, organizationId: string }} ctx
 */
export async function analyzeFinancesLocally(ctx) {
  const { userId, organizationId } = ctx;

  const rows = await prisma.transaction.findMany({
    where: { userId, organizationId },
    include: { category: true },
    orderBy: { date: "asc" },
  });

  const now = new Date();
  const curMonthRef = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const dim = daysInMonth(now.getFullYear(), now.getMonth());
  const dayOfMonth = Math.min(now.getDate(), dim);

  let curIncome = 0;
  let curExpense = 0;
  let prevIncome = 0;
  let prevExpense = 0;

  const curMonthExpensesByCat = new Map(); // catName -> sum
  const prevMonthExpensesByCat = new Map();

  const lookbackCutoff = new Date(now.getTime() - 90 * 86400000);
  /** Despesas no histórico recente para médias */
  /** @type {{ amount: number, cat: string }[]} */
  const histExpenses = [];

  for (const r of rows) {
    const dt = new Date(r.date);
    const amt = Number(r.amount);

    if (isExpenseType(r.type) && dt >= lookbackCutoff && dt <= now) {
      histExpenses.push({ amount: amt, cat: categoryLabel(r) });
    }

    if (sameMonth(dt, curMonthRef)) {
      if (isIncomeType(r.type)) curIncome += amt;
      if (isExpenseType(r.type)) {
        curExpense += amt;
        const lbl = categoryLabel(r);
        curMonthExpensesByCat.set(lbl, (curMonthExpensesByCat.get(lbl) || 0) + amt);
      }
    } else if (sameMonth(dt, prevMonthRef)) {
      if (isIncomeType(r.type)) prevIncome += amt;
      if (isExpenseType(r.type)) {
        prevExpense += amt;
        const lbl = categoryLabel(r);
        prevMonthExpensesByCat.set(lbl, (prevMonthExpensesByCat.get(lbl) || 0) + amt);
      }
    }
  }

  const monthlyBalance = curIncome - curExpense;
  const expenseRatio =
    curIncome > 0 ? Math.min(curExpense / curIncome, 3) : curExpense > 0 ? 1.5 : 0;

  const totalCurCatExp = [...curMonthExpensesByCat.values()].reduce((s, x) => s + x, 0) || 1;
  let topCatName = "";
  let topCatPct = 0;
  for (const [name, val] of curMonthExpensesByCat.entries()) {
    const pct = val / totalCurCatExp;
    if (pct > topCatPct) {
      topCatPct = pct;
      topCatName = name;
    }
  }

  const spendingGrowth = prevExpense > 0 ? (curExpense - prevExpense) / prevExpense : 0;

  let score = 75;
  if (curIncome <= 0) score -= 25;
  else {
    if (expenseRatio > 1.05) score -= 28;
    else if (expenseRatio > 0.85) score -= 14;
    else if (expenseRatio > 0.6) score -= 8;
    if (monthlyBalance < -1) score -= 15;
    else if (monthlyBalance < 300) score -= 8;
    else if (monthlyBalance > 1000) score += 12;
    else if (monthlyBalance > 0) score += 6;
  }
  if (topCatPct > 0.5) score -= 12;
  else if (topCatPct > 0.4) score -= 6;
  if (spendingGrowth > 0.3) score -= 12;
  else if (spendingGrowth > 0.15) score -= 6;
  if (curExpense === 0 && curIncome >= 0) score += 4;

  score = Math.round(Math.max(0, Math.min(100, score)));

  let riskLevel = "medium";
  if (score >= 75) riskLevel = "low";
  else if (score < 50) riskLevel = "high";

  const anomalies = [];

  if (prevExpense > 0 && curExpense > prevExpense * 1.01) {
    anomalies.push({
      category: "Geral",
      message: `O total de despesas neste mês (${brl(curExpense)}) está acima do mês anterior (${brl(prevExpense)}).`,
      amount: Math.round((curExpense - prevExpense) * 100) / 100,
    });
  }

  for (const [cat, curVal] of curMonthExpensesByCat.entries()) {
    const prevVal = prevMonthExpensesByCat.get(cat) || 0;
    if (prevVal > 0 && curVal > prevVal * 1.3) {
      anomalies.push({
        category: cat,
        message: `Gasto em "${cat}" subiu mais de 30% em relação ao mês anterior.`,
        amount: Math.round((curVal - prevVal) * 100) / 100,
      });
    }
  }

  const byCatVals = new Map();
  for (const er of histExpenses) {
    const list = byCatVals.get(er.cat) || [];
    list.push(er.amount);
    byCatVals.set(er.cat, list);
  }

  const seenTxn = new Set();
  for (const r of rows) {
    if (!isExpenseType(r.type)) continue;
    const dt = new Date(r.date);
    if (!sameMonth(dt, curMonthRef)) continue;
    const cat = categoryLabel(r);
    const amt = Number(r.amount);
    const list = byCatVals.get(cat);
    const mean =
      list && list.length ? list.reduce((s, x) => s + x, 0) / Math.max(list.length, 1) : amt;
    if (seenTxn.has(r.id)) continue;
    seenTxn.add(r.id);
    if (amt >= 50 && amt > Math.max(mean, 1) * 2.2) {
      anomalies.push({
        category: cat,
        message: `Transação (${brl(amt)}) acima da média recente desta categoria (${brl(mean)}).`,
        amount: amt,
      });
    }
  }

  const uniqAnomalies = anomalies.slice(0, 8);

  const recommendations = [];
  if (topCatName && topCatPct >= 0.35) {
    const cutEst = Math.round(topCatPct * curExpense * 0.1 * 100) / 100;
    recommendations.push({
      title: `Reduza gastos em ${topCatName}`,
      description: `Esta categoria representa ${(topCatPct * 100).toFixed(1)}% das despesas do mês atual.`,
      impact: `Economia estimada de até ${brl(cutEst)} com corte de 10% apenas nesse grupo.`,
      priority: topCatPct >= 0.5 ? "high" : "medium",
    });
  }
  if (curIncome <= 0) {
    recommendations.push({
      title: "Cadastre suas receitas",
      description: "Sem receitas registradas no mês, fica impossível medir ritmo seguro de gastos.",
      impact: "Registre salário ou entradas recorrentes para ativar alertas mais precisos.",
      priority: "high",
    });
  }
  if (expenseRatio > 0.9 && curIncome > 0) {
    recommendations.push({
      title: "Revise o ritmo de despesas",
      description: `As despesas consomem cerca de ${((expenseRatio || 0) * 100).toFixed(1)}% das receitas do mês.`,
      impact: "Priorize cortes em assinaturas e gastos variáveis antes de tocar em metas de longo prazo.",
      priority: expenseRatio > 1.05 ? "high" : "medium",
    });
  }
  if (spendingGrowth > 0.25) {
    recommendations.push({
      title: "Despesas cresceram frente ao mês passado",
      description: `O volume de despesas subiu cerca de ${(spendingGrowth * 100).toFixed(1)}% em relação ao mês anterior.`,
      impact: "Revise cartões e compras parceladas que possam sustentar esse ritmo.",
      priority: "high",
    });
  }
  recommendations.push({
    title: "Defina metas mensuráveis",
    description: "Metas com valor e prazo ajudam a traduzir o score em ações concretas.",
    impact: "Use a tela de Metas para acompanhar progresso semana a semana.",
    priority: "low",
  });

  const avgDailyExpense = curExpense / Math.max(dayOfMonth, 1);
  const avgDailyIncome = curIncome / Math.max(dayOfMonth, 1);
  const projectedExpense = avgDailyExpense * dim;
  const projectedIncome = avgDailyIncome * dim;
  const projectedMonthBalance = projectedIncome - projectedExpense;

  const prevBalance = prevIncome - prevExpense;
  let trend = "neutral";
  if (projectedMonthBalance > prevBalance + 200) trend = "positive";
  if (projectedMonthBalance < prevBalance - 200 || projectedMonthBalance < 0) trend = "negative";

  let daysUntilNegative = null;
  if (projectedMonthBalance < 0 && avgDailyExpense > avgDailyIncome) {
    const dailyNet = avgDailyIncome - avgDailyExpense;
    const runway = monthlyBalance > 0 ? monthlyBalance / Math.abs(dailyNet) : 0;
    if (dailyNet < 0 && Number.isFinite(runway) && runway > 0 && runway < dim) {
      daysUntilNegative = Math.max(1, Math.ceil(runway));
    } else if (monthlyBalance <= 0 && curExpense > curIncome) {
      daysUntilNegative = Math.max(0, dim - dayOfMonth);
    }
  }

  const summaryParts = [
    `No mês atual, suas receitas somam ${brl(curIncome)} e despesas ${brl(curExpense)}, com saldo de ${brl(monthlyBalance)}.`,
    score >= 75
      ? "O padrão indica um mês relativamente sob controle; mantenha o acompanhamento."
      : score >= 50
        ? "Há espaço para ajustes pontuais em categorias ou ritmo de gastos."
        : "Atenção: o cenário sugere pressão sobre o caixa ou concentração de riscos.",
  ];
  if (topCatName) {
    summaryParts.push(`A maior concentração de despesas está em "${topCatName}".`);
  }

  return {
    summary: summaryParts.join(" "),
    riskLevel,
    score,
    recommendations: recommendations.slice(0, 8),
    forecast: {
      projectedMonthBalance: Math.round(projectedMonthBalance * 100) / 100,
      daysUntilNegative,
      trend,
    },
    anomalies: uniqAnomalies,
  };
}
