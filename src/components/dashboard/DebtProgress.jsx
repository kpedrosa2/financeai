import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";

export default function DebtProgress({ debts }) {
  const activeDebts = debts.filter(d => d.status === 'ativa').slice(0, 4);

  if (activeDebts.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">💳 Progresso das Dívidas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-300 text-center py-8">
            Nenhuma dívida ativa no momento!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white">💳 Progresso das Dívidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeDebts.map((debt) => {
          const progress = ((debt.installments_paid || 0) / debt.installments) * 100;
          return (
            <div key={debt.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">{debt.bank_name}</span>
                <span className="text-xs text-purple-300">
                  {debt.installments_paid || 0}/{debt.installments}
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-white/10" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">R$ {debt.current_amount.toFixed(2)}</span>
                <span className="text-rose-400">{debt.interest_rate}% juros</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}