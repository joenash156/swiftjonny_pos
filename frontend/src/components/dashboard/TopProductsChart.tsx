import type { TopProduct } from "../../services/dashboardService";

function formatCurrency(v: number) {
  return `GH₵ ${v.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface TopProductsChartProps {
  data: TopProduct[];
  isDark: boolean;
}

export function TopProductsChart({ data, isDark }: TopProductsChartProps) {
  if (!data.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className={`text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          No product data for this period
        </p>
      </div>
    );
  }

  const maxQty = Math.max(...data.map((d) => d.total_quantity_sold), 1);
  const colors = [
    "bg-teal-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-amber-500",
    "bg-rose-500",
  ];

  return (
    <div className="space-y-3 flex-1">
      {data.map((p, i) => (
        <div key={p.product_id}>
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-xs font-medium truncate max-w-[60%] ${isDark ? "text-slate-300" : "text-slate-700"
                }`}
            >
              {p.name}
            </span>
            <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {p.total_quantity_sold} sold · {formatCurrency(p.total_revenue)}
            </span>
          </div>
          <div
            className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"
              }`}
          >
            <div
              className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-700`}
              style={{ width: `${(p.total_quantity_sold / maxQty) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
