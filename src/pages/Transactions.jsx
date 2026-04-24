import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "@/lib/AccountContext";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, Download, TrendingUp, Upload } from "lucide-react"; // Added Upload icon
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "../components/utils/formatters";

import TransactionForm from "../components/transactions/TransactionForm";
import TransactionList from "../components/transactions/TransactionList";
import TransactionFilters from "../components/transactions/TransactionFilters";
import InvestmentSection from "../components/transactions/InvestmentSection";
import ImportTransactions from "../components/transactions/ImportTransactions"; // Assuming this component exists

export default function Transactions() {
  const { account } = useAccount();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false); // New state for import modal
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
    queryKey: ['transactions', account?.id],
    queryFn: () => account ? base44.entities.Transaction.filter({ account_id: account.id }, '-date') : [],
    enabled: !!account,
    initialData: [],
  });

  const { data: investments = [], isLoading: loadingInvestments } = useQuery({
    queryKey: ['investments', account?.id],
    queryFn: () => account ? base44.entities.Investment.filter({ account_id: account.id }, '-application_date') : [],
    enabled: !!account,
    initialData: [],
  });

  const { data: debts = [], isLoading: loadingDebts } = useQuery({
    queryKey: ['debts', account?.id],
    queryFn: () => account ? base44.entities.Debt.filter({ account_id: account.id }) : [],
    enabled: !!account,
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
    // Se for edição, apenas atualizar a transação específica
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data });
      return;
    }

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

      await Promise.all(transactions.map(t => base44.entities.Transaction.create({ ...t, account_id: account?.id })));
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
          account_id: account?.id,
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

    // Transação simples
    createMutation.mutate({ ...data, account_id: account?.id });
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
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">💰 Gestão Financeira</h1>
          <p className="text-purple-300">
            Controle completo de receitas, despesas e investimentos
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowImport(true)}
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Extrato
          </Button>
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
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border-emerald-500/30 p-4">
          <p className="text-xs text-emerald-300 mb-1">Receitas</p>
          <p className="text-xl md:text-2xl font-bold text-white">{formatCurrency(totalIncome)}</p>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 backdrop-blur-xl border-rose-500/30 p-4">
          <p className="text-xs text-rose-300 mb-1">Despesas</p>
          <p className="text-xl md:text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-xl border-purple-500/30 p-4">
          <p className="text-xs text-purple-300 mb-1">Saldo</p>
          <p className={`text-xl md:text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border-blue-500/30 p-4">
          <p className="text-xs text-blue-300 mb-1">Investido</p>
          <p className="text-xl md:text-2xl font-bold text-white">{formatCurrency(totalInvested)}</p>
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
            {showImport && (
              <ImportTransactions
                onImportComplete={() => {
                  setShowImport(false);
                  queryClient.invalidateQueries({ queryKey: ['transactions'] });
                }}
                onCancel={() => setShowImport(false)}
              />
            )}
          </AnimatePresence>

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