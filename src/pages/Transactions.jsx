import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, Download, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import TransactionForm from "../components/transactions/TransactionForm";
import TransactionList from "../components/transactions/TransactionList";
import TransactionFilters from "../components/transactions/TransactionFilters";
import InvestmentSection from "../components/transactions/InvestmentSection";

export default function Transactions() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [activeTab, setActiveTab] = useState("transactions");
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

  const { data: investments = [], isLoading: loadingInvestments } = useQuery({
    queryKey: ['investments'],
    queryFn: () => base44.entities.Investment.list('-application_date'),
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

  const handleSubmit = async (data) => {
    // Se for transação recorrente, criar para todos os meses restantes do ano
    if (data.is_recurring) {
      const currentDate = new Date(data.date);
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const transactions = [];

      for (let month = currentMonth; month < 12; month++) {
        const newDate = new Date(currentYear, month, currentDate.getDate());
        transactions.push({
          ...data,
          date: newDate.toISOString().split('T')[0]
        });
      }

      await Promise.all(transactions.map(t => base44.entities.Transaction.create(t)));
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowForm(false);
      return;
    }

    // Se for parcelada, criar todas as parcelas
    if (data.is_installment && data.total_installments > 1) {
      const parentId = `parent_${Date.now()}`;
      const startDate = new Date(data.date);
      const installments = [];

      for (let i = 0; i < data.total_installments; i++) {
        const installmentDate = new Date(startDate);
        installmentDate.setMonth(installmentDate.getMonth() + i);

        installments.push({
          ...data,
          date: installmentDate.toISOString().split('T')[0],
          installment_number: i + 1,
          parent_transaction_id: parentId,
          description: `${data.description} (${i + 1}/${data.total_installments})`
        });
      }

      await Promise.all(installments.map(inst => base44.entities.Transaction.create(inst)));
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowForm(false);
      return;
    }

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

  const checkDueAlerts = (transaction) => {
    const today = new Date();
    const dueDate = new Date(transaction.date);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (transaction.status === 'pendente') {
      if (diffDays < 0) {
        // Atualizar para atrasado e adicionar juros se aplicável
        if (transaction.has_interest && transaction.interest_rate) {
          const monthsOverdue = Math.abs(Math.floor(diffDays / 30));
          const newAmount = transaction.amount * Math.pow(1 + transaction.interest_rate / 100, monthsOverdue);
          updateMutation.mutate({
            id: transaction.id,
            data: { ...transaction, status: 'atrasado', amount: newAmount, due_alert: true }
          });
        } else {
          updateMutation.mutate({
            id: transaction.id,
            data: { ...transaction, status: 'atrasado', due_alert: true }
          });
        }
      } else if (diffDays <= 5) {
        updateMutation.mutate({
          id: transaction.id,
          data: { ...transaction, due_alert: true }
        });
      }
    }
  };

  React.useEffect(() => {
    transactions.forEach(checkDueAlerts);
  }, [transactions]);

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

  const totalInvested = investments
    .filter(i => i.status === 'ativo')
    .reduce((sum, i) => sum + i.current_amount, 0);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">💰 Gestão Financeira</h1>
          <p className="text-purple-300">
            Controle completo de receitas, despesas e investimentos
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border-blue-500/30 p-6">
          <p className="text-sm text-blue-300 mb-2">Investido</p>
          <p className="text-3xl font-bold text-white">R$ {totalInvested.toFixed(2)}</p>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-purple-500/20">
            Transações
          </TabsTrigger>
          <TabsTrigger value="investments" className="data-[state=active]:bg-purple-500/20">
            <TrendingUp className="w-4 h-4 mr-2" />
            Investimentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6 mt-6">
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
            onStatusChange={(id, status) => {
              const transaction = transactions.find(t => t.id === id);
              updateMutation.mutate({ id, data: { ...transaction, status } });
            }}
          />
        </TabsContent>

        <TabsContent value="investments" className="mt-6">
          <InvestmentSection 
            investments={investments}
            isLoading={loadingInvestments}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}