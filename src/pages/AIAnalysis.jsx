import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAccount } from "@/lib/AccountContext";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

import SavingsSimulator from "../components/analysis/SavingsSimulator";

export default function AIAnalysis() {
  const { account } = useAccount();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', account?.id],
    queryFn: () => account ? base44.entities.Transaction.filter({ account_id: account.id }, '-date') : [],
    enabled: !!account,
    initialData: [],
  });

  const { data: debts = [] } = useQuery({
    queryKey: ['debts', account?.id],
    queryFn: () => account ? base44.entities.Debt.filter({ account_id: account.id }) : [],
    enabled: !!account,
    initialData: [],
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals', account?.id],
    queryFn: () => account ? base44.entities.Goal.filter({ account_id: account.id }) : [],
    enabled: !!account,
    initialData: [],
  });

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const monthlyIncome = monthTransactions
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyExpenses = monthTransactions
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalDebt = debts
        .filter(d => d.status === 'ativa')
        .reduce((sum, d) => sum + d.current_amount, 0);

      const categoryExpenses = monthTransactions
        .filter(t => t.type === 'despesa')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {});

      const topCategories = Object.entries(categoryExpenses)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat, val]) => `- ${cat}: R$ ${val.toFixed(2)}`)
        .join('\n') || '- Nenhum gasto registrado';

      const prompt = `Analise esta situação financeira e forneça insights DETALHADOS em português brasileiro:

DADOS FINANCEIROS:
- Salário líquido mensal: R$ ${user?.net_salary || 10000}
- Receitas do mês: R$ ${monthlyIncome.toFixed(2)}
- Despesas do mês: R$ ${monthlyExpenses.toFixed(2)}
- Saldo disponível: R$ ${(monthlyIncome - monthlyExpenses).toFixed(2)}
- Total de dívidas ativas: R$ ${totalDebt.toFixed(2)}
- Número de metas: ${goals.length}

PRINCIPAIS CATEGORIAS DE GASTOS:
${topCategories}

Retorne um JSON com esta estrutura EXATA:
{
  "financial_health": "Avaliação da saúde financeira atual em 2-3 frases diretas e objetivas",
  "future_projection": "Projeção realista para os próximos 6 meses baseada no padrão atual",
  "savings_recommendations": "3 recomendações práticas e específicas de economia baseadas nos gastos",
  "debt_strategy": "${totalDebt > 0 ? 'Estratégia clara para quitar as dívidas mais rapidamente' : 'Como evitar dívidas no futuro'}",
  "goal_plan": "${goals.length > 0 ? 'Como atingir as metas financeiras mais rapidamente' : 'Sugestões de metas financeiras'}",
  "investment_opportunities": "Recomendações de investimentos adequados para o perfil e momento financeiro"
}

Seja direto, prático e motivacional.`;

      console.log('🚀 Chamando Base44 IA...');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            financial_health: { type: "string" },
            future_projection: { type: "string" },
            savings_recommendations: { type: "string" },
            debt_strategy: { type: "string" },
            goal_plan: { type: "string" },
            investment_opportunities: { type: "string" }
          }
        }
      });

      console.log('✅ Resposta IA:', result);
      setAnalysis(result);

    } catch (error) {
      console.error('❌ Erro:', error);
      setError(error.message || 'Erro ao gerar análise');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">✨ Análise Inteligente</h1>
          <p className="text-purple-300">
            Insights e recomendações personalizadas com IA
          </p>
        </div>
        <Button
          onClick={generateAnalysis}
          disabled={loading}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/50"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? 'Analisando...' : 'Gerar Análise'}
        </Button>
      </motion.div>

      {error && (
        <Alert className="bg-rose-500/20 border-rose-500/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-white">
            <strong>Erro:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {!analysis && !loading && !error && (
        <Card className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-xl border-purple-500/30 p-12">
          <div className="text-center space-y-4">
            <Sparkles className="w-16 h-16 mx-auto text-purple-400" />
            <h3 className="text-2xl font-bold text-white">Pronto para análise profunda?</h3>
            <p className="text-purple-300 max-w-md mx-auto">
              Clique em "Gerar Análise" para receber insights personalizados sobre suas finanças
            </p>
          </div>
        </Card>
      )}

      {loading && (
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-white/10" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 bg-white/10 mb-2" />
                <Skeleton className="h-4 w-full bg-white/10 mb-2" />
                <Skeleton className="h-4 w-3/4 bg-white/10" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {analysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Saúde Financeira
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white leading-relaxed whitespace-pre-line">{analysis.financial_health}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Projeção Futura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white leading-relaxed whitespace-pre-line">{analysis.future_projection}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-purple-400" />
                  Recomendações de Economia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white leading-relaxed whitespace-pre-line">{analysis.savings_recommendations}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Estratégia de Dívidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white leading-relaxed whitespace-pre-line">{analysis.debt_strategy}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border-indigo-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🎯 Plano para Metas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white leading-relaxed whitespace-pre-line">{analysis.goal_plan}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 backdrop-blur-xl border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  💰 Oportunidades de Investimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white leading-relaxed whitespace-pre-line">{analysis.investment_opportunities}</p>
              </CardContent>
            </Card>
          </div>

          <SavingsSimulator 
            currentExpenses={transactions
              .filter(t => t.type === 'despesa' && new Date(t.date).getMonth() === new Date().getMonth())
              .reduce((sum, t) => sum + t.amount, 0)
            }
            netSalary={user?.net_salary || 10000}
          />
        </motion.div>
      )}
    </div>
  );
}