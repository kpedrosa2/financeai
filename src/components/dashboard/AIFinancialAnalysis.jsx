import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, AlertCircle, Shield, TrendingUp } from "lucide-react";
import { api } from "@/services/api";
import { formatCurrency } from "@/utils/formatters.js";

const riskLabel = {
  low: "Risco baixo",
  medium: "Risco moderado",
  high: "Risco elevado",
};

const riskTone = {
  low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  high: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

const priorityTone = {
  high: "bg-rose-500/15 text-rose-300 border border-rose-500/25",
  medium: "bg-amber-500/15 text-amber-200 border border-amber-500/25",
  low: "bg-slate-500/15 text-slate-300 border border-white/10",
};

export default function AIFinancialAnalysis({ disabled }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.post("/ai/analyze", {});
      setResult(data);
    } catch (e) {
      setResult(null);
      setError(e?.message || "Não foi possível concluir a análise. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/6 backdrop-blur-xl border-purple-500/25 transition-shadow hover:shadow-lg hover:shadow-purple-950/30">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-violet-300" />
          Análise financeira com IA
        </CardTitle>
        <Button
          type="button"
          disabled={disabled || loading}
          onClick={analyze}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 w-full sm:w-auto"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? "Analisando…" : "Analisar com IA"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex gap-3 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-sm text-rose-100">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full max-w-[180px] bg-white/15" />
            <Skeleton className="h-20 w-full bg-white/10" />
            <Skeleton className="h-28 w-full bg-white/10" />
          </div>
        )}

        {!loading && result && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-baseline gap-2 rounded-xl bg-black/35 px-4 py-3 border border-white/10">
                <span className="text-4xl font-bold text-white">{result.score}</span>
                <span className="text-sm text-purple-200">/100</span>
              </div>
              <Badge className={`${riskTone[result.riskLevel] ?? riskTone.medium} border`}>
                {riskLabel[result.riskLevel] ?? result.riskLevel}
              </Badge>
              <Badge variant="outline" className="border-white/15 text-purple-100">
                Forecast: {result.forecast?.trend === "positive" ? (
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                ) : null}
                tendência{" "}
                <span className="font-semibold text-white ml-1">
                  {result.forecast?.trend === "positive"
                    ? "positiva"
                    : result.forecast?.trend === "negative"
                      ? "negativa"
                      : "neutra"}
                </span>
              </Badge>
            </div>

            <div className="rounded-xl bg-black/25 border border-white/10 p-4 text-sm leading-relaxed text-purple-100">
              <p className="text-white font-semibold mb-2">Resumo</p>
              <p>{result.summary}</p>
            </div>

            <div className="rounded-xl bg-black/20 border border-white/10 p-4 space-y-2">
              <p className="text-white font-semibold text-sm">Previsão do mês</p>
              <p className="text-purple-100 text-sm">
                Saldo projetado:{" "}
                <span className="text-white font-medium">
                  {formatCurrency(result.forecast?.projectedMonthBalance ?? 0)}
                </span>
              </p>
              <p className="text-purple-200 text-xs">
                {result.forecast?.daysUntilNegative != null ? (
                  <>Estimativa de pressão sobre o saldo nos próximos dias: até {result.forecast.daysUntilNegative}.</>
                ) : (
                  <>Sem alerta objetivo de “dias até negativo”; siga registrando dados para maior precisão.</>
                )}
              </p>
            </div>

            {(result.anomalies ?? []).length > 0 && (
              <div>
                <p className="text-white font-semibold text-sm mb-2">Anomalias detectadas</p>
                <ul className="space-y-2">
                  {result.anomalies.map((a, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-amber-500/25 bg-amber-950/25 px-3 py-2 text-sm text-amber-100"
                    >
                      <span className="font-medium text-white">{a.category}</span>: {a.message}
                      <span className="block text-xs text-purple-300 mt-1">
                        Valor destacado: {formatCurrency(a.amount ?? 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(result.recommendations ?? []).length > 0 && (
              <div>
                <p className="text-white font-semibold text-sm mb-2">Recomendações</p>
                <ul className="space-y-2">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className={`rounded-xl p-4 ${priorityTone[r.priority] ?? priorityTone.low}`}>
                      <p className="font-semibold text-white">{r.title}</p>
                      <p className="text-sm text-purple-100 mt-1 leading-snug">{r.description}</p>
                      <p className="text-xs text-purple-300 mt-2">{r.impact}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!loading && !result && !error && (
          <p className="text-purple-300 text-center text-sm py-2 border border-white/5 rounded-xl bg-black/15">
            Toque em <span className="text-white font-semibold">Analisar com IA</span> para gerar score, alertas e
            previsão com base nas suas transações registradas.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
