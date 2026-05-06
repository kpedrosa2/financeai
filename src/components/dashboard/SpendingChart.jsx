import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency, getChartTooltipContentStyle } from "@/utils/formatters.js";
import {
  pickCategoryColor,
  chartAxisStroke,
  chartAxisTickFill,
  chartGridStroke,
} from "@/utils/chart-theme.js";

export default function SpendingChart({ transactions, expensesByCategory: apiBuckets }) {
  let data;

  if (apiBuckets?.length) {
    data = [...apiBuckets]
      .sort((a, b) => b.total - a.total)
      .map((b, index) => ({
        category: b.categoryName || "—",
        amount: b.total,
        pctDisplay: `${(typeof b.percentage === "number" ? b.percentage : 0).toFixed(1).replace(".", ",")}%`,
        color: pickCategoryColor(index),
      }));
  } else {
    const expensesByCategory = transactions
      .filter((t) => t.type === "despesa")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    const total = Object.values(expensesByCategory).reduce((s, x) => s + x, 0) || 1;

    data = Object.entries(expensesByCategory)
      .map(([category, amount], index) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        amount,
        pctDisplay: `${((amount / total) * 100).toFixed(1).replace(".", ",")}%`,
        color: pickCategoryColor(index),
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  const tooltipStyle = getChartTooltipContentStyle();

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 transition-shadow duration-300 hover:shadow-lg hover:shadow-purple-950/40 hover:border-white/15 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">📊 Gastos por categoria</CardTitle>
      </CardHeader>
      <CardContent className="w-full min-w-0 pb-6">
        <div className="w-full min-w-0 h-[300px] sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke={chartGridStroke} vertical={false} />
              <XAxis
                dataKey="category"
                stroke={chartAxisStroke}
                tick={{ fill: chartAxisTickFill, fontSize: 11 }}
                tickLine={{ stroke: chartAxisStroke }}
                axisLine={{ stroke: chartAxisStroke }}
                interval={0}
                angle={data.length > 5 ? -28 : 0}
                textAnchor={data.length > 5 ? "end" : "middle"}
                height={data.length > 5 ? 70 : undefined}
              />
              <YAxis
                stroke={chartAxisStroke}
                tick={{ fill: chartAxisTickFill, fontSize: 11 }}
                tickLine={{ stroke: chartAxisStroke }}
                axisLine={{ stroke: chartAxisStroke }}
                tickFormatter={(v) => formatCurrency(Number(v)).replace(/\s?R\$\s?/, "").trim()}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{
                  ...tooltipStyle,
                  minWidth: 160,
                }}
                formatter={(value, _name, ctx) => {
                  const payload = ctx?.payload ?? {};
                  const pct = payload.pctDisplay ?? "";
                  return [`${formatCurrency(Number(value))}${pct ? ` (${pct})` : ""}`, "Gasto"];
                }}
                labelStyle={{ color: "#111827", fontWeight: 600 }}
                itemStyle={{ color: "#111827" }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={48}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
