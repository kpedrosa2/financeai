import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAccount } from "@/lib/AccountContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Target,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "../components/utils/formatters";
import { api } from "@/services/api";

import StatsCard from "../components/dashboard/StatsCard";
import SpendingChart from "../components/dashboard/SpendingChart";
import DebtProgress from "../components/dashboard/DebtProgress";
import AIInsights from "../components/dashboard/AIInsights";
import FinanceInsights from "../components/dashboard/FinanceInsights";
import AIFinancialAnalysis from "../components/dashboard/AIFinancialAnalysis";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import MonthlyOverview from "../components/dashboard/MonthlyOverview";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { account } = useAccount();
  const [user, setUser] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: dashboard, isPending: dashboardPending } = useQuery({
    queryKey: ["api-dashboard", account?.id],
    queryFn: () => api.get("/dashboard"),
    enabled: !!account,
    placeholderData: null,
  });

  const {
    data: insightPayload,
    isFetching: loadingRuleInsights,
    refetch: refetchRuleInsights,
  } = useQuery({
    queryKey: ["api-insights", account?.id],
    queryFn: () => api.get("/insights"),
    enabled: !!account,
    placeholderData: { insights: [] },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", account?.id],
    queryFn: () => (account ? base44.entities.Transaction.filter({ account_id: account.id }, "-date") : []),
    enabled: !!account,
    initialData: [],
  });

  const { data: debts = [] } = useQuery({
    queryKey: ["debts", account?.id],
    queryFn: () => (account ? base44.entities.Debt.filter({ account_id: account.id }) : []),
    enabled: !!account,
    initialData: [],
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals", account?.id],
    queryFn: () => (account ? base44.entities.Goal.filter({ account_id: account.id }) : []),
    enabled: !!account,
    initialData: [],
  });

  const navigateMonth = (dir) => {
    let m = selectedMonth + dir;
    let y = selectedYear;
    if (m > 11) {
      m = 0;
      y++;
    }
    if (m < 0) {
      m = 11;
      y--;
    }
    setSelectedMonth(m);
    setSelectedYear(y);
    setAiInsights(null);
  };

  const monthTransactions = transactions.filter((t) => {
    const date = new Date(t.date + "T12:00:00");
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  const monthlyIncome = monthTransactions.filter((t) => t.type === "receita").reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthTransactions.filter((t) => t.type === "despesa").reduce((sum, t) => sum + t.amount, 0);

  const balance = monthlyIncome - monthlyExpenses;

  const totalDebt = debts.filter((d) => d.status === "ativa").reduce((sum, d) => sum + d.current_amount, 0);

  const summary = dashboard?.summary;

  const generateAIInsights = async () => {
    setLoadingAi(true);
    try {
      const prompt = `
Analise esta situação financeira e forneça insights:

Salário líquido: R$ ${user?.net_salary || 10000}
Receitas do mês: R$ ${monthlyIncome.toFixed(2)}
Despesas do mês: R$ ${monthlyExpenses.toFixed(2)}
Saldo disponível: R$ ${balance.toFixed(2)}
Total de dívidas: R$ ${totalDebt.toFixed(2)}

Principais gastos por categoria:
${Object.entries(
  monthTransactions
    .filter((t) => t.type === "despesa")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {}),
)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([cat, val]) => `- ${cat}: R$ ${val.toFixed(2)}`)
  .join("\n")}

Retorne um JSON com:
{
  "alert": "Alerta sobre gastos excessivos",
  "saving_tip": "Recomendação de economia",
  "debt_strategy": "Estratégia para dívidas",
  "projection": "Projeção financeira"
}
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            alert: { type: "string" },
            saving_tip: { type: "string" },
            debt_strategy: { type: "string" },
            projection: { type: "string" },
          },
        },
      });

      setAiInsights(result);
    } catch (error) {
      console.error("Erro ao gerar insights:", error);
    }
    setLoadingAi(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const ruleInsights = insightPayload?.insights ?? [];

  const refreshRuleInsights = () => {
    queryClient.invalidateQueries({ queryKey: ["api-insights"] });
    refetchRuleInsights();
  };

  const hasNoTransactions =
    !!account &&
    !dashboardPending &&
    (summary?.transactionCount ?? 0) === 0 &&
    (transactions?.length ?? 0) === 0;

  return (
    <div className="p-4 md:p-8 flex flex-col gap-10 lg:gap-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-balance"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Olá, {user?.full_name?.split(" ")[0] || "Usuário"}! 👋
          </h1>
          <p className="text-purple-200/95">
            Aqui está seu resumo financeiro de {MONTHS[selectedMonth]} de {selectedYear}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 px-2 py-1 shadow-sm shadow-black/20">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-purple-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="w-4 h-4 text-purple-300" aria-hidden />
              <span className="text-white font-medium text-sm min-w-[110px] text-center">
                {MONTHS[selectedMonth]} {selectedYear}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-purple-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Button
            type="button"
            onClick={generateAIInsights}
            disabled={loadingAi}
            variant="outline"
            className="border-purple-400/35 text-purple-100 hover:bg-white/10 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {loadingAi ? "Analisando..." : "Dicas rápidas (local)"}
          </Button>
        </div>
      </motion.div>

      {dashboardPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-[140px] rounded-xl bg-white/10" />
          ))}
        </div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div variants={itemVariants}>
              <StatsCard
                title="Saldo atual"
                value={formatCurrency(summary?.balance ?? 0)}
                icon={DollarSign}
                trend={(summary?.balance ?? 0) >= 0 ? "positive" : "negative"}
                trendValue={`Receitas − despesas (todas)`}
                gradient="from-emerald-500 to-teal-500"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <StatsCard
                title="Receitas totais"
                value={formatCurrency(summary?.incomeTotal ?? 0)}
                icon={TrendingUp}
                trend="positive"
                trendValue={`${transactions.filter((t) => t.type === "receita").length} receitas`}
                gradient="from-emerald-500 to-teal-500"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <StatsCard
                title="Despesas totais"
                value={formatCurrency(summary?.expenseTotal ?? 0)}
                icon={TrendingDown}
                trend="neutral"
                trendValue={`${transactions.filter((t) => t.type === "despesa").length} despesas`}
                gradient="from-rose-500 to-pink-500"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <StatsCard
                title="Transações cadastradas"
                value={`${summary?.transactionCount ?? 0}`}
                icon={ListOrdered}
                trend="neutral"
                trendValue="Todos os períodos"
                gradient="from-indigo-500 to-purple-500"
              />
            </motion.div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div variants={itemVariants}>
              <StatsCard
                title="Saldo do mês"
                value={formatCurrency(balance)}
                icon={DollarSign}
                trend={balance >= 0 ? "positive" : "negative"}
                trendValue={`${monthTransactions.filter((t) => t.type === "receita").length} receitas no mês`}
                gradient="from-emerald-500 to-teal-500"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <StatsCard
                title="Despesas do mês"
                value={formatCurrency(monthlyExpenses)}
                icon={TrendingDown}
                trend="neutral"
                trendValue={`${monthTransactions.filter((t) => t.type === "despesa").length} transações`}
                gradient="from-rose-500 to-pink-500"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <StatsCard
                title="Dívidas ativas"
                value={formatCurrency(totalDebt)}
                icon={CreditCard}
                trend="negative"
                trendValue={`${debts.filter((d) => d.status === "ativa").length} dívidas`}
                gradient="from-orange-500 to-amber-500"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <StatsCard
                title="Progresso metas"
                value={`${goals.length > 0 ? ((goals[0]?.current_amount / goals[0]?.target_amount) * 100).toFixed(0) : 0}%`}
                icon={Target}
                trend="positive"
                trendValue={`${goals.filter((g) => g.status === "em_andamento").length} ativas`}
                gradient="from-purple-500 to-indigo-500"
              />
            </motion.div>
          </motion.div>
        </>
      )}

      {hasNoTransactions && (
        <Card className="border-purple-400/35 bg-purple-950/25 backdrop-blur-md">
          <CardContent className="py-6 text-purple-50 text-center text-sm md:text-base space-y-2">
            <p className="text-white font-semibold">Nenhuma transação encontrada nesta conta.</p>
            <p className="text-purple-200/95 max-w-lg mx-auto">
              Cadastre receitas e despesas na área <span className="text-white font-medium">Transações</span> para
              liberar gráficos, insights e previsões com maior precisão.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 min-w-0">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8 min-w-0">
          {dashboardPending ? (
            <div className="space-y-6">
              <Skeleton className="h-[310px] w-full rounded-xl bg-white/10" />
              <Skeleton className="h-[310px] w-full rounded-xl bg-white/10" />
            </div>
          ) : (
            <>
              <SpendingChart
                expensesByCategory={dashboard?.expensesByCategory}
                transactions={monthTransactions}
              />
              <MonthlyOverview
                monthlyEvolution={dashboard?.monthlyEvolution}
                transactions={transactions}
                netSalary={user?.net_salary || 10000}
              />
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-6 lg:space-y-8 min-w-0"
        >
          <AIFinancialAnalysis disabled={!account} />
          <FinanceInsights insights={ruleInsights} loading={loadingRuleInsights} onRefresh={refreshRuleInsights} />
          <AIInsights insights={aiInsights} loading={loadingAi} onRefresh={generateAIInsights} />
          <DebtProgress debts={debts} />
        </motion.div>
      </div>

      {!dashboardPending && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="pb-6"
        >
          <RecentTransactions
            transactions={
              dashboard?.recentTransactions ?? (transactions.length ? monthTransactions.slice(0, 8) : [])
            }
          />
        </motion.div>
      )}
    </div>
  );
}
