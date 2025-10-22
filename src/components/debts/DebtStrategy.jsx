import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Skeleton } from "@/components/ui/skeleton";

export default function DebtStrategy({ debts }) {
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateStrategy = async () => {
    setLoading(true);
    try {
      const prompt = `
Analise estas dívidas e crie uma estratégia de quitação:

${debts.map(d => `
- ${d.bank_name}: R$ ${d.current_amount.toFixed(2)} (${d.interest_rate}% juros)
  Parcelas: ${d.installments_paid}/${d.installments}
`).join('\n')}

Forneça:
1. Ordem de prioridade para pagamento
2. Estratégia de quitação otimizada
3. Estimativa de tempo para quitar tudo
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            priority_order: { type: "string" },
            strategy: { type: "string" },
            time_estimate: { type: "string" }
          }
        }
      });

      setStrategy(result);
    } catch (error) {
      console.error("Erro ao gerar estratégia:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (debts.length > 0 && !strategy) {
      generateStrategy();
    }
  }, [debts]);

  return (
    <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Estratégia IA
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateStrategy}
            className="text-purple-300 hover:text-white"
          >
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-16 bg-white/10" />
            <Skeleton className="h-16 bg-white/10" />
            <Skeleton className="h-16 bg-white/10" />
          </>
        ) : strategy ? (
          <>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm font-medium text-purple-300 mb-1">Ordem de Prioridade</p>
              <p className="text-sm text-white">{strategy.priority_order}</p>
            </div>

            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm font-medium text-purple-300 mb-1">Estratégia</p>
              <p className="text-sm text-white">{strategy.strategy}</p>
            </div>

            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm font-medium text-purple-300 mb-1">Estimativa</p>
              <p className="text-sm text-white">{strategy.time_estimate}</p>
            </div>
          </>
        ) : (
          <p className="text-purple-300 text-center py-4">
            Aguardando análise...
          </p>
        )}
      </CardContent>
    </Card>
  );
}