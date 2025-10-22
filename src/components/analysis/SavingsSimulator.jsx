import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function SavingsSimulator({ currentExpenses, netSalary }) {
  const [reductionPercent, setReductionPercent] = useState(10);

  const reducedExpenses = currentExpenses * (1 - reductionPercent / 100);
  const monthlySavings = currentExpenses - reducedExpenses;
  const newBalance = netSalary - reducedExpenses;
  const yearlySavings = monthlySavings * 12;

  return (
    <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border-green-500/30">
      <CardHeader>
        <CardTitle className="text-white">💡 Simulador de Economia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <Label className="text-emerald-300">Redução de Gastos</Label>
            <span className="text-white font-bold">{reductionPercent}%</span>
          </div>
          <Slider
            value={[reductionPercent]}
            onValueChange={(value) => setReductionPercent(value[0])}
            max={50}
            step={5}
            className="py-4"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-emerald-300 mb-1">Economia Mensal</p>
            <p className="text-2xl font-bold text-emerald-400">R$ {monthlySavings.toFixed(2)}</p>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-emerald-300 mb-1">Economia Anual</p>
            <p className="text-2xl font-bold text-emerald-400">R$ {yearlySavings.toFixed(2)}</p>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-blue-300 mb-1">Novas Despesas</p>
            <p className="text-2xl font-bold text-white">R$ {reducedExpenses.toFixed(2)}</p>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-purple-300 mb-1">Novo Saldo</p>
            <p className="text-2xl font-bold text-white">R$ {newBalance.toFixed(2)}</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border border-emerald-500/50">
          <p className="text-sm text-emerald-300 mb-2">💰 Com essa economia você poderia:</p>
          <ul className="space-y-1 text-white">
            <li>• Quitar dívidas {(yearlySavings / 70000 * 100).toFixed(0)}% mais rápido</li>
            <li>• Alcançar sua meta em {Math.ceil(180000 / monthlySavings)} meses</li>
            <li>• Economizar R$ {(yearlySavings * 3).toFixed(2)} em 3 anos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}