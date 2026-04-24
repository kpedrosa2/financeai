import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, AlertTriangle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "../utils/formatters";

const categoryIcons = {
  aluguel_financiamento: "🏠", condominio: "🏢", energia: "⚡", agua: "💧",
  internet: "🌐", telefone: "📱", tv_assinatura: "📺", ipva_iptu: "🚗",
  seguros: "🛡️", supermercado: "🛒", padaria: "🥖", acougue: "🥩",
  hortifruti: "🥬", feira: "🍎", restaurantes: "🍽️", lanches: "🍔",
  delivery: "🛵", combustivel: "⛽", manutencao_veiculo: "🔧", estacionamento: "🅿️",
  pedagio: "🛣️", transporte_publico: "🚌", uber_99: "🚕", seguro_carro: "🚗",
  documentacao_veiculo: "📄", plano_saude: "🏥", farmacia: "💊", consultas: "👨‍⚕️",
  exames: "🔬", odontologia: "🦷", academia: "💪", roupas: "👕",
  calcados: "👟", acessorios: "👜", cosmeticos: "💄", eletronicos: "📱",
  presentes: "🎁", limpeza: "🧹", utensilios: "🍴", reparos: "🔨",
  moveis: "🛋️", eletrodomesticos: "🔌", cursos: "📚", livros: "📖",
  material_didatico: "✏️", assinaturas_educacao: "🎓", streaming: "🎬",
  softwares: "💻", nuvem: "☁️", dominios: "🌐", cartao_credito: "💳",
  emprestimos: "💰", juros_multas: "⚠️", taxas_bancarias: "🏦",
  poupanca: "🐷", acoes: "📈", tesouro: "🏛️", criptomoedas: "₿",
  previdencia: "👴", viagens: "✈️", cinema_teatro: "🎭", festas: "🎉",
  passeios: "🎡", jogos: "🎮", escola: "🏫", roupas_infantis: "👶",
  brinquedos: "🧸", mesada: "💵", baba: "👶", racao: "🐕",
  veterinario: "🐾", banho_tosa: "🛁", pets_acessorios: "🦴",
  doacoes: "❤️", ajuda_familiar: "👨‍👩‍👧", escritorio: "🖊️",
  equipamentos: "⚙️", hospedagem_site: "🌐", marketing: "📣",
  terceirizados: "👔", consultorias: "💼", impostos: "📊",
  salario: "💰", freelance: "💻", vendas: "🤝", outros: "📦"
};

const categoryLabels = {
  aluguel_financiamento: "Aluguel", condominio: "Condomínio", energia: "Energia",
  agua: "Água", internet: "Internet", telefone: "Telefone", tv_assinatura: "TV",
  ipva_iptu: "IPVA/IPTU", seguros: "Seguros", supermercado: "Supermercado",
  padaria: "Padaria", acougue: "Açougue", hortifruti: "Hortifruti", feira: "Feira",
  restaurantes: "Restaurantes", lanches: "Lanches", delivery: "Delivery",
  combustivel: "Combustível", manutencao_veiculo: "Manutenção", estacionamento: "Estacionamento",
  pedagio: "Pedágio", transporte_publico: "Transporte", uber_99: "Uber/99",
  seguro_carro: "Seguro carro", documentacao_veiculo: "Documentação",
  plano_saude: "Plano saúde", farmacia: "Farmácia", consultas: "Consultas",
  exames: "Exames", odontologia: "Dentista", academia: "Academia",
  roupas: "Roupas", calcados: "Calçados", acessorios: "Acessórios",
  cosmeticos: "Cosméticos", eletronicos: "Eletrônicos", presentes: "Presentes",
  limpeza: "Limpeza", utensilios: "Utensílios", reparos: "Reparos",
  moveis: "Móveis", eletrodomesticos: "Eletrodomésticos", cursos: "Cursos",
  livros: "Livros", material_didatico: "Material", assinaturas_educacao: "Assinaturas",
  streaming: "Streaming", softwares: "Softwares", nuvem: "Nuvem",
  dominios: "Domínios", cartao_credito: "Cartão", emprestimos: "Empréstimos",
  juros_multas: "Juros/Multas", taxas_bancarias: "Taxas", poupanca: "Poupança",
  acoes: "Ações", tesouro: "Tesouro", criptomoedas: "Cripto",
  previdencia: "Previdência", viagens: "Viagens", cinema_teatro: "Cinema",
  festas: "Festas", passeios: "Passeios", jogos: "Jogos", escola: "Escola",
  roupas_infantis: "Roupas infantis", brinquedos: "Brinquedos", mesada: "Mesada",
  baba: "Babá", racao: "Ração", veterinario: "Veterinário",
  banho_tosa: "Banho e tosa", pets_acessorios: "Pet acessórios",
  doacoes: "Doações", ajuda_familiar: "Ajuda familiar", escritorio: "Escritório",
  equipamentos: "Equipamentos", hospedagem_site: "Hospedagem", marketing: "Marketing",
  terceirizados: "Terceirizados", consultorias: "Consultorias", impostos: "Impostos",
  salario: "Salário", freelance: "Freelance", vendas: "Vendas", outros: "Outros"
};

const getDueAlert = (transaction) => {
  if (transaction.status !== 'pendente') return null;
  const today = new Date();
  const dueDate = new Date(transaction.date);
  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { text: 'VENCIDA', color: 'text-rose-400' };
  if (diffDays <= 5) return { text: `Vence em ${diffDays}d`, color: 'text-yellow-400' };
  return null;
};

export default function TransactionList({ transactions, isLoading, onEdit, onDelete, onStatusChange }) {
  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader><CardTitle className="text-white">Lista de Transações</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 bg-white/10" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Transações ({transactions.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-3 md:p-6">
        {transactions.length === 0 ? (
          <p className="text-center text-purple-300 py-8">Nenhuma transação encontrada</p>
        ) : (
          transactions.map((transaction) => {
            const alert = getDueAlert(transaction);
            return (
              <div
                key={transaction.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                {/* Ícone */}
                <span className="text-2xl flex-shrink-0">
                  {categoryIcons[transaction.category] || "📦"}
                </span>

                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-medium text-sm truncate">{transaction.description}</p>
                    {alert && (
                      <span className={`text-xs font-bold ${alert.color}`}>{alert.text}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-purple-300">
                      {format(new Date(transaction.date), "dd/MM/yy", { locale: ptBR })}
                    </span>
                    <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300 py-0">
                      {categoryLabels[transaction.category] || transaction.category}
                    </Badge>
                    <Badge className={`text-xs py-0 ${
                      transaction.status === 'pago' ? 'bg-emerald-500/20 text-emerald-400' :
                      transaction.status === 'atrasado' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {transaction.status}
                    </Badge>
                    {transaction.is_recurring && (
                      <span className="text-xs text-blue-400">🔄</span>
                    )}
                    {transaction.is_installment && (
                      <span className="text-xs text-purple-400">
                        {transaction.installment_number}/{transaction.total_installments}x
                      </span>
                    )}
                  </div>
                </div>

                {/* Valor */}
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-sm ${transaction.type === 'receita' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex gap-1 flex-shrink-0">
                  {transaction.status !== 'pago' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/20"
                      onClick={() => onStatusChange(transaction.id, 'pago')}
                      title="Marcar como pago"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-400 hover:bg-blue-500/20"
                    onClick={() => onEdit(transaction)}
                    title="Editar"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-rose-400 hover:bg-rose-500/20"
                    onClick={() => onDelete(transaction.id)}
                    title="Excluir"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}