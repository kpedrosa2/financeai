/**
 * Interpretação local de entrada rápida de transações (idioma PT-BR).
 * @param {string} text
 * @returns {{
 *   description: string | null,
 *   amount: number | null,
 *   type: "receita" | "despesa",
 *   date: string | null,
 *   payment_method: string | null,
 *   category: string | null,
 *   suggestedCategoryLabel: string | null,
 *   is_recurring: boolean,
 *   recurrenceNote: string | null,
 * }}
 */
export function parseTransactionInput(text) {
  const raw = String(text || "").trim();
  if (!raw) {
    return emptyResult();
  }

  let t = raw.normalize("NFD").replace(/\p{M}/gu, "").replace(/\s+/g, " ").trim().toLowerCase();

  const today = new Date();
  /** @returns {Date} date at local noon */
  const atNoon = (d) => {
    const x = new Date(d);
    x.setHours(12, 0, 0, 0);
    return x;
  };

  const toYMD = (d) => atNoon(d).toISOString().slice(0, 10);

  let dateResolved = today;
  if (/\bamanha\b/.test(t) || /\bamanhã\b/i.test(raw)) {
    dateResolved = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    t = t.replace(/\bamanha\b/g, " ").replace(/\bamanhã\b/gi, " ");
  } else if (/\bhoje\b/.test(t)) {
    dateResolved = new Date(today);
    t = t.replace(/\bhoje\b/g, " ");
  } else if (/\bontem\b/.test(t)) {
    dateResolved = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    t = t.replace(/\bontem\b/g, " ");
  }

  /** Recorrência */
  let is_recurring =
    /\bmensal\b/.test(t) ||
    /\bpor\s*m(es|ês)\b/.test(t) ||
    /\btodo\s*mes\b/.test(t) ||
    /\btodo\s*mês\b/i.test(raw) ||
    /\bfixa\b/.test(t);
  let recurrenceNote = null;

  let dayOfMonthRule = null;
  const dm = t.match(/\btodo\s*dia\s*(\d{1,2})\b/);
  if (dm) {
    dayOfMonthRule = parseInt(dm[1], 10);
    is_recurring = true;
    recurrenceNote = `Repetição prevista todo dia ${dayOfMonthRule} do mês.`;
    t = t.replace(dm[0], " ");
    const y = today.getFullYear();
    const m = today.getMonth();
    const dim = new Date(y, m + 1, 0).getDate();
    const dtarget = Math.min(dayOfMonthRule, dim);
    let candidate = new Date(y, m, dtarget, 12, 0, 0, 0);
    if (candidate > today) {
      dateResolved = candidate;
    } else {
      const nm = m + 1;
      const dim2 = new Date(y, nm + 1, 0).getDate();
      const d2 = Math.min(dayOfMonthRule, dim2);
      candidate = new Date(y, nm, d2, 12, 0, 0, 0);
      dateResolved = candidate;
    }
  }

  /** Formas de pagamento (valores aceitos pelo Select atual) */
  let payment_method = null;
  if (/\bpix\b/.test(t)) {
    payment_method = "pix";
    t = t.replace(/\bpix\b/g, " ");
  }
  if (/\bboleto\b/.test(t)) {
    payment_method = "boleto";
    t = t.replace(/\bboleto\b/g, " ");
  }
  if (/\bdinheiro\b/.test(t)) {
    payment_method = "dinheiro";
    t = t.replace(/\bdinheiro\b/g, " ");
  }
  const cardHint = /\bcart(?:a|ã)o\b|\bcard\b/.test(raw.toLowerCase());
  if (cardHint) {
    if (/\bdebito\b|\bdeb(?:i|í)to\b/.test(t)) payment_method = "cartao_debito";
    else payment_method = "cartao_credito";
    t = t.replace(/\bcart(?:ao|ão)\s*de\s*debito\b/gi, " ");
    t = t.replace(/\bcart(?:ao|ão)\s*de\s*débito\b/gi, " ");
    t = t.replace(/\bcart(?:ao|ão)\s*deb/i, " ");
    t = t.replace(/\bcart(?:ao|ão)\s*cred\b/gi, " ");
    t = t.replace(/\bcart(?:ao|ão)?\b/gi, " ");
  }

  is_recurring = is_recurring || /\bmensal\b/.test(t);
  if (/\bmensal\b/.test(t)) {
    recurrenceNote = recurrenceNote || "Recorrência mensal detectada.";
    t = t.replace(/\bmensal\b/g, " ");
  }
  if (/\btodo\s*m[eê]s\b/.test(t) || /\btodo\s*mes\b/.test(t)) {
    is_recurring = true;
    recurrenceNote = recurrenceNote || "Recorrência mensal detectada.";
    t = t.replace(/\btodo\s*m[eê]s\b/g, " ").replace(/\btodo\s*mes\b/g, " ");
  }

  /** Extrair valores monetários (vírgula BR) — pega ocorrências bem formadas preferindo maior plausível */
  const moneyRegex = /\b\d{1,3}(?:\.\d{3})*(?:,\d{2})?\b|\b\d+,\d{2}\b|\b\d{3,}(?:,\d{2})?\b/gi;
  const hits = [...t.matchAll(new RegExp(moneyRegex.source, "gi"))]
    .map((m) => m[0])
    .filter(Boolean);

  /** @returns {number} */
  function parseBrazilNumber(s) {
    const normalized = String(s).replace(/\./g, "").replace(",", ".");
    return parseFloat(normalized);
  }

  let amount = null;
  let amountStr = null;
  if (hits.length) {
    const withCentsComma = hits.find((h) => /^\d+[.,]\d{2}$/.test(h.replace(/\./g, "")));
    amountStr = withCentsComma || hits[0];
    amount = parseBrazilNumber(amountStr);
    if (!Number.isFinite(amount) || amount <= 0) {
      amount = null;
      amountStr = null;
    } else {
      t = t.replace(amountStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), " ");
    }
  }

  t = t.replace(/r\$/g, " ").replace(/\s+/g, " ").trim();

  /** Palavras de receita */
  const incomeKeys =
    /\b(salar(?:io|io)|salários|salario\b|salário\b)/.test(raw.toLowerCase()) ||
    /\bfreelas?\b/.test(raw.toLowerCase()) ||
    /\bfreelancer\b/i.test(raw) ||
    /\brecebido\b/.test(raw.toLowerCase()) ||
    /\bpagamento\s+recebido\b/.test(raw.toLowerCase());
  let type = incomeKeys ? "receita" : "despesa";

  /** Inferir categorias por palavra-chave (slug válido no formulário) */
  const catMatch = categorizeFromText(`${raw.toLowerCase()} ${t}`);
  let category = catMatch?.slug || null;
  let suggestedCategoryLabel = catMatch?.label || null;

  /** Ajustes finos quando receita típica */
  if (type === "receita" && !category && /\bfreela/.test(`${raw}`)) {
    category = "freelance";
    suggestedCategoryLabel = "Receitas › Freelance";
  }
  if (type === "receita" && !category) {
    category = "salario";
    suggestedCategoryLabel = "Receitas › Salário";
  }

  const descriptionPieces = t
    .trim()
    .split(/\s+/)
    .filter((w) => w && !/^\d+$/.test(w));
  let description =
    descriptionPieces.join(" ").replace(/\s+/g, " ").trim() ||
    raw.split(/\s+/).slice(0, 3).join(" ");

  if (/^ifood/.test(description)) description = "iFood";

  description = capitalizeFirst(description.trim()) || capitalizeFirst(raw.split(/\s|\d/)[0] || "Transação");

  return {
    description: description || null,
    amount,
    type,
    date: toYMD(dateResolved),
    payment_method,
    category,
    suggestedCategoryLabel,
    is_recurring: Boolean(is_recurring),
    recurrenceNote,
  };
}

