import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const categoryIcons = {
  alimentacao: "🍽️",
  transporte: "🚗",
  moradia: "🏠",
  saude: "⚕️",
  lazer: "🎮",
  educacao: "📚",
  cartao: "💳",
  outros: "📦"
};

export default function TransactionList({ transactions, isLoading, onEdit, onDelete, onStatusChange }) {
  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Lista de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 mb-2 bg-white/10" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Lista de Transações ({transactions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-purple-300">Data</TableHead>
                <TableHead className="text-purple-300">Descrição</TableHead>
                <TableHead className="text-purple-300">Categoria</TableHead>
                <TableHead className="text-purple-300">Valor</TableHead>
                <TableHead className="text-purple-300">Status</TableHead>
                <TableHead className="text-purple-300">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-purple-300 py-8">
                    Nenhuma transação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white">
                      {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{categoryIcons[transaction.category]}</span>
                        {transaction.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-bold ${transaction.type === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {transaction.type === 'receita' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          transaction.status === 'pago'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : transaction.status === 'atrasado'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {transaction.status !== 'pago' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onStatusChange(transaction.id, 'pago')}
                            className="text-emerald-400 hover:bg-emerald-500/20"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(transaction)}
                          className="text-blue-400 hover:bg-blue-500/20"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(transaction.id)}
                          className="text-rose-400 hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}