import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import DebtForm from "../components/debts/DebtForm";
import DebtList from "../components/debts/DebtList";
import DebtSimulator from "../components/debts/DebtSimulator";
import DebtStrategy from "../components/debts/DebtStrategy";
import { formatCurrency } from "../components/utils/formatters";

export default function Debts() {
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [selectedDebt, setSelectedDebt] = useState(null);

  const queryClient = useQueryClient();

  const { data: debts = [], isLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: () => base44.entities.Debt.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Debt.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      setShowForm(false);
      setEditingDebt(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Debt.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      setShowForm(false);
      setEditingDebt(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Debt.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });

  const handleSubmit = (data) => {
    if (editingDebt) {
      updateMutation.mutate({ id: editingDebt.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (debt) => {
    setEditingDebt(debt);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta dívida?')) {
      deleteMutation.mutate(id);
    }
  };

  const activeDebts = debts.filter(d => d.status === 'ativa');
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.current_amount, 0);
  const totalOriginal = activeDebts.reduce((sum, d) => sum + d.original_amount, 0);
  const averageInterest = activeDebts.length > 0 
    ? activeDebts.reduce((sum, d) => sum + d.interest_rate, 0) / activeDebts.length 
    : 0;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">💳 Gestão de Dívidas</h1>
          <p className="text-purple-300">
            Controle e planeje a quitação das suas dívidas
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingDebt(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Dívida
        </Button>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border-orange-500/30 p-6">
          <p className="text-sm text-orange-300 mb-2">Dívida Total</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalDebt)}</p>
          <p className="text-xs text-orange-200 mt-2">{activeDebts.length} dívidas ativas</p>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 backdrop-blur-xl border-rose-500/30 p-6">
          <p className="text-sm text-rose-300 mb-2">Valor Original</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalOriginal)}</p>
          <p className="text-xs text-rose-200 mt-2">
            {totalDebt > totalOriginal ? '+' : ''} {formatCurrency(Math.abs(totalDebt - totalOriginal))} em juros
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 backdrop-blur-xl border-amber-500/30 p-6">
          <p className="text-sm text-amber-300 mb-2">Taxa Média</p>
          <p className="text-3xl font-bold text-white">{averageInterest.toFixed(2)}%</p>
          <p className="text-xs text-amber-200 mt-2">ao mês</p>
        </Card>
      </div>

      <AnimatePresence>
        {showForm && (
          <DebtForm
            debt={editingDebt}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingDebt(null);
            }}
            isProcessing={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DebtList
            debts={debts}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelect={setSelectedDebt}
          />
        </div>

        <div className="space-y-6">
          <DebtStrategy debts={activeDebts} />
          {selectedDebt && <DebtSimulator debt={selectedDebt} />}
        </div>
      </div>
    </div>
  );
}