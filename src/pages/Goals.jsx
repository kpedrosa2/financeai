
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import GoalForm from "../components/goals/GoalForm";
import GoalCard from "../components/goals/GoalCard";
import GoalProgress from "../components/goals/GoalProgress";
import { formatCurrency } from "../components/utils/formatters";

export default function Goals() {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowForm(false);
      setEditingGoal(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowForm(false);
      setEditingGoal(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const handleSubmit = (data) => {
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleContribute = (id, amount) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      updateMutation.mutate({
        id,
        data: { current_amount: (goal.current_amount || 0) + amount }
      });
    }
  };

  const activeGoals = goals.filter(g => g.status === 'em_andamento');
  const totalTarget = activeGoals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSaved = activeGoals.reduce((sum, g) => sum + (g.current_amount || 0), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">🎯 Metas Financeiras</h1>
          <p className="text-purple-300">
            Acompanhe o progresso dos seus objetivos
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingGoal(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Meta
        </Button>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-xl border-purple-500/30 p-6">
          <p className="text-sm text-purple-300 mb-2">Meta Total</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalTarget)}</p>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border-emerald-500/30 p-6">
          <p className="text-sm text-emerald-300 mb-2">Total Economizado</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalSaved)}</p>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border-blue-500/30 p-6">
          <p className="text-sm text-blue-300 mb-2">Progresso Geral</p>
          <p className="text-3xl font-bold text-white">{overallProgress.toFixed(0)}%</p>
        </Card>
      </div>

      <AnimatePresence>
        {showForm && (
          <GoalForm
            goal={editingGoal}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingGoal(null);
            }}
            isProcessing={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-2 gap-6">
        {goals.length === 0 ? (
          <Card className="lg:col-span-2 bg-white/5 backdrop-blur-xl border-white/10 p-12">
            <p className="text-purple-300 text-center">
              Nenhuma meta cadastrada. Crie sua primeira meta!
            </p>
          </Card>
        ) : (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onContribute={handleContribute}
            />
          ))
        )}
      </div>

      {goals.length > 0 && <GoalProgress goals={goals} />}
    </div>
  );
}
