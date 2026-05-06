import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Save, ChevronDown } from "lucide-react";
import { parseTransactionInput } from "@/utils/transactionParser";
import { api } from "@/services/api";

const categories = {
  "Alimentação": [
    { value: "acougue", label: "Açougue" },
    { value: "delivery", label: "Delivery" },
    { value: "feira", label: "Feira / Sacolão" },
    { value: "hortifruti", label: "Hortifruti" },
    { value: "lanches", label: "Lanches / Fast Food" },
    { value: "padaria", label: "Padaria" },
    { value: "restaurantes", label: "Restaurantes" },
    { value: "supermercado", label: "Supermercado" }
  ],
  "Casa e Manutenção": [
    { value: "eletrodomesticos", label: "Eletrodomésticos" },
    { value: "limpeza", label: "Produtos de limpeza" },
    { value: "moveis", label: "Móveis / Decoração" },
    { value: "reparos", label: "Reparos / Materiais" },
    { value: "utensilios", label: "Utensílios domésticos" }
  ],
  "Compras Pessoais": [
    { value: "acessorios", label: "Acessórios" },
    { value: "calcados", label: "Calçados" },
    { value: "cosmeticos", label: "Cosméticos / Perfumaria" },
    { value: "eletronicos", label: "Eletrônicos" },
    { value: "presentes", label: "Presentes" },
    { value: "roupas", label: "Roupas" }
  ],
  "Despesas Fixas": [
    { value: "agua", label: "Água e esgoto" },
    { value: "aluguel_financiamento", label: "Aluguel / Financiamento" },
    { value: "condominio", label: "Condomínio" },
    { value: "energia", label: "Energia elétrica" },
    { value: "internet", label: "Internet" },
    { value: "ipva_iptu", label: "IPVA / IPTU" },
    { value: "seguros", label: "Seguros" },
    { value: "telefone", label: "Telefone / Celular" },
    { value: "tv_assinatura", label: "TV por assinatura" }
  ],
  "Doações": [
    { value: "ajuda_familiar", label: "Ajuda a familiares" },
    { value: "doacoes", label: "Doações a instituições" }
  ],
  "Educação": [
    { value: "assinaturas_educacao", label: "Assinaturas educacionais" },
    { value: "cursos", label: "Cursos / Faculdades" },
    { value: "livros", label: "Livros" },
    { value: "material_didatico", label: "Material didático" }
  ],
  "Família": [
    { value: "baba", label: "Babá / Cuidador" },
    { value: "brinquedos", label: "Brinquedos" },
    { value: "escola", label: "Escola" },
    { value: "mesada", label: "Mesada" },
    { value: "roupas_infantis", label: "Roupas infantis" }
  ],
  "Financeiro": [
    { value: "cartao_credito", label: "Cartão de crédito" },
    { value: "emprestimos", label: "Empréstimos" },
    { value: "juros_multas", label: "Juros / Multas" },
    { value: "taxas_bancarias", label: "Taxas bancárias" }
  ],
  "Lazer": [
    { value: "cinema_teatro", label: "Cinema / Teatro" },
    { value: "festas", label: "Festas / Eventos" },
    { value: "jogos", label: "Jogos" },
    { value: "passeios", label: "Passeios" },
    { value: "viagens", label: "Viagens" }
  ],
  "Negócios": [
    { value: "consultorias", label: "Consultorias" },
    { value: "equipamentos", label: "Equipamentos" },
    { value: "escritorio", label: "Materiais de escritório" },
    { value: "hospedagem_site", label: "Hospedagem de site" },
    { value: "impostos", label: "Impostos / Taxas" },
    { value: "marketing", label: "Propaganda e marketing" },
    { value: "terceirizados", label: "Serviços terceirizados" }
  ],
  "Pets": [
    { value: "banho_tosa", label: "Banho e tosa" },
    { value: "pets_acessorios", label: "Acessórios para pets" },
    { value: "racao", label: "Ração" },
    { value: "veterinario", label: "Veterinário" }
  ],
  "Receitas": [
    { value: "freelance", label: "Freelance" },
    { value: "salario", label: "Salário" },
    { value: "vendas", label: "Vendas" }
  ],
  "Saúde": [
    { value: "academia", label: "Academia / Personal" },
    { value: "consultas", label: "Consultas médicas" },
    { value: "exames", label: "Exames" },
    { value: "farmacia", label: "Farmácia" },
    { value: "odontologia", label: "Odontologia" },
    { value: "plano_saude", label: "Plano de saúde" }
  ],
  "Tecnologia": [
    { value: "dominios", label: "Domínios / Hospedagem" },
    { value: "nuvem", label: "Serviços em nuvem" },
    { value: "softwares", label: "Softwares / Licenças" },
    { value: "streaming", label: "Streaming (Netflix, Spotify)" }
  ],
  "Transporte": [
    { value: "combustivel", label: "Combustível" },
    { value: "documentacao_veiculo", label: "Documentação / IPVA" },
    { value: "estacionamento", label: "Estacionamento" },
    { value: "manutencao_veiculo", label: "Manutenção do veículo" },
    { value: "pedagio", label: "Pedágio" },
    { value: "seguro_carro", label: "Seguro do carro" },
    { value: "transporte_publico", label: "Transporte público" },
    { value: "uber_99", label: "Uber / 99" }
  ],
  "Outros": [
    { value: "outros", label: "Outros" }
  ]
};

