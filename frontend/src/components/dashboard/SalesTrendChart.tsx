import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SalesTrendPoint } from "../../services/dashboardService";

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GH", { month: "short", day: "numeric" });
}

function formatCurrency(v: number) {
  if (v >= 1000) return `GH₵ ${(v / 1000).toFixed(1)}k`;
  return `GH₵ ${v.toFixed(2)}`;
}

interface SalesTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: SalesTrendPoint }>;
  label?: string;
  isDark: boolean;
}

function CustomTooltip({ active, payload, label, isDark }: SalesTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={`rounded-xl px-3 py-2 text-xs shadow-lg border ${isDark
        ? "bg-slate-800 border-slate-700 text-white"
        : "bg-white border-slate-200 text-slate-900"
        }`}
    >
      <p className={`mb-1 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        {label ? formatShortDate(label) : ""}
      </p>
      <p className="font-semibold text-teal-500">
        {formatCurrency(payload[0]?.value ?? 0)}
      </p>
    </div>
  );
}

interface SalesTrendChartProps {
  data: SalesTrendPoint[];
  isDark: boolean;
}

export function SalesTrendChart({ data, isDark }: SalesTrendChartProps) {
  if (!data.length) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-40">
        <p className={`text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          No sales data for this period
        </p>
      </div>
    );
  }

  const gradientId = "salesTrendGradient";
  const axisColor = isDark ? "#475569" : "#cbd5e1";
  const labelColor = isDark ? "#64748b" : "#94a3b8";

  return (
    <div className="flex-1" style={{ minHeight: 180 }}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={isDark ? 0.25 : 0.18} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={axisColor} vertical={false} />

          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tick={{ fontSize: 11, fill: labelColor }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={32}
          />

          <YAxis
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
            tick={{ fontSize: 11, fill: labelColor }}
            axisLine={false}
            tickLine={false}
            width={42}
          />

          <Tooltip
            content={<CustomTooltip isDark={isDark} />}
            cursor={{ stroke: isDark ? "#334155" : "#e2e8f0", strokeWidth: 1 }}
          />

          <Area
            type="monotone"
            dataKey="total_sales"
            stroke="#14b8a6"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={{ fill: "#14b8a6", strokeWidth: 2, r: 3, stroke: isDark ? "#0f172a" : "#fff" }}
            activeDot={{ r: 5, fill: "#14b8a6", stroke: isDark ? "#0f172a" : "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
