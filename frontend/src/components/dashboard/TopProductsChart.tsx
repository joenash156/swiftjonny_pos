import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipProps,
} from "recharts";
import type { TopProduct } from "../../services/dashboardService";

function formatCurrency(v: number) {
  return `GH₵ ${v.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const BAR_COLORS = ["#14b8a6", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444"];

function CustomTooltip({ active, payload, isDark }: TooltipProps<number, string> & { isDark: boolean }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as TopProduct;
  return (
    <div
      className={`rounded-xl px-3 py-2 text-xs shadow-lg border ${isDark
          ? "bg-slate-800 border-slate-700 text-white"
          : "bg-white border-slate-200 text-slate-900"
        }`}
    >
      <p className={`font-semibold mb-1 truncate max-w-40 ${isDark ? "text-white" : "text-slate-900"}`}>
        {d.name}
      </p>
      <p className={isDark ? "text-slate-400" : "text-slate-500"}>
        Units sold:{" "}
        <span className="font-semibold text-teal-500">{d.total_quantity_sold}</span>
      </p>
      <p className={isDark ? "text-slate-400" : "text-slate-500"}>
        Revenue:{" "}
        <span className="font-semibold text-blue-500">{formatCurrency(d.total_revenue)}</span>
      </p>
    </div>
  );
}

interface TopProductsChartProps {
  data: TopProduct[];
  isDark: boolean;
}

export function TopProductsChart({ data, isDark }: TopProductsChartProps) {
  if (!data.length) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-40">
        <p className={`text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          No product data for this period
        </p>
      </div>
    );
  }

  const axisColor = isDark ? "#475569" : "#cbd5e1";
  const labelColor = isDark ? "#64748b" : "#94a3b8";
  const truncated = data.slice(0, 5).map((d) => ({
    ...d,
    shortName: d.name.length > 14 ? `${d.name.slice(0, 13)}…` : d.name,
  }));

  return (
    <div className="flex-1" style={{ minHeight: 180 }}>
      <ResponsiveContainer width="100%" height={Math.max(180, truncated.length * 44)}>
        <BarChart
          data={truncated}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          barSize={14}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={axisColor} horizontal={false} />

          <XAxis
            type="number"
            tickFormatter={(v) => String(v)}
            tick={{ fontSize: 11, fill: labelColor }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            type="category"
            dataKey="shortName"
            tick={{ fontSize: 11, fill: labelColor }}
            axisLine={false}
            tickLine={false}
            width={88}
          />

          <Tooltip
            content={<CustomTooltip isDark={isDark} />}
            cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}
          />

          <Bar dataKey="total_quantity_sold" radius={[0, 6, 6, 0]}>
            {truncated.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 px-1">
        {truncated.map((p, i) => (
          <div key={p.product_id} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
            />
            <span className={`text-[11px] truncate max-w-24 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {p.shortName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
