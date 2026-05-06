/**
 * Formatadores PT-BR para números, moeda e períodos — usados em gráficos e dashboard.
 * @param {number} value
 */
export function formatCurrency(value) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
}

/** Número genérico (ex.: eixos) */
export function formatNumber(value) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(safe);
}

/**
 * Percentual em pontos percentuais: 52.334 → "52,3%"
 * @param {number} valuePercentPoints
 */
export function formatPercent(valuePercentPoints) {
  const n = Number(valuePercentPoints);
  const safe = Number.isFinite(n) ? n : 0;
  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(safe)}%`;
}

/**
 * Formata razão decimal (ex.: 0.423 → "42,3%")
 * @param {number} ratio 0–1+
 */
export function formatPercentRatio(ratio) {
  const n = Number(ratio);
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(safe);
}

/**
 * "2026-05" ou Date → etiqueta curtinha (mai/2026 ou Mai · 2026)
 * @param {string | Date} value
 */
export function formatMonth(value) {
  if (!value) return "";
  let d;
  if (value instanceof Date) {
    d = value;
  } else if (typeof value === "string" && /^\d{4}-\d{2}$/.test(value)) {
    const [y, m] = value.split("-").map(Number);
    d = new Date(y, (m || 1) - 1, 1);
  } else {
    d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
  }
  const mon = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  const label = mon.charAt(0).toUpperCase() + mon.slice(1);
  return `${label}/${d.getFullYear()}`;
}

/** Estilo único dos tooltips Recharts (fundo claro, texto escuro) */
export function getChartTooltipContentStyle() {
  return {
    backgroundColor: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(17,24,39,0.08)",
    borderRadius: "12px",
    color: "#111827",
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.12), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
    padding: "10px 12px",
  };
}
