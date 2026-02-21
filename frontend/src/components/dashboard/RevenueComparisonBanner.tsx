import { motion } from "framer-motion";
import type { RevenueComparison } from "../../services/dashboardService";

function formatCurrency(v: number) {
  return `GH₵ ${v.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface RevenueComparisonBannerProps {
  data: RevenueComparison;
  isDark: boolean;
}

export function RevenueComparisonBanner({ data, isDark }: RevenueComparisonBannerProps) {
  const items = [
    {
      label: "Today",
      val: formatCurrency(data.today),
      color: "text-teal-500",
    },
    {
      label: "Yesterday",
      val: formatCurrency(data.yesterday),
      color: isDark ? "text-slate-400" : "text-slate-500",
    },
    {
      label: "Change",
      val:
        data.percent_change >= 0
          ? `+${data.percent_change}%`
          : `${data.percent_change}%`,
      color: data.percent_change >= 0 ? "text-teal-500" : "text-red-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-2xl border px-5 py-4 mb-7 flex flex-wrap items-center gap-4 ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
        }`}
    >
      <div
        className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"
          }`}
      >
        Today vs Yesterday
      </div>
      <div className="flex flex-wrap gap-5 ml-auto">
        {items.map(({ label, val, color }) => (
          <div key={label} className="flex flex-col items-end sm:items-center">
            <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {label}
            </span>
            <span className={`text-sm font-semibold ${color}`}>{val}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