/** @typedef {{ slug: string, label: string }} CatHint */
/** @returns {CatHint|null} */
function categorizeFromText(s) {
  const x = String(s || "").toLowerCase();

  if (/\bifood\b|\brappi\b|\buber\s*eats\b|\bi\s*food\b/.test(x))
    return { slug: "delivery", label: "Alimentação › Delivery" };
  if (/\bpadaria\b/.test(x)) return { slug: "padaria", label: "Alimentação › Padaria" };
  if (/\bm(?:e|ê)rcado\b|\bsuper\s*mercado\b|\bfeira\b/.test(x))
    return { slug: "supermercado", label: "Alimentação › Supermercado" };
  if (/\blanche\b|\brestaurante\b/.test(x))
    return { slug: "restaurantes", label: "Alimentação › Restaurantes" };

  if (/\buber\b|\b99\b/.test(x)) return { slug: "uber_99", label: "Transporte › Uber / 99" };
  if (/\bgasolina\b|\bposto\b|\bcombustível\b|\bcombustivel\b/.test(x))
    return { slug: "combustivel", label: "Transporte › Combustível" };
  if (/ônibus|onibus|\bbrt\b|\bmetro\b/.test(x))
    return { slug: "transporte_publico", label: "Transporte › Transporte público" };

  if (/\baluguel\b|\blocação\b|\blocacao\b/.test(x))
    return { slug: "aluguel_financiamento", label: "Despesas Fixas › Aluguel / Financiamento" };
  if (/\bcondom(?:i|í)nio\b/.test(x)) return { slug: "condominio", label: "Despesas Fixas › Condomínio" };
  if (/\benergia\b|\bluz\b/.test(x)) return { slug: "energia", label: "Despesas Fixas › Energia elétrica" };
  if (/\b(?:água|\bagua\b)\b|\besgoto\b/.test(x))
    return { slug: "agua", label: "Despesas Fixas › Água e esgoto" };

  if (/\bnetflix\b|\bspotify\b|\bstreaming\b|\bassinatura\s*(?:de\s*)?(?:video|vídeo)\b/.test(x))
    return { slug: "streaming", label: "Tecnologia › Streaming (Netflix, Spotify)" };
  if (/\bcinema\b|\bteatro\b/.test(x)) return { slug: "cinema_teatro", label: "Lazer › Cinema / Teatro" };

  if (/\bfarmac(?:ias?|ías?)\b|\b(?:remédio|remedio)s?\b|\bconsulta\b|\b(saude|saúde)\b|\bplano\b/.test(x)) {
    if (/\bconsulta\b/.test(x)) return { slug: "consultas", label: "Saúde › Consultas médicas" };
    if (/\bplano\b/.test(x)) return { slug: "plano_saude", label: "Saúde › Plano de saúde" };
    return { slug: "farmacia", label: "Saúde › Farmácia" };
  }

  return null;
}

function capitalizeFirst(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function emptyResult() {
  return {
    description: null,
    amount: null,
    type: "despesa",
    date: null,
    payment_method: null,
    category: null,
    suggestedCategoryLabel: null,
    is_recurring: false,
    recurrenceNote: null,
  };
}
