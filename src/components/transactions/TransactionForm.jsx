import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Save } from "lucide-react";

export default function TransactionForm({ transaction, onSubmit, onCancel, isProcessing }) {
  const [formData, setFormData] = useState(transaction || {
    description: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: "outros",
    type: "despesa",
    payment_method: "pix",
    status: "pendente",
    is_recurring: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, amount: parseFloat(formData.amount) });
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
              {transaction ? 'Editar Transação' : 'Nova Transação'}
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
                <Label htmlFor="description" className="text-purple-300">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Compra no mercado"
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-purple-300">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0,00"
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-purple-300">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-purple-300">Tipo</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-purple-300">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alimentacao">Alimentação</SelectItem>
                    <SelectItem value="transporte">Transporte</SelectItem>
                    <SelectItem value="moradia">Moradia</SelectItem>
                    <SelectItem value="saude">Saúde</SelectItem>
                    <SelectItem value="lazer">Lazer</SelectItem>
                    <SelectItem value="educacao">Educação</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method" className="text-purple-300">Forma de Pagamento</Label>
                <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-purple-300">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
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