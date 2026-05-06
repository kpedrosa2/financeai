import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency, getChartTooltipContentStyle } from "@/utils/formatters.js";
import {
  CHART_SERIES_COLORS,
  chartAxisStroke,
  chartAxisTickFill,
  chartGridStroke,
  legendTextColor,
} from "@/utils/chart-theme.js";

export default function MonthlyOverview({ transactions, netSalary: _netSalary, monthlyEvolution }) {
  let monthlyData;

  if (monthlyEvolution?.length) {
    monthlyData = monthlyEvolution.map((row) => {
      const [y, m] = row.month.split("-").map(Number);
      const d = new Date(y, (m || 1) - 1, 1);
      const label = d.toLocaleDateString("pt-BR", { month: "short" });
      const cap = label.charAt(0).toUpperCase() + label.slice(1).replace(/\.$/, "");
      return {
        month: `${cap}`,
        receitas: row.income,
        despesas: row.expense,
        saldo: row.balance,
      };
    });
  } else {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleDateString("pt-BR", { month: "short" }),
        fullDate: date,
      };
    });

    monthlyData = last6Months.map(({ month, fullDate }) => {
      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === fullDate.getMonth() && tDate.getFullYear() === fullDate.getFullYear();
      });

      const income = monthTransactions
        .filter((t) => t.type === "receita")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t) => t.type === "despesa")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month,
        receitas: income,
        despesas: expenses,
        saldo: income - expenses,
      };
    });
  }

  const tooltipStyle = getChartTooltipContentStyle();

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 transition-shadow duration-300 hover:shadow-lg hover:shadow-purple-950/40 hover:border-white/15 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white tracking-tight">📈 Evolução mensal</CardTitle>
      </CardHeader>
      <CardContent className="w-full min-w-0 pb-6">
        <div className="w-full min-w-0 h-[300px] sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke={chartGridStroke} vertical={false} />
              <XAxis
                dataKey="month"
                stroke={chartAxisStroke}
                tick={{ fill: chartAxisTickFill, fontSize: 12 }}
                tickLine={{ stroke: chartAxisStroke }}
                axisLine={{ stroke: chartAxisStroke }}
              />
              <YAxis
                stroke={chartAxisStroke}
                tick={{ fill: chartAxisTickFill, fontSize: 11 }}
                tickLine={{ stroke: chartAxisStroke }}
                axisLine={{ stroke: chartAxisStroke }}
                tickFormatter={(v) => formatCurrency(Number(v)).replace(/\s?R\$\s?/, "").trim()}
              />
              <Tooltip
                contentStyle={{
                  ...tooltipStyle,
                  minWidth: 200,
                }}
                formatter={(value) => formatCurrency(Number(value))}
                labelStyle={{ color: "#111827", fontWeight: 600 }}
                itemStyle={{ color: "#111827" }}
              />
              <Legend wrapperStyle={{ color: legendTextColor, paddingTop: 16, fontSize: 12 }} iconType="circle" />
              <Line
                type="monotone"
                dataKey="receitas"
                stroke={CHART_SERIES_COLORS.income}
                strokeWidth={2}
                dot={{ fill: CHART_SERIES_COLORS.income, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                name="Receitas"
              />
              <Line
                type="monotone"
                dataKey="despesas"
                stroke={CHART_SERIES_COLORS.expense}
                strokeWidth={2}
                dot={{ fill: CHART_SERIES_COLORS.expense, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                name="Despesas"
              />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke={CHART_SERIES_COLORS.balance}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ fill: CHART_SERIES_COLORS.balance, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                name="Saldo"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
