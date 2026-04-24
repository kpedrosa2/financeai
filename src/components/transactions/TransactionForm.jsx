import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Save } from "lucide-react";

const categories = {
  "Despesas Fixas": [
    { value: "aluguel_financiamento", label: "Aluguel / Financiamento" },
    { value: "condominio", label: "Condomínio" },
    { value: "energia", label: "Energia elétrica" },
    { value: "agua", label: "Água e esgoto" },
    { value: "internet", label: "Internet" },
    { value: "telefone", label: "Telefone / Celular" },
    { value: "tv_assinatura", label: "TV por assinatura" },
    { value: "ipva_iptu", label: "IPVA / IPTU" },
    { value: "seguros", label: "Seguros" }
  ],
  "Alimentação": [
    { value: "supermercado", label: "Supermercado" },
    { value: "padaria", label: "Padaria" },
    { value: "acougue", label: "Açougue" },
    { value: "hortifruti", label: "Hortifruti" },
    { value: "feira", label: "Feira / Sacolão" },
    { value: "restaurantes", label: "Restaurantes" },
    { value: "lanches", label: "Lanches / Fast Food" },
    { value: "delivery", label: "Delivery" }
  ],
  "Transporte": [
    { value: "combustivel", label: "Combustível" },
    { value: "manutencao_veiculo", label: "Manutenção do veículo" },
    { value: "estacionamento", label: "Estacionamento" },
    { value: "pedagio", label: "Pedágio" },
    { value: "transporte_publico", label: "Transporte público" },
    { value: "uber_99", label: "Uber / 99" },
    { value: "seguro_carro", label: "Seguro do carro" },
    { value: "documentacao_veiculo", label: "Documentação / IPVA" }
  ],
  "Saúde": [
    { value: "plano_saude", label: "Plano de saúde" },
    { value: "farmacia", label: "Farmácia" },
    { value: "consultas", label: "Consultas médicas" },
    { value: "exames", label: "Exames" },
    { value: "odontologia", label: "Odontologia" },
    { value: "academia", label: "Academia / Personal" }
  ],
  "Compras Pessoais": [
    { value: "roupas", label: "Roupas" },
    { value: "calcados", label: "Calçados" },
    { value: "acessorios", label: "Acessórios" },
    { value: "cosmeticos", label: "Cosméticos / Perfumaria" },
    { value: "eletronicos", label: "Eletrônicos" },
    { value: "presentes", label: "Presentes" }
  ],
  "Casa e Manutenção": [
    { value: "limpeza", label: "Produtos de limpeza" },
    { value: "utensilios", label: "Utensílios domésticos" },
    { value: "reparos", label: "Reparos / Materiais" },
    { value: "moveis", label: "Móveis / Decoração" },
    { value: "eletrodomesticos", label: "Eletrodomésticos" }
  ],
  "Educação": [
    { value: "cursos", label: "Cursos / Faculdades" },
    { value: "livros", label: "Livros" },
    { value: "material_didatico", label: "Material didático" },
    { value: "assinaturas_educacao", label: "Assinaturas educacionais" }
  ],
  "Tecnologia": [
    { value: "streaming", label: "Streaming (Netflix, Spotify)" },
    { value: "softwares", label: "Softwares / Licenças" },
    { value: "nuvem", label: "Serviços em nuvem" },
    { value: "dominios", label: "Domínios / Hospedagem" }
  ],
  "Financeiro": [
    { value: "cartao_credito", label: "Cartão de crédito" },
    { value: "emprestimos", label: "Empréstimos" },
    { value: "juros_multas", label: "Juros / Multas" },
    { value: "taxas_bancarias", label: "Taxas bancárias" }
  ],
  "Lazer": [
    { value: "viagens", label: "Viagens" },
    { value: "cinema_teatro", label: "Cinema / Teatro" },
    { value: "festas", label: "Festas / Eventos" },
    { value: "passeios", label: "Passeios" },
    { value: "jogos", label: "Jogos" }
  ],
  "Família": [
    { value: "escola", label: "Escola" },
    { value: "roupas_infantis", label: "Roupas infantis" },
    { value: "brinquedos", label: "Brinquedos" },
    { value: "mesada", label: "Mesada" },
    { value: "baba", label: "Babá / Cuidador" }
  ],
  "Pets": [
    { value: "racao", label: "Ração" },
    { value: "veterinario", label: "Veterinário" },
    { value: "banho_tosa", label: "Banho e tosa" },
    { value: "pets_acessorios", label: "Acessórios para pets" }
  ],
  "Doações": [
    { value: "doacoes", label: "Doações a instituições" },
    { value: "ajuda_familiar", label: "Ajuda a familiares" }
  ],
  "Negócios": [
    { value: "escritorio", label: "Materiais de escritório" },
    { value: "equipamentos", label: "Equipamentos" },
    { value: "hospedagem_site", label: "Hospedagem de site" },
    { value: "marketing", label: "Propaganda e marketing" },
    { value: "terceirizados", label: "Serviços terceirizados" },
    { value: "consultorias", label: "Consultorias" },
    { value: "impostos", label: "Impostos / Taxas" }
  ],
  "Receitas": [
    { value: "salario", label: "Salário" },
    { value: "freelance", label: "Freelance" },
    { value: "vendas", label: "Vendas" }
  ],
  "Outros": [
    { value: "outros", label: "Outros" }
  ]
};

export default function TransactionForm({ transaction, onSubmit, onCancel, isProcessing }) {
  const [formData, setFormData] = useState(transaction || {
    description: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: "outros",
    type: "despesa",
    payment_method: "pix",
    status: "pendente",
    is_recurring: false,
    is_installment: false,
    total_installments: 1,
    has_interest: false,
    interest_rate: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ 
      ...formData, 
      amount: parseFloat(formData.amount),
      total_installments: parseInt(formData.total_installments) || 1,
      interest_rate: parseFloat(formData.interest_rate) || 0
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white text-lg">
              {transaction ? 'Editar Transação' : 'Nova Transação'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <SelectItem value="investimento">Investimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="category" className="text-purple-300">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {Object.entries(categories).map(([group, items]) => (
                      <div key={group}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-purple-400">{group}</div>
                        {items.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
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
                    <SelectItem value="boleto">Boleto</SelectItem>
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

            <div className="border-t border-white/10 pt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="recurring" 
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                  className="border-white/20"
                />
                <Label htmlFor="recurring" className="text-purple-300 cursor-pointer">
                  Transação fixa mensal (repetir até dezembro)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="installment" 
                  checked={formData.is_installment}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_installment: checked })}
                  className="border-white/20"
                />
                <Label htmlFor="installment" className="text-purple-300 cursor-pointer">
                  Parcelado / Dívida
                </Label>
              </div>

              {formData.is_installment && (
                <div className="grid md:grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="installments" className="text-purple-300">Número de Parcelas</Label>
                    <Input
                      id="installments"
                      type="number"
                      min="1"
                      value={formData.total_installments}
                      onChange={(e) => setFormData({ ...formData, total_installments: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox 
                      id="interest" 
                      checked={formData.has_interest}
                      onCheckedChange={(checked) => setFormData({ ...formData, has_interest: checked })}
                      className="border-white/20"
                    />
                    <Label htmlFor="interest" className="text-purple-300 cursor-pointer">
                      Possui juros
                    </Label>
                  </div>

                  {formData.has_interest && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="interest_rate" className="text-purple-300">Taxa de Juros (% ao mês)</Label>
                      <Input
                        id="interest_rate"
                        type="number"
                        step="0.01"
                        value={formData.interest_rate}
                        onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Ex: 2.5"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel} className="border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white">
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