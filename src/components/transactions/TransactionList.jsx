import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, AlertTriangle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/formatters";

const categoryLabels = {
  aluguel_financiamento: "Aluguel",
  condominio: "Condomínio",
  energia: "Energia",
  agua: "Água",
  internet: "Internet",
  telefone: "Telefone",
  tv_assinatura: "TV",
  ipva_iptu: "IPVA/IPTU",
  seguros: "Seguros",
  supermercado: "Supermercado",
  padaria: "Padaria",
  acougue: "Açougue",
  hortifruti: "Hortifruti",
  feira: "Feira",
  restaurantes: "Restaurantes",
  lanches: "Lanches",
  delivery: "Delivery",
  combustivel: "Combustível",
  manutencao_veiculo: "Manutenção",
  estacionamento: "Estacionamento",
  pedagio: "Pedágio",
  transporte_publico: "Transporte",
  uber_99: "Uber/99",
  seguro_carro: "Seguro carro",
  documentacao_veiculo: "Documentação",
  plano_saude: "Plano saúde",
  farmacia: "Farmácia",
  consultas: "Consultas",
  exames: "Exames",
  odontologia: "Dentista",
  academia: "Academia",
  roupas: "Roupas",
  calcados: "Calçados",
  acessorios: "Acessórios",
  cosmeticos: "Cosméticos",
  eletronicos: "Eletrônicos",
  presentes: "Presentes",
  emprestimos: "Empréstimos",
  cartao_credito: "Cartão",
  salario: "Salário",
  freelance: "Freelance",
  vendas: "Vendas",
  outros: "Outros"
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

  const getDueAlert = (transaction) => {
    if (transaction.status !== 'pendente') return null;
    
    const today = new Date();
    const dueDate = new Date(transaction.date);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { type: 'overdue', text: 'VENCIDA', icon: AlertTriangle, color: 'text-rose-400' };
    } else if (diffDays <= 5) {
      return { type: 'warning', text: `Vence em ${diffDays}d`, icon: Clock, color: 'text-yellow-400' };
    }
    return null;
  };

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
                transactions.map((transaction) => {
                  const alert = getDueAlert(transaction);
                  return (
                    <TableRow key={transaction.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-white">
                        {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="flex flex-col gap-1">
                          <span>{transaction.description}</span>
                          {transaction.is_recurring && (
                            <Badge variant="outline" className="w-fit text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                              🔄 Recorrente
                            </Badge>
                          )}
                          {transaction.is_installment && (
                            <Badge variant="outline" className="w-fit text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                              📋 {transaction.installment_number}/{transaction.total_installments}
                            </Badge>
                          )}
                          {alert && (
                            <div className={`flex items-center gap-1 text-xs ${alert.color} font-semibold`}>
                              <alert.icon className="w-3 h-3" />
                              {alert.text}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                          {categoryLabels[transaction.category] || transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-bold ${transaction.type === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.amount)}
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
                              title="Marcar como pago"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(transaction)}
                            className="text-blue-400 hover:bg-blue-500/20"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(transaction.id)}
                            className="text-rose-400 hover:bg-rose-500/20"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}