import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, gradient }) {
  const trendIcons = {
    positive: TrendingUp,
    negative: TrendingDown,
    neutral: Minus
  };

  const trendColors = {
    positive: "text-emerald-400",
    negative: "text-rose-400",
    neutral: "text-gray-400"
  };

  const TrendIcon = trendIcons[trend] || Minus;

  return (
    <Card className="relative overflow-hidden bg-white/5 backdrop-blur-xl border-white/10 p-6 group hover:bg-white/10 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-purple-300">{title}</p>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-2 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-20`}
          >
            <Icon className="w-5 h-5 text-white" />
          </motion.div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl md:text-3xl font-bold text-white">{value}</h3>
          
          <div className={`flex items-center gap-1 text-sm ${trendColors[trend]}`}>
            <TrendIcon className="w-4 h-4" />
            <span>{trendValue}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}