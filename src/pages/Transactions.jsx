import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import TransactionForm from "../components/transactions/TransactionForm";
import TransactionList from "../components/transactions/TransactionList";
import TransactionFilters from "../components/transactions/TransactionFilters";

export default function Transactions() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    status: 'all',
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });

  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowForm(false);
      setEditingTransaction(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transaction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowForm(false);
      setEditingTransaction(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Transaction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const handleSubmit = (data) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    const matchType = filters.type === 'all' || t.type === filters.type;
    const matchCategory = filters.category === 'all' || t.category === filters.category;
    const matchStatus = filters.status === 'all' || t.status === filters.status;
    const matchMonth = tDate.getMonth() === filters.month;
    const matchYear = tDate.getFullYear() === filters.year;
    
    return matchType && matchCategory && matchStatus && matchMonth && matchYear;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">💰 Transações</h1>
          <p className="text-purple-300">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTransaction(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </Button>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border-emerald-500/30 p-6">
          <p className="text-sm text-emerald-300 mb-2">Receitas</p>
          <p className="text-3xl font-bold text-white">R$ {totalIncome.toFixed(2)}</p>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 backdrop-blur-xl border-rose-500/30 p-6">
          <p className="text-sm text-rose-300 mb-2">Despesas</p>
          <p className="text-3xl font-bold text-white">R$ {totalExpenses.toFixed(2)}</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-xl border-purple-500/30 p-6">
          <p className="text-sm text-purple-300 mb-2">Saldo</p>
          <p className={`text-3xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            R$ {(totalIncome - totalExpenses).toFixed(2)}
          </p>
        </Card>
      </div>

      <TransactionFilters filters={filters} onFilterChange={setFilters} />

      <AnimatePresence>
        {showForm && (
          <TransactionForm
            transaction={editingTransaction}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingTransaction(null);
            }}
            isProcessing={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </AnimatePresence>

      <TransactionList
        transactions={filteredTransactions}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={(id, status) => updateMutation.mutate({ id, data: { status } })}
      />
    </div>
  );
}