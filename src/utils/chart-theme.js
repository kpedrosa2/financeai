/** Paleta única Dashboard — comandos FINANCEAI (contraste sobre fundo roxo escuro). */
export const CHART_PALETTE_DEFAULT = "#F3E8FF";

export const CHART_SERIES_COLORS = {
  income: "#10B981",
  expense: "#EF4444",
  balance: "#A855F7",
};

/** Categorias de barras: contraste suficiente */
export const CATEGORY_BAR_COLORS = [
  "#34D399",
  "#A78BFA",
  "#38BDF8",
  "#FBBF24",
  "#FB7185",
  "#2DD4BF",
  "#C084FC",
  "#818CF8",
];

export function pickCategoryColor(index) {
  return CATEGORY_BAR_COLORS[index % CATEGORY_BAR_COLORS.length];
}

export const chartAxisStroke = "#E9D5FF";

export const chartAxisTickFill = "#F3E8FF";

export const chartGridStroke = "rgba(243, 232, 255, 0.12)";

export const legendTextColor = "#F3E8FF";
