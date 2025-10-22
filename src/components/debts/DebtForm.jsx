import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";

export default function DebtForm({ debt, onSubmit, onCancel, isProcessing }) {
  const [formData, setFormData] = useState(debt || {
    bank_name: "",
    original_amount: 0,
    current_amount: 0,
    interest_rate: 0,
    installments: 12,
    installments_paid: 0,
    due_date: new Date().toISOString().split('T')[0],
    status: "ativa",
    priority: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      original_amount: parseFloat(formData.original_amount),
      current_amount: parseFloat(formData.current_amount),
      interest_rate: parseFloat(formData.interest_rate),
      installments: parseInt(formData.installments),
      installments_paid: parseInt(formData.installments_paid),
      priority: parseInt(formData.priority)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">
              {debt ? 'Editar Dívida' : 'Nova Dívida'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name" className="text-purple-300">Banco/Credor</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="Ex: Banco do Brasil"
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="original_amount" className="text-purple-300">Valor Original (R$)</Label>
                <Input
                  id="original_amount"
                  type="number"
                  step="0.01"
                  value={formData.original_amount}
                  onChange={(e) => setFormData({ ...formData, original_amount: e.target.value })}
                  placeholder="0,00"
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_amount" className="text-purple-300">Valor Atual (R$)</Label>
                <Input
                  id="current_amount"
                  type="number"
                  step="0.01"
                  value={formData.current_amount}
                  onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                  placeholder="0,00"
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest_rate" className="text-purple-300">Taxa de Juros (% ao mês)</Label>
                <Input
                  id="interest_rate"
                  type="number"
                  step="0.01"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                  placeholder="0,00"
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installments" className="text-purple-300">Número de Parcelas</Label>
                <Input
                  id="installments"
                  type="number"
                  value={formData.installments}
                  onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installments_paid" className="text-purple-300">Parcelas Pagas</Label>
                <Input
                  id="installments_paid"
                  type="number"
                  value={formData.installments_paid}
                  onChange={(e) => setFormData({ ...formData, installments_paid: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date" className="text-purple-300">Vencimento</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-purple-300">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="quitada">Quitada</SelectItem>
                    <SelectItem value="atrasada">Atrasada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} className="border-white/10 text-white">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {isProcessing ? 'Salvando...' : 'Salvar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}