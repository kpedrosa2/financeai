import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GoalCard({ goal, onEdit, onDelete, onContribute }) {
  const [showContribute, setShowContribute] = useState(false);
  const [amount, setAmount] = useState(0);

  const progress = ((goal.current_amount || 0) / goal.target_amount) * 100;
  const remaining = goal.target_amount - (goal.current_amount || 0);
  const daysUntilTarget = differenceInDays(new Date(goal.target_date), new Date());
  const monthsUntilTarget = Math.ceil(daysUntilTarget / 30);
  const requiredMonthly = monthsUntilTarget > 0 ? remaining / monthsUntilTarget : 0;

  const handleContribute = () => {
    if (amount > 0) {
      onContribute(goal.id, parseFloat(amount));
      setAmount(0);
      setShowContribute(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-xl border-purple-500/20 hover:border-purple-500/40 transition-all">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center text-3xl">
              {goal.icon || "🎯"}
            </div>
            <div>
              <CardTitle className="text-white">{goal.title}</CardTitle>
              {goal.description && (
                <p className="text-sm text-purple-300 mt-1">{goal.description}</p>
              )}
            </div>
          </div>
          <Badge
            className={`${
              goal.status === 'em_andamento'
                ? 'bg-blue-500/20 text-blue-400'
                : goal.status === 'concluida'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            {goal.status === 'em_andamento' ? 'Em Andamento' : goal.status === 'concluida' ? 'Concluída' : 'Pausada'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-purple-300">Progresso</span>
            <span className="text-white font-bold">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-3 bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-xs text-purple-300">Economizado</p>
            <p className="text-lg font-bold text-emerald-400">
              R$ {(goal.current_amount || 0).toFixed(2)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-xs text-purple-300">Meta</p>
            <p className="text-lg font-bold text-white">
              R$ {goal.target_amount.toFixed(2)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-xs text-purple-300">Faltam</p>
            <p className="text-lg font-bold text-rose-400">
              R$ {remaining.toFixed(2)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-xs text-purple-300">Prazo</p>
            <p className="text-sm font-bold text-white">
              {format(new Date(goal.target_date), "MMM/yyyy", { locale: ptBR })}
            </p>
            <p className="text-xs text-purple-300">{monthsUntilTarget} meses</p>
          </div>
        </div>

        {requiredMonthly > 0 && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
            <p className="text-xs text-purple-300 mb-1">Contribuição Mensal Necessária</p>
            <p className="text-xl font-bold text-white">R$ {requiredMonthly.toFixed(2)}/mês</p>
          </div>
        )}

        {showContribute ? (
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Valor"
              className="bg-white/5 border-white/10 text-white"
            />
            <Button onClick={handleContribute} className="bg-emerald-500 hover:bg-emerald-600">
              Confirmar
            </Button>
            <Button variant="outline" onClick={() => setShowContribute(false)} className="border-white/10 text-white">
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => setShowContribute(true)}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Contribuir
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(goal)}
              className="text-blue-400 hover:bg-blue-500/20"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(goal.id)}
              className="text-rose-400 hover:bg-rose-500/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}