import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

export default function DebtSimulator({ debt }) {
  const [monthlyPayment, setMonthlyPayment] = useState(
    debt.current_amount / (debt.installments - (debt.installments_paid || 0))
  );
  const [simulation, setSimulation] = useState(null);

  const calculateSimulation = () => {
    const remainingInstallments = debt.installments - (debt.installments_paid || 0);
    const monthsToPayoff = Math.ceil(debt.current_amount / monthlyPayment);
    const totalPaid = monthlyPayment * monthsToPayoff;
    const totalInterest = totalPaid - debt.current_amount;

    setSimulation({
      monthsToPayoff,
      totalPaid,
      totalInterest,
      payoffDate: new Date(Date.now() + monthsToPayoff * 30 * 24 * 60 * 60 * 1000)
    });
  };

  return (
    <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Simulador de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-blue-300 mb-2">Dívida: {debt.bank_name}</p>
          <p className="text-xs text-blue-200">Valor atual: R$ {debt.current_amount.toFixed(2)}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-blue-300">Pagamento Mensal (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(parseFloat(e.target.value))}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <Button
          onClick={calculateSimulation}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          Calcular
        </Button>

        {simulation && (
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-xs text-blue-300">Quitação em</p>
              <p className="text-2xl font-bold text-white">{simulation.monthsToPayoff} meses</p>
              <p className="text-xs text-blue-200 mt-1">
                até {simulation.payoffDate.toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-xs text-blue-300">Total a Pagar</p>
              <p className="text-xl font-bold text-white">R$ {simulation.totalPaid.toFixed(2)}</p>
            </div>

            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-xs text-blue-300">Total de Juros</p>
              <p className="text-xl font-bold text-rose-400">R$ {simulation.totalInterest.toFixed(2)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}