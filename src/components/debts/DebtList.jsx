
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, Calculator } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "../utils/formatters";

export default function DebtList({ debts, isLoading, onEdit, onDelete, onSelect }) {
  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Lista de Dívidas</CardTitle>
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 mb-4 bg-white/10" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Lista de Dívidas ({debts.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {debts.length === 0 ? (
          <p className="text-purple-300 text-center py-8">
            Nenhuma dívida cadastrada
          </p>
        ) : (
          debts.map((debt) => {
            const progress = ((debt.installments_paid || 0) / debt.installments) * 100;
            // Ensure division by zero is handled, especially if installments_paid equals installments causing the denominator to be 0
            const remainingInstallments = debt.installments - (debt.installments_paid || 0);
            const monthlyPayment = remainingInstallments > 0 ? debt.current_amount / remainingInstallments : debt.current_amount; // If no remaining installments, monthly payment is just the current amount (or 0 if debt is fully paid)
            
            return (
              <div
                key={debt.id}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{debt.bank_name}</h3>
                    <p className="text-sm text-purple-300">
                      Vencimento: {format(new Date(debt.due_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge
                    className={`${
                      debt.status === 'ativa'
                        ? 'bg-orange-500/20 text-orange-400'
                        : debt.status === 'quitada'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {debt.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-purple-300">Valor Atual</p>
                    <p className="text-lg font-bold text-rose-400">{formatCurrency(debt.current_amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-300">Parcela Mensal</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(monthlyPayment)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-300">Taxa de Juros</p>
                    <p className="text-sm font-medium text-amber-400">{debt.interest_rate}% ao mês</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-300">Parcelas</p>
                    <p className="text-sm font-medium text-white">
                      {debt.installments_paid || 0}/{debt.installments}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-purple-300 mb-1">
                    <span>Progresso</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-white/10" />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(debt)}
                    className="text-blue-400 hover:bg-blue-500/20 flex-1"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Simular
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(debt)}
                    className="text-purple-400 hover:bg-purple-500/20"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(debt.id)}
                    className="text-rose-400 hover:bg-rose-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
