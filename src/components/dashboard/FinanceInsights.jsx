import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle } from "lucide-react";

const typeUi = {
  warning: {
    badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    border: "border-amber-500/20",
  },
  danger: {
    badge: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    border: "border-rose-500/20",
  },
  info: {
    badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    border: "border-blue-500/20",
  },
  success: {
    badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    border: "border-emerald-500/20",
  },
};

export default function FinanceInsights({ insights = [], loading, onRefresh }) {
  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Brain className="w-5 h-5 text-purple-300" />
            Insights financeiros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 bg-white/10" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <Brain className="w-5 h-5 text-purple-300" />
          Insights financeiros
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onRefresh} className="text-purple-300 hover:bg-white/10">
          Atualizar
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <p className="text-purple-100/95 text-center py-6 text-sm leading-relaxed px-3 border border-dashed border-purple-400/25 rounded-xl bg-black/15">
            Ainda não há alertas aqui — continue registrando suas transações ao longo das semanas e os avisos
            aparecerão automaticamente.
          </p>
        ) : (
          insights.map((item, index) => {
            const style = typeUi[item.type] || typeUi.info;
            return (
              <div key={index} className={`rounded-lg bg-white/5 p-3 border ${style.border}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-purple-300">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <Badge variant="outline" className={`text-[10px] uppercase tracking-wide ${style.badge}`}>
                        {item.priority || "medium"}
                      </Badge>
                    </div>
                    <p className="text-sm text-purple-200 leading-snug">{item.message}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
