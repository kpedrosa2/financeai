import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "../utils/formatters";

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

export default function RecentTransactions({ transactions }) {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">📋 Transações Recentes</CardTitle>
          <Link to={createPageUrl("Transactions")}>
            <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white">
              Ver todas
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-purple-300 text-center py-8">
              Nenhuma transação este mês
            </p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center text-xl">
                    {categoryIcons[transaction.category] || "📦"}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-purple-300">
                      {format(new Date(transaction.date), "dd MMM", { locale: ptBR })} • {transaction.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className={`font-bold ${transaction.type === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        transaction.status === 'pago'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : transaction.status === 'atrasado'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                  {transaction.type === 'receita' ? (
                    <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-rose-400" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}