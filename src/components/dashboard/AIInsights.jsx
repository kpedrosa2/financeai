import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AIInsights({ insights, loading, onRefresh }) {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Análise Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 bg-white/10" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Análise Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-200 text-center py-4">
            Clique em "Análise IA" para gerar insights
          </p>
        </CardContent>
      </Card>
    );
  }

  const insightItems = [
    { icon: AlertTriangle, title: "Alerta", content: insights.alert, color: "text-rose-400" },
    { icon: Lightbulb, title: "Dica de Economia", content: insights.saving_tip, color: "text-emerald-400" },
    { icon: BarChart3, title: "Estratégia de Dívidas", content: insights.debt_strategy, color: "text-orange-400" },
    { icon: TrendingUp, title: "Projeção", content: insights.projection, color: "text-blue-400" },
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Análise Inteligente
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-purple-300 hover:text-white hover:bg-white/10"
          >
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insightItems.map((item, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start gap-2">
              <item.icon className={`w-4 h-4 mt-0.5 ${item.color}`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${item.color} mb-1`}>{item.title}</p>
                <p className="text-sm text-purple-200">{item.content}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}