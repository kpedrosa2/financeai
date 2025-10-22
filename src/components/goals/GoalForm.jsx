import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Save } from "lucide-react";

export default function GoalForm({ goal, onSubmit, onCancel, isProcessing }) {
  const [formData, setFormData] = useState(goal || {
    title: "",
    description: "",
    target_amount: 0,
    current_amount: 0,
    monthly_contribution: 0,
    target_date: new Date().toISOString().split('T')[0],
    status: "em_andamento",
    icon: "🎯"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount),
      monthly_contribution: parseFloat(formData.monthly_contribution)
    });
  };

  const iconOptions = ["🎯", "🚗", "🏠", "✈️", "💍", "🎓", "💰", "🏖️", "📱", "💻"];

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
              {goal ? 'Editar Meta' : 'Nova Meta'}
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
                <Label htmlFor="title" className="text-purple-300">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Comprar um carro"
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon" className="text-purple-300">Ícone</Label>
                <div className="flex gap-2 flex-wrap">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition-all ${
                        formData.icon === icon
                          ? 'bg-purple-500/40 border-2 border-purple-400'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description" className="text-purple-300">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva sua meta..."
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_amount" className="text-purple-300">Valor Alvo (R$)</Label>
                <Input
                  id="target_amount"
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_contribution" className="text-purple-300">Contribuição Mensal (R$)</Label>
                <Input
                  id="monthly_contribution"
                  type="number"
                  step="0.01"
                  value={formData.monthly_contribution}
                  onChange={(e) => setFormData({ ...formData, monthly_contribution: e.target.value })}
                  placeholder="0,00"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_date" className="text-purple-300">Data Alvo</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
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