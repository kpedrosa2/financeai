import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAccount } from "@/lib/AccountContext";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Target,
  AlertTriangle,
  Sparkles,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { formatCurrency } from "../components/utils/formatters";

import StatsCard from "../components/dashboard/StatsCard";
import SpendingChart from "../components/dashboard/SpendingChart";
import DebtProgress from "../components/dashboard/DebtProgress";
import AIInsights from "../components/dashboard/AIInsights";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import MonthlyOverview from "../components/dashboard/MonthlyOverview";

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export default function Dashboard() {
  const { account } = useAccount();
  const [user, setUser] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Alternar entre Saldo e Receita a cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setShowIncome(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions', account?.id],
    queryFn: () => account ? base44.entities.Transaction.filter({ account_id: account.id }, '-date') : [],
    enabled: !!account,
    initialData: [],
  });

  const { data: debts = [], isLoading: loadingDebts } = useQuery({
    queryKey: ['debts', account?.id],
    queryFn: () => account ? base44.entities.Debt.filter({ account_id: account.id }) : [],
    enabled: !!account,
    initialData: [],
  });

  const { data: goals = [], isLoading: loadingGoals } = useQuery({
    queryKey: ['goals', account?.id],
    queryFn: () => account ? base44.entities.Goal.filter({ account_id: account.id }) : [],
    enabled: !!account,
    initialData: [],
  });

  const navigateMonth = (dir) => {
    let m = selectedMonth + dir;
    let y = selectedYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setSelectedMonth(m);
    setSelectedYear(y);
    setAiInsights(null);
  };

  // Calcular métricas
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date + 'T12:00:00');
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  const monthlyIncome = monthTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = monthlyIncome - monthlyExpenses;

  const totalDebt = debts
    .filter(d => d.status === 'ativa')
    .reduce((sum, d) => sum + d.current_amount, 0);

  const activePaidTransactions = monthTransactions.filter(t => t.status === 'pago');
  const paidExpenses = activePaidTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  // Gerar insights com Base44 IA
  const generateAIInsights = async () => {
    setLoadingInsights(true);
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
    .filter(t => t.type === 'despesa')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {})
)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([cat, val]) => `- ${cat}: R$ ${val.toFixed(2)}`)
  .join('\n')}

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
            projection: { type: "string" }
          }
        }
      });

      setAiInsights(result);
    } catch (error) {
      console.error("Erro ao gerar insights:", error);
    }
    setLoadingInsights(false);
  };

  useEffect(() => {
    if (transactions.length > 0 && !aiInsights) {
      generateAIInsights();
    }
  }, [transactions, aiInsights]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Olá, {user?.full_name?.split(' ')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-purple-300">
            Aqui está seu resumo financeiro de {MONTHS[selectedMonth]} de {selectedYear}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Seletor de mês */}
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 px-2 py-1">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-purple-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium text-sm min-w-[110px] text-center">
                {MONTHS[selectedMonth]} {selectedYear}
              </span>
            </div>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-purple-300 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Button
            onClick={generateAIInsights}
            disabled={loadingInsights}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/50"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {loadingInsights ? 'Analisando...' : 'Análise IA'}
          </Button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants}>
          <StatsCard
            title={showIncome ? "Receitas do Mês" : "Saldo Disponível"}
            value={formatCurrency(showIncome ? monthlyIncome : balance)}
            icon={showIncome ? TrendingUp : DollarSign}
            trend={showIncome ? "positive" : (balance > 0 ? "positive" : "negative")}
            trendValue={showIncome ? `${monthTransactions.filter(t => t.type === 'receita').length} transações` : `${((balance / (user?.net_salary || 10000)) * 100).toFixed(1)}%`}
            gradient={showIncome ? "from-emerald-500 to-teal-500" : "from-emerald-500 to-teal-500"}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title="Despesas do Mês"
            value={formatCurrency(monthlyExpenses)}
            icon={TrendingDown}
            trend="neutral"
            trendValue={`${monthTransactions.filter(t => t.type === 'despesa').length} transações`}
            gradient="from-rose-500 to-pink-500"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title="Dívidas Ativas"
            value={formatCurrency(totalDebt)}
            icon={CreditCard}
            trend="negative"
            trendValue={`${debts.filter(d => d.status === 'ativa').length} dívidas`}
            gradient="from-orange-500 to-amber-500"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title="Progresso Metas"
            value={`${goals.length > 0 ? ((goals[0]?.current_amount / goals[0]?.target_amount) * 100).toFixed(0) : 0}%`}
            icon={Target}
            trend="positive"
            trendValue={`${goals.filter(g => g.status === 'em_andamento').length} ativas`}
            gradient="from-purple-500 to-indigo-500"
          />
        </motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          <SpendingChart transactions={monthTransactions} />
          <MonthlyOverview 
            transactions={transactions}
            netSalary={user?.net_salary || 10000}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <AIInsights 
            insights={aiInsights}
            loading={loadingInsights}
            onRefresh={generateAIInsights}
          />
          <DebtProgress debts={debts} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <RecentTransactions transactions={monthTransactions.slice(0, 8)} />
      </motion.div>
    </div>
  );
}