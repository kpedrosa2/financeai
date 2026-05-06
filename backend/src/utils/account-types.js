/** Normaliza tipos legados em português e futuros enums em inglês. */
export function isIncomeType(type) {
  const t = String(type || "").toLowerCase();
  return t === "income" || t === "receita";
}

export function isExpenseType(type) {
  const t = String(type || "").toLowerCase();
  return t === "expense" || t === "despesa";
}
