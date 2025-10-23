
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, TrendingUp, Calendar, DollarSign, Pencil, Trash2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "../utils/formatters"; // Corrected import path

export default function InvestmentSection({ investments, isLoading }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "poupanca",
    initial_amount: 0,
    current_amount: 0,
    application_date: new Date().toISOString().split('T')[0],
    yield_rate: 0,
    expected_return: 0,
    redemption_date: "",
    monthly_contribution: 0
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Investment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      setShowForm(false);
      setFormData({
        name: "",
        type: "poupanca",
        initial_amount: 0,
        current_amount: 0,
        application_date: new Date().toISOString().split('T')[0],
        yield_rate: 0,
        expected_return: 0,
        redemption_date: "",
        monthly_contribution: 0
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Investment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      initial_amount: parseFloat(formData.initial_amount),
      current_amount: parseFloat(formData.current_amount || formData.initial_amount),
      yield_rate: parseFloat(formData.yield_rate),
      expected_return: parseFloat(formData.expected_return),
      monthly_contribution: parseFloat(formData.monthly_contribution) || 0
    });
  };

  const totalInvested = investments
    .filter(i => i.status === 'ativo')
    .reduce((sum, i) => sum + i.initial_amount, 0);

  const totalCurrent = investments
    .filter(i => i.status === 'ativo')
    .reduce((sum, i) => sum + i.current_amount, 0);

  const totalReturn = totalCurrent - totalInvested;
  const averageYield = investments.length > 0
    ? investments.reduce((sum, i) => sum + i.yield_rate, 0) / investments.length
    : 0;

  // Dados para o gráfico
  const chartData = investments
    .filter(i => i.status === 'ativo')
    .map(inv => {
      const monthsInvested = Math.max(1, differenceInDays(new Date(), new Date(inv.application_date)) / 30);
      const projectedAmount = inv.initial_amount * Math.pow(1 + inv.yield_rate / 100 / 12, monthsInvested);
      
      return {
        name: inv.name.substring(0, 15),
        investido: inv.initial_amount,
        atual: inv.current_amount,
        projecao: projectedAmount
      };
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">💰 Investimentos</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Investimento
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border-blue-500/30 p-6">
          <p className="text-sm text-blue-300 mb-2">Total Investido</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalInvested)}</p>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border-emerald-500/30 p-6">
          <p className="text-sm text-emerald-300 mb-2">Valor Atual</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalCurrent)}</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-purple-500/30 p-6">
          <p className="text-sm text-purple-300 mb-2">Rentabilidade</p>
          <p className="text-3xl font-bold text-emerald-400">
            {totalReturn > 0 ? '+' : ''}{formatCurrency(totalReturn)}
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl border-amber-500/30 p-6">
          <p className="text-sm text-amber-300 mb-2">Yield Médio</p>
          <p className="text-3xl font-bold text-white">{averageYield.toFixed(2)}%</p>
          <p className="text-xs text-amber-200 mt-1">ao ano</p>
        </Card>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Novo Investimento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-purple-300">Nome</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: CDB Banco XYZ"
                      className="bg-white/5 border-white/10 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-300">Tipo</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poupanca">Poupança</SelectItem>
                        <SelectItem value="acoes">Ações</SelectItem>
                        <SelectItem value="tesouro_direto">Tesouro Direto</SelectItem>
                        <SelectItem value="cdb">CDB</SelectItem>
                        <SelectItem value="lci_lca">LCI / LCA</SelectItem>
                        <SelectItem value="fundos">Fundos de Investimento</SelectItem>
                        <SelectItem value="criptomoedas">Criptomoedas</SelectItem>
                        <SelectItem value="previdencia">Previdência Privada</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-300">Valor Aplicado (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.initial_amount}
                      onChange={(e) => setFormData({ ...formData, initial_amount: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-300">Valor Atual (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.current_amount}
                      onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Deixe vazio se igual ao aplicado"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-300">Data de Aplicação</Label>
                    <Input
                      type="date"
                      value={formData.application_date}
                      onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-300">Rentabilidade (% ao ano)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.yield_rate}
                      onChange={(e) => setFormData({ ...formData, yield_rate: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Ex: 13.65"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-300">Data de Resgate (opcional)</Label>
                    <Input
                      type="date"
                      value={formData.redemption_date}
                      onChange={(e) => setFormData({ ...formData, redemption_date: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-purple-300">Aporte Mensal (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.monthly_contribution}
                      onChange={(e) => setFormData({ ...formData, monthly_contribution: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-white/10 text-white">
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {investments.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">📈 Evolução dos Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Line type="monotone" dataKey="investido" stroke="#3b82f6" name="Investido" strokeWidth={2} />
                <Line type="monotone" dataKey="atual" stroke="#10b981" name="Atual" strokeWidth={2} />
                <Line type="monotone" dataKey="projecao" stroke="#8b5cf6" name="Projeção" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {investments.map((investment) => {
          const daysInvested = differenceInDays(new Date(), new Date(investment.application_date));
          const returnAmount = investment.current_amount - investment.initial_amount;
          const returnPercent = (investment.initial_amount !== 0) ? (returnAmount / investment.initial_amount) * 100 : 0;

          return (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border-blue-500/20 hover:border-blue-500/40 transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-lg">{investment.name}</CardTitle>
                      <p className="text-xs text-blue-300 mt-1">{investment.type}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(investment.id)}
                      className="text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-blue-300">Investido</p>
                      <p className="text-lg font-bold text-white">{formatCurrency(investment.initial_amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-300">Atual</p>
                      <p className="text-lg font-bold text-emerald-400">{formatCurrency(investment.current_amount)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-blue-300 mb-1">Rentabilidade</p>
                    <div className="flex items-center gap-2">
                      <Progress value={Math.min(returnPercent, 100)} className="h-2 flex-1 bg-white/10" />
                      <span className="text-sm font-bold text-emerald-400">
                        {returnPercent > 0 ? '+' : ''}{returnPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1 text-xs text-blue-300">
                      <Calendar className="w-3 h-3" />
                      {daysInvested} dias
                    </div>
                    <div className="flex items-center gap-1 text-xs text-blue-300">
                      <TrendingUp className="w-3 h-3" />
                      {investment.yield_rate}% a.a.
                    </div>
                  </div>

                  {investment.monthly_contribution > 0 && (
                    <div className="text-xs text-blue-300 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Aporte: {formatCurrency(investment.monthly_contribution)}/mês
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {investments.length === 0 && !showForm && (
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-12">
          <p className="text-purple-300 text-center">
            Nenhum investimento cadastrado. Crie seu primeiro investimento!
          </p>
        </Card>
      )}
    </div>
  );
}
