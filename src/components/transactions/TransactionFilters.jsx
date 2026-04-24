import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function TransactionFilters({ filters, onFilterChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="space-y-2">
            <Label className="text-purple-300">Tipo</Label>
            <Select value={filters.type} onValueChange={(value) => onFilterChange({ ...filters, type: value })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
                <SelectItem value="investimento">Investimentos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-purple-300">Status</Label>
            <Select value={filters.status} onValueChange={(value) => onFilterChange({ ...filters, status: value })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-purple-300">Mês</Label>
            <Select value={filters.month.toString()} onValueChange={(value) => onFilterChange({ ...filters, month: parseInt(value) })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-purple-300">Ano</Label>
            <Select value={filters.year.toString()} onValueChange={(value) => onFilterChange({ ...filters, year: parseInt(value) })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-purple-300">Categoria</Label>
            <Select value={filters.category} onValueChange={(value) => onFilterChange({ ...filters, category: value })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="aluguel_financiamento">Aluguel</SelectItem>
                <SelectItem value="supermercado">Supermercado</SelectItem>
                <SelectItem value="combustivel">Combustível</SelectItem>
                <SelectItem value="farmacia">Farmácia</SelectItem>
                <SelectItem value="salario">Salário</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}