const allCategoryItems = Object.entries(categories).flatMap(([group, items]) =>
  items.map(item => ({ ...item, group }))
);

function categoriesForTxnType(txnType) {
  if (txnType === "receita") {
    return allCategoryItems.filter((i) => i.group === "Receitas");
  }
  return allCategoryItems.filter((i) => i.group !== "Receitas");
}

function slugValidForTxnType(slug, txnType) {
  return categoriesForTxnType(txnType).some((i) => i.value === slug);
}

function defaultCategoryFor(txnType) {
  return txnType === "receita" ? "salario" : "outros";
}

function localYMD(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseBrazilMoney(str) {
  const normalized = String(str ?? "").trim().replace(/\./g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : NaN;
}

function formatBrazilMoneyInput(n) {
  if (!Number.isFinite(Number(n))) return "0,00";
  return Number(n).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function defaultFormBlank() {
  return {
    description: "",
    amount: "0,00",
    date: localYMD(),
    category: "outros",
    type: "despesa",
    payment_method: "pix",
    status: "pendente",
    is_recurring: false,
    is_installment: false,
    total_installments: 1,
    has_interest: false,
    interest_rate: "0"
  };
}

function applyParserToFields(prev, parsed) {
  const incomingType = parsed.type || prev.type;
  let next = { ...prev, type: incomingType };
  if (parsed.description) next.description = parsed.description;
  if (parsed.amount != null && Number.isFinite(parsed.amount) && parsed.amount > 0) {
    next.amount = formatBrazilMoneyInput(parsed.amount);
  }
  if (parsed.date) next.date = parsed.date;
  if (parsed.payment_method) next.payment_method = parsed.payment_method;
  if (parsed.is_recurring !== undefined) next.is_recurring = parsed.is_recurring;
  if (parsed.category && slugValidForTxnType(parsed.category, next.type)) {
    next.category = parsed.category;
  }
  if (!slugValidForTxnType(next.category, next.type)) {
    next.category = defaultCategoryFor(next.type);
  }
  return next;
}

function sanitizeTypingBRL(raw) {
  let s = String(raw ?? "").replace(/[^\d,]/g, "");
  const i = s.indexOf(",");
  if (i === -1) return s;
  return s.slice(0, i + 1) + s.slice(i + 1).replace(/,/g, "");
}

function normalizeMoneyBlur(raw) {
  const n = parseBrazilMoney(raw);
  return Number.isFinite(n) ? formatBrazilMoneyInput(n) : "0,00";
}

/** @typedef {{ description: string, category?: string|null, payment_method?: string|null, type?: string }} SuggestionRow */

/** Prefer slug do parser; senão slug da API. `prev` = estado do formulário. */
/** @param {SuggestionRow & { paymentMethod?: string }} s */
function mergeSuggestion(parserCategorySlug, prev, s) {
  let next = { ...prev };
  if (s.type && ["receita", "despesa", "investimento"].includes(s.type)) {
    next.type = s.type;
  }
  if (s.payment_method) {
    next.payment_method = s.payment_method;
  } else if (s.paymentMethod) {
    const L = String(s.paymentMethod).toLowerCase();
    if (L.includes("pix")) next.payment_method = "pix";
    else if (L.includes("débito") || L.includes("debito")) next.payment_method = "cartao_debito";
    else if (L.includes("dinheiro")) next.payment_method = "dinheiro";
    else if (L.includes("boleto")) next.payment_method = "boleto";
    else if (L.includes("transfer")) next.payment_method = "transferencia";
    else if (L.includes("cart")) next.payment_method = "cartao_credito";
  }
  const slug =
    parserCategorySlug != null && parserCategorySlug !== ""
      ? parserCategorySlug
      : typeof s.category === "string"
        ? s.category
        : null;
  if (slug && slugValidForTxnType(slug, next.type)) next.category = slug;
  else if (slug && !slugValidForTxnType(slug, next.type))
    next.category = defaultCategoryFor(next.type);
  return next;
}

function txnToFormState(transaction) {
  if (!transaction) return defaultFormBlank();
  return {
    description: transaction.description ?? "",
    amount: formatBrazilMoneyInput(transaction.amount),
    date:
      typeof transaction.date === "string"
        ? transaction.date.slice(0, 10)
        : localYMD(),
    category: transaction.category ?? "outros",
    type: transaction.type ?? "despesa",
    payment_method: transaction.payment_method ?? "pix",
    status: transaction.status ?? "pendente",
    is_recurring: !!transaction.is_recurring,
    is_installment: !!transaction.is_installment,
    total_installments: transaction.total_installments ?? 1,
    has_interest: !!transaction.has_interest,
    interest_rate:
      transaction.interest_rate != null ? String(transaction.interest_rate) : "0"
  };
}

function CategoryAutocomplete({ value, onChange, txnType }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const pool = useMemo(() => categoriesForTxnType(txnType), [txnType]);
  const selectedItem = pool.find(i => i.value === value);

  const filtered =
    search.trim() === ""
      ? pool
      : pool.filter(
          i =>
            i.label.toLowerCase().includes(search.toLowerCase()) ||
            i.group.toLowerCase().includes(search.toLowerCase())
        );

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  useEffect(() => {
    const handleClickOutside = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = item => {
    onChange(item.value);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex items-center bg-white/5 border border-white/10 rounded-md px-3 py-2 cursor-pointer text-white"
        onClick={() => {
          setOpen(true);
          setSearch("");
        }}
      >
        <span className={`flex-1 text-sm ${selectedItem ? "text-white" : "text-gray-400"}`}>
          {open ? (
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar categoria..."
              className="bg-transparent outline-none w-full text-white placeholder-gray-400"
              onClick={e => e.stopPropagation()}
            />
          ) : selectedItem ? (
            `${selectedItem.group} › ${selectedItem.label}`
          ) : (
            "Selecione a categoria"
          )}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-white/10 rounded-md shadow-xl max-h-64 overflow-y-auto">
          {Object.keys(grouped).length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">Nenhuma categoria encontrada</div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <div className="px-3 py-1.5 text-xs font-semibold text-purple-400 bg-white/5 sticky top-0">
                  {group}
                </div>
                {items.map(item => (
                  <div
                    key={item.value}
                    onMouseDown={() => handleSelect(item)}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-purple-500/20 ${
                      value === item.value ? "text-purple-300 font-medium" : "text-white"
                    }`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function TransactionForm({ transaction, onSubmit, onCancel, isProcessing }) {
  const txnId = transaction?.id ?? "__new__";
  const [formData, setFormData] = useState(() => txnToFormState(transaction));
  const [smartLine, setSmartLine] = useState("");
  const [parseNotice, setParseNotice] = useState("");
  /** @type {[SuggestionRow[], function]} */
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    setFormData(txnToFormState(transaction));
    setSmartLine("");
    setParseNotice("");
    setSuggestions([]);
  }, [txnId]);

  useEffect(() => {
    const q = (formData.description || "").trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }
    const tmr = window.setTimeout(() => {
      api
        .get(`/transactions/suggestions?q=${encodeURIComponent(q)}`)
        .then(res => setSuggestions(Array.isArray(res?.suggestions) ? res.suggestions : []))
        .catch(() => setSuggestions([]));
    }, 320);
    return () => clearTimeout(tmr);
  }, [formData.description]);

  useEffect(() => {
    setFormData(f =>
      slugValidForTxnType(f.category, f.type)
        ? f
        : { ...f, category: defaultCategoryFor(f.type) }
    );
  }, [formData.type, formData.category]);

  const submitPayloadFromState = useCallback(fd => {
    const amountNum = parseBrazilMoney(fd.amount);
    const interestPct = parseFloat(String(fd.interest_rate).replace(",", ".")) || 0;
    return {
      ...fd,
      amount: amountNum,
      total_installments: parseInt(String(fd.total_installments), 10) || 1,
      interest_rate: interestPct
    };
  }, []);

  const tryQuickSubmit = async e => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const qTrim = smartLine.trim();

    /** Busca fresco para funcionar mesmo quando o usuário só preenche a linha rápida */
    let suggFresh = suggestions;
    if (qTrim.length >= 2) {
      try {
        const res = await api.get(
          `/transactions/suggestions?q=${encodeURIComponent(qTrim)}`
        );
        suggFresh = Array.isArray(res?.suggestions) ? res.suggestions : [];
      } catch {
        suggFresh = [];
      }
    }

    const parsed = parseTransactionInput(smartLine);
    let working = applyParserToFields(formData, parsed);
    const parserSlug =
      parsed.category != null && parsed.category !== "" ? parsed.category : null;

    const q = qTrim.toLowerCase();
    const candidates =
      q.length >= 2
        ? suggFresh.filter(s => (s.description || "").toLowerCase().includes(q))
        : [];

    if (candidates.length === 1) {
      working = mergeSuggestion(parserSlug, working, candidates[0]);
    } else if (candidates.length > 1) {
      const exact = candidates.find(
        s => (s.description || "").toLowerCase() === q
      );
      if (exact) working = mergeSuggestion(parserSlug, working, exact);
    }

    setFormData(working);

    const auto =
      !!(parsed.amount && parsed.payment_method) ||
      !!parsed.date ||
      !!parserSlug ||
      !!parsed.is_recurring ||
      !!candidates.length;
    setParseNotice(auto ? "Campos preenchidos automaticamente." : "");

    const payload = submitPayloadFromState(working);
    if (!String(payload.description || "").trim()) return;
    if (!Number.isFinite(payload.amount) || payload.amount <= 0 || !payload.date) return;
    const t = payload.type;
    if (t !== "receita" && t !== "despesa" && t !== "investimento") return;
    onSubmit(payload);
  };

  const handleSubmit = e => {
    e.preventDefault();
    const payload = submitPayloadFromState(formData);
    onSubmit(payload);
  };

  const applySuggestionChip = (/** @type {SuggestionRow & { paymentMethod?: string }} */ s) => {
    setFormData(prev =>
      mergeSuggestion(typeof s.category === "string" ? s.category : null, prev, s)
    );
    setParseNotice("Campos preenchidos a partir do histórico.");
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
              {transaction ? "Editar Transação" : "Nova Transação"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!transaction && (
              <div className="space-y-2 pb-3 border-b border-white/10">
                <Label htmlFor="smart-line" className="text-purple-300">
                  Entrada rápida (português)
                </Label>
                <Input
                  id="smart-line"
                  value={smartLine}
                  onChange={e => setSmartLine(e.target.value)}
                  onKeyDown={tryQuickSubmit}
                  placeholder="Ex.: ifood 45,90 pix ontem ou salário 5000 mensal"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  autoComplete="off"
                />
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-purple-200 h-8"
                    onClick={() =>
                      setFormData(f => ({ ...f, date: localYMD(new Date()), payment_method: f.payment_method }))
                    }
                  >
                    Hoje
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-purple-200 h-8"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 1);
                      setFormData(f => ({ ...f, date: localYMD(d) }));
                    }}
                  >
                    Ontem
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-purple-200 h-8"
                    onClick={() => setFormData(f => ({ ...f, payment_method: "pix" }))}
                  >
                    PIX
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-purple-200 h-8"
                    onClick={() => setFormData(f => ({ ...f, payment_method: "cartao_credito" }))}
                  >
                    Cartão crédito
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-purple-200 h-8"
                    onClick={() => setFormData(f => ({ ...f, payment_method: "dinheiro" }))}
                  >
                    Dinheiro
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-purple-200 h-8"
                    onClick={() =>
                      setFormData(f =>
                        slugValidForTxnType(f.category, "receita")
                          ? { ...f, type: "receita" }
                          : {
                              ...f,
                              type: "receita",
                              category: defaultCategoryFor("receita")
                            }
                      )
                    }
                  >
                    Receita
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-purple-200 h-8"
                    onClick={() =>
                      setFormData(f =>
                        slugValidForTxnType(f.category, "despesa")
                          ? { ...f, type: "despesa" }
                          : {
                              ...f,
                              type: "despesa",
                              category: defaultCategoryFor("despesa")
                            }
                      )
                    }
                  >
                    Despesa
                  </Button>
                </div>
                {parseNotice ? (
                  <p className="text-xs text-amber-400/95 animate-pulse">{parseNotice}</p>
                ) : null}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-purple-300">
                  Descrição
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      description: e.target.value
                    })
                  }
                  placeholder="Ex.: Compra no mercado"
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
                {!transaction && suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestions.slice(0, 6).map((s, i) => (
                      <Button
                        key={`${s.description}-${i}`}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs border-white/15 text-purple-100 h-auto py-1 max-w-full truncate"
                        onClick={() => applySuggestionChip(s)}
                      >
                        {s.paymentMethod ? `${s.description} (${s.paymentMethod})` : s.description}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-purple-300">
                  Valor (R$)
                </Label>
                <Input
                  id="amount"
                  inputMode="decimal"
                  value={formData.amount}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      amount: sanitizeTypingBRL(e.target.value)
                    })
                  }
                  onBlur={() =>
                    setFormData(f => ({
                      ...f,
                      amount: normalizeMoneyBlur(f.amount)
                    }))
                  }
                  placeholder="0,00"
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-purple-300">
                  Data
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      date: e.target.value
                    })
                  }
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-purple-300">
                  Tipo
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={value =>
                    setFormData({
                      ...formData,
                      type: value
                    })
                  }
                >
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
                <Label className="text-purple-300">Categoria</Label>
                <CategoryAutocomplete
                  value={formData.category}
                  onChange={value => setFormData({ ...formData, category: value })}
                  txnType={formData.type}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method" className="text-purple-300">
                  Forma de Pagamento
                </Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={value =>
                    setFormData({
                      ...formData,
                      payment_method: value
                    })
                  }
                >
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
                <Label htmlFor="status" className="text-purple-300">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={value =>
                    setFormData({
                      ...formData,
                      status: value
                    })
                  }
                >
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
                  onCheckedChange={checked =>
                    setFormData({
                      ...formData,
                      is_recurring: checked
                    })
                  }
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
                  onCheckedChange={checked =>
                    setFormData({
                      ...formData,
                      is_installment: checked
                    })
                  }
                  className="border-white/20"
                />
                <Label htmlFor="installment" className="text-purple-300 cursor-pointer">
                  Parcelado / Dívida
                </Label>
              </div>

              {formData.is_installment && (
                <div className="grid md:grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="installments" className="text-purple-300">
                      Número de Parcelas
                    </Label>
                    <Input
                      id="installments"
                      type="number"
                      min="1"
                      value={formData.total_installments}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          total_installments: e.target.value
                        })
                      }
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="interest"
                      checked={formData.has_interest}
                      onCheckedChange={checked =>
                        setFormData({
                          ...formData,
                          has_interest: checked
                        })
                      }
                      className="border-white/20"
                    />
                    <Label htmlFor="interest" className="text-purple-300 cursor-pointer">
                      Possui juros
                    </Label>
                  </div>

                  {formData.has_interest && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="interest_rate" className="text-purple-300">
                        Taxa de Juros (% ao mês)
                      </Label>
                      <Input
                        id="interest_rate"
                        type="number"
                        step="0.01"
                        value={formData.interest_rate}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            interest_rate: e.target.value
                          })
                        }
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
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {isProcessing ? "Salvando..." : "Salvar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
