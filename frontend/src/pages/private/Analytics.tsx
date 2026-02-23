import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AxiosError } from "axios";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  analyticsService,
  type AnalyticsSummary,
  type TrendPoint,
  type TopProduct,
  type RevenueComparison,
  type CashierPerf,
  type DateRangeParams,
} from "../../services/analyticsService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtCurrency(v: number) {
  return `GH₵ ${v.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function today() { return toISO(new Date()); }
function yesterday() {
  const d = new Date(); d.setDate(d.getDate() - 1); return toISO(d);
}
function nDaysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n + 1); return toISO(d);
}
function startOfMonth() {
  const d = new Date(); d.setDate(1); return toISO(d);
}

function shortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GH", { month: "short", day: "numeric" });
}

type Preset = "today" | "yesterday" | "7d" | "14d" | "30d" | "month" | "custom";

const PRESETS: { key: Preset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 Days" },
  { key: "14d", label: "Last 14 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom" },
];

function presetToRange(preset: Preset): DateRangeParams {
  const t = today();
  const y = yesterday();
  switch (preset) {
    case "today": return { from: t, to: t };
    case "yesterday": return { from: y, to: y };
    case "7d": return { from: nDaysAgo(7), to: t };
    case "14d": return { from: nDaysAgo(14), to: t };
    case "30d": return { from: nDaysAgo(30), to: t };
    case "month": return { from: startOfMonth(), to: t };
    default: return { from: t, to: t };
  }
}

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────

interface ChartTooltipProps {
  active?: boolean;
  payload?: readonly { value: number }[];
  label?: string | number;
  isDark: boolean;
}
function ChartTooltip({ active, payload, label, isDark }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-3 py-2 rounded-xl border text-xs shadow-xl ${isDark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}>
      <p className={`font-semibold mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
      <p className="font-bold">{fmtCurrency(payload[0].value)}</p>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  iconColor: string;
  bg: string;
  valueColor: string;
  delta?: string;
  deltaUp?: boolean;
  loading: boolean;
  isDark: boolean;
}
function StatCard({ label, value, icon, iconColor, bg, valueColor, delta, deltaUp, loading, isDark }: StatCardProps) {
  return (
    <div className={`rounded-2xl border px-4 py-4 flex items-start gap-3 transition-all ${loading ? "opacity-40" : ""} ${bg}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isDark ? "bg-slate-700/60" : "bg-white"} shadow-sm`}>
        <i className={`${icon} text-sm ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xl font-bold leading-none truncate ${valueColor}`}>{loading ? "—" : value}</p>
        <p className={`text-[11px] font-medium mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
        {delta && !loading && (
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold mt-1 ${deltaUp ? "text-teal-500" : "text-red-400"}`}>
            <i className={`fa-solid ${deltaUp ? "fa-arrow-trend-up" : "fa-arrow-trend-down"} text-[8px]`} />
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Revenue Comparison Card ──────────────────────────────────────────────────

function RevenueCompCard({ data, loading, isDark }: { data: RevenueComparison | null; loading: boolean; isDark: boolean }) {
  const up = (data?.difference ?? 0) >= 0;
  return (
    <div className={`rounded-2xl border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 ${isDark ? "bg-slate-800/40 border-slate-700/60" : "bg-white border-slate-200"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${up ? isDark ? "bg-teal-500/10" : "bg-teal-50" : isDark ? "bg-red-500/10" : "bg-red-50"}`}>
        <i className={`fa-solid ${up ? "fa-arrow-trend-up text-teal-500" : "fa-arrow-trend-down text-red-500"} text-base`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>Revenue vs Yesterday</p>
        <div className="flex items-end gap-3 mt-1 flex-wrap">
          <span className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{loading || !data ? "—" : fmtCurrency(data.today)}</span>
          {data && !loading && (
            <span className={`text-sm font-semibold pb-0.5 ${up ? "text-teal-500" : "text-red-400"}`}>
              {up ? "+" : ""}{fmtCurrency(data.difference)}
              {data.yesterday > 0 && (
                <span className="text-xs ml-1 opacity-80">({up ? "+" : ""}{data.percent_change}%)</span>
              )}
            </span>
          )}
        </div>
        <p className={`text-xs mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          Yesterday: {loading || !data ? "—" : fmtCurrency(data.yesterday)}
        </p>
      </div>
      {!loading && data && (
        <div className={`hidden sm:flex flex-col items-end gap-0.5 text-right shrink-0 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          <span>Today</span>
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${up ? "bg-teal-500" : "bg-red-500"}`} />
            <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>{fmtCurrency(data.today)}</span>
          </div>
          <span className="mt-1">Yesterday</span>
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isDark ? "bg-slate-600" : "bg-slate-300"}`} />
            <span className={`font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{fmtCurrency(data.yesterday)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Top Products Chart ───────────────────────────────────────────────────────

function TopProductsPanel({ products, loading, isDark }: { products: TopProduct[]; loading: boolean; isDark: boolean }) {
  const max = Math.max(...products.map(p => p.total_quantity_sold), 1);
  const COLORS = ["#14b8a6", "#0ea5e9", "#a78bfa", "#f59e0b", "#f43f5e"];

  return (
    <div className={`rounded-2xl border ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"}`}>
      <div className={`px-5 py-4 border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
        <div className="flex items-center gap-2">
          <i className={`fa-solid fa-trophy text-sm ${isDark ? "text-amber-400" : "text-amber-500"}`} />
          <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Top 5 Products</h3>
        </div>
        <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>By units sold in period</p>
      </div>
      <div className="p-5">
        {loading ? (
          <div className="flex justify-center py-10">
            <i className={`fa-solid fa-circle-notch animate-spin text-xl ${isDark ? "text-slate-700" : "text-slate-300"}`} />
          </div>
        ) : products.length === 0 ? (
          <div className={`text-center py-10 text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            <i className="fa-solid fa-box-open block text-2xl mb-2 opacity-40" />
            No sales in this period
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((p, i) => {
              const barPct = Math.round((p.total_quantity_sold / max) * 100);
              return (
                <div key={p.product_id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i === 0 ? "bg-amber-400 text-amber-900" : isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                        {i + 1}
                      </span>
                      <span className={`text-xs font-medium truncate ${isDark ? "text-slate-200" : "text-slate-700"}`}>{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{p.total_quantity_sold} units</span>
                      <span className={`text-xs font-semibold ${isDark ? "text-teal-400" : "text-teal-600"}`}>{fmtCurrency(p.total_revenue)}</span>
                    </div>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barPct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS[i] }}
                    />
                  </div>
                </div>
              );
            })}
            {/* Mini recharts bar for a cleaner visual */}
            <div className="mt-5 hidden sm:block" style={{ height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={products} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: isDark ? "#64748b" : "#94a3b8" }} tickFormatter={(v: string) => v.length > 10 ? v.slice(0, 10) + "…" : v} />
                  <YAxis tick={{ fontSize: 9, fill: isDark ? "#64748b" : "#94a3b8" }} width={28} />
                  <Bar dataKey="total_quantity_sold" radius={[4, 4, 0, 0]}>
                    {products.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cashier Performance Table ────────────────────────────────────────────────

function CashierPerfPanel({ cashiers, loading, isDark }: { cashiers: CashierPerf[]; loading: boolean; isDark: boolean }) {
  const medals = ["fa-solid fa-trophy", "fa-solid fa-medal", "fa-solid fa-award"];
  const medalColors = ["text-amber-400", "text-slate-400", "text-orange-400"];

  return (
    <div className={`rounded-2xl border ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"}`}>
      <div className={`px-5 py-4 border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
        <div className="flex items-center gap-2">
          <i className={`fa-solid fa-users text-sm ${isDark ? "text-blue-400" : "text-blue-500"}`} />
          <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Cashier Performance</h3>
        </div>
        <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Ranked by total revenue in period</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-10">
          <i className={`fa-solid fa-circle-notch animate-spin text-xl ${isDark ? "text-slate-700" : "text-slate-300"}`} />
        </div>
      ) : cashiers.length === 0 ? (
        <div className={`text-center py-10 text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          <i className="fa-solid fa-users block text-2xl mb-2 opacity-40" />
          No cashier activity in this period
        </div>
      ) : (
        <>
          {/* Mobile / tablet cards — shown below lg breakpoint */}
          <div className="lg:hidden p-4 space-y-3 max-h-105 overflow-y-auto">
            {cashiers.map((c, i) => (
              <div
                key={c.id}
                className={`rounded-xl border p-4 flex items-start gap-3 transition-colors ${isDark
                  ? "bg-slate-800/60 border-slate-700 text-slate-300"
                  : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
              >
                <div className="shrink-0 w-7 h-7 flex items-center justify-center">
                  {i < 3 ? (
                    <i className={`${medals[i]} text-base ${medalColors[i]}`} />
                  ) : (
                    <span className={`text-sm font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}>{i + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  <p className={`text-xs mt-0.5 font-semibold ${isDark ? "text-teal-400" : "text-teal-600"}`}>
                    {fmtCurrency(c.total_sales)}
                  </p>
                  <div className={`flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    <span>{c.total_transactions.toLocaleString()} txns</span>
                    <span>{c.total_items_sold.toLocaleString()} items</span>
                    <span>Avg {fmtCurrency(c.average_sale_value)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table — shown at lg and above */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "bg-slate-900/80 text-slate-500 border-b border-slate-800" : "bg-slate-50 text-slate-400 border-b border-slate-200"}`}>
                  <th className="pl-5 pr-3 py-3 w-8">#</th>
                  <th className="px-3 py-3">Cashier</th>
                  <th className="px-3 py-3 whitespace-nowrap">Revenue</th>
                  <th className="px-3 py-3 whitespace-nowrap">Transactions</th>
                  <th className="px-3 py-3 whitespace-nowrap">Items Sold</th>
                  <th className="px-3 pr-5 py-3 whitespace-nowrap">Avg. Sale</th>
                </tr>
              </thead>
              <tbody>
                {cashiers.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`transition-colors ${isDark
                      ? `${i % 2 === 0 ? "bg-slate-900/40" : "bg-slate-900/70"} hover:bg-slate-800/80 border-b border-slate-800/60 text-slate-300`
                      : `${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-slate-50 border-b border-slate-100 text-slate-700`
                      }`}
                  >
                    <td className="pl-5 pr-3 py-3.5">
                      {i < 3 ? (
                        <i className={`${medals[i]} text-xs ${medalColors[i]}`} />
                      ) : (
                        <span className={`text-xs font-medium ${isDark ? "text-slate-600" : "text-slate-400"}`}>{i + 1}</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 font-medium whitespace-nowrap">{c.name}</td>
                    <td className={`px-3 py-3.5 whitespace-nowrap font-semibold ${isDark ? "text-teal-400" : "text-teal-700"}`}>
                      {fmtCurrency(c.total_sales)}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">{c.total_transactions.toLocaleString()}</td>
                    <td className="px-3 py-3.5 whitespace-nowrap">{c.total_items_sold.toLocaleString()}</td>
                    <td className="px-3 pr-5 py-3.5 whitespace-nowrap">{fmtCurrency(c.average_sale_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Analytics() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const isAdmin = user?.role === "admin";

  const [preset, setPreset] = useState<Preset>("7d");
  const [customFrom, setCustomFrom] = useState(today());
  const [customTo, setCustomTo] = useState(today());

  const range: DateRangeParams = preset === "custom"
    ? { from: customFrom, to: customTo }
    : presetToRange(preset);

  // data state
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [comparison, setComparison] = useState<RevenueComparison | null>(null);
  const [cashiers, setCashiers] = useState<CashierPerf[]>([]);

  const [loading, setLoading] = useState(true);
  const [compLoading, setCompLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Abort controller ref — cancels previous in-flight requests when a new fetch starts
  const abortRef = useRef<AbortController | null>(null);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    // Cancel any in-flight request before starting a new one
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      if (isAdmin) {
        const [sumRes, trendRes, topRes, cashRes] = await Promise.all([
          analyticsService.getSummary(range),
          analyticsService.getSalesTrend(range),
          analyticsService.getTopProducts(range),
          analyticsService.getCashiersPerformance(range),
        ]);
        setSummary(sumRes.summary);
        setTrend(trendRes.trend);
        setTopProducts(topRes.top_products);
        setCashiers(cashRes.cashiers_performance);
      } else {
        const [sumRes, trendRes, topRes] = await Promise.all([
          analyticsService.getMySummary(range),
          analyticsService.getMySalesTrend(range),
          analyticsService.getMyTopProducts(range),
        ]);
        setSummary(sumRes.summary);
        setTrend(trendRes.trend);
        setTopProducts(topRes.top_products);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "CanceledError") return; // aborted — ignore
      setError(
        err instanceof AxiosError
          ? (err.response?.data?.error ?? "Failed to load analytics.")
          : "Failed to load analytics."
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, range.from, range.to]);

  const fetchComparison = useCallback(async () => {
    setCompLoading(true);
    try {
      const res = isAdmin
        ? await analyticsService.getRevenueComparison()
        : await analyticsService.getMyRevenueComparison();
      setComparison(res.comparison);
    } catch {
      // silent — non-critical
    } finally {
      setCompLoading(false);
    }
  }, [isAdmin]);

  // Fetch data when range or role changes
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to, isAdmin]);

  // Comparison only needs to run once on mount and when role changes (not date-dependent)
  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const handleRefresh = () => {
    fetchAll();
    fetchComparison();
    showToast("Analytics refreshed.", true);
  };

  // Chart data — ensure every date in range has a point (fill zeros)
  const trendData = trend.map(pt => ({
    ...pt,
    date: shortDate(typeof pt.date === "string" ? pt.date : new Date(pt.date).toISOString().slice(0, 10)),
  }));

  const chartStroke = isDark ? "#14b8a6" : "#0d9488";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";
  const axisColor = isDark ? "#475569" : "#94a3b8";

  // Input class for custom date
  const dateInput = `rounded-xl border px-3 py-2 text-xs outline-none transition-colors ${isDark
    ? "bg-slate-800 border-slate-700 text-white focus:border-teal-500/60 [color-scheme:dark]"
    : "bg-white border-slate-200 text-slate-900 focus:border-teal-500"}`;

  return (
    <div className={`min-h-screen p-5 md:p-7 ${isDark
      ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-900"
      : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/80"}`}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed top-5 right-5 z-70 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg ${toast.ok
              ? isDark ? "bg-teal-900 text-teal-300 border border-teal-700" : "bg-teal-50 text-teal-700 border border-teal-200"
              : isDark ? "bg-red-900/50 text-red-300 border border-red-700" : "bg-red-50 text-red-600 border border-red-200"}`}>
            <i className={`fa-solid ${toast.ok ? "fa-check" : "fa-xmark"} text-xs`} />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Analytics
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {isAdmin ? "Business-wide performance overview." : "Your personal sales performance."}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors self-start disabled:opacity-50 ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
        >
          <i className={`fa-solid fa-rotate-right text-xs ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Date range controls */}
      <div className={`rounded-2xl border p-4 mb-6 ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"}`}>
        <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Date Range</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${preset === key
                ? "bg-teal-600 text-white border-teal-600"
                : isDark ? "border-slate-700 text-slate-400 hover:text-white hover:border-slate-500" : "border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {preset === "custom" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-dashed border-slate-700/40">
                <div className="flex items-center gap-2">
                  <label className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>From</label>
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} max={customTo} className={dateInput} />
                </div>
                <div className="flex items-center gap-2">
                  <label className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>To</label>
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} min={customFrom} max={today()} className={dateInput} />
                </div>
                <button
                  onClick={fetchAll}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error ? (
        <div className={`text-center py-24 text-sm ${isDark ? "text-red-400" : "text-red-500"}`}>
          <i className="fa-solid fa-circle-exclamation text-2xl block mb-2 opacity-60" />
          {error}
          <button onClick={handleRefresh} className="mt-3 text-teal-500 hover:underline block mx-auto">Retry</button>
        </div>
      ) : (
        <>
          {/* Revenue Comparison */}
          <div className="mb-6">
            <RevenueCompCard data={comparison} loading={compLoading} isDark={isDark} />
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Total Revenue"
              value={fmtCurrency(summary?.total_sales ?? 0)}
              icon="fa-solid fa-sack-dollar"
              iconColor={isDark ? "text-teal-500" : "text-teal-500"}
              bg={isDark ? "bg-teal-500/5 border-teal-500/15" : "bg-teal-50/60 border-teal-200"}
              valueColor={isDark ? "text-teal-300" : "text-teal-700"}
              loading={loading}
              isDark={isDark}
            />
            <StatCard
              label="Transactions"
              value={(summary?.total_transactions ?? 0).toLocaleString()}
              icon="fa-solid fa-receipt"
              iconColor={isDark ? "text-blue-400" : "text-blue-500"}
              bg={isDark ? "bg-blue-500/5 border-blue-500/15" : "bg-blue-50/60 border-blue-200"}
              valueColor={isDark ? "text-blue-300" : "text-blue-700"}
              loading={loading}
              isDark={isDark}
            />
            <StatCard
              label="Items Sold"
              value={(summary?.total_items_sold ?? 0).toLocaleString()}
              icon="fa-solid fa-cube"
              iconColor={isDark ? "text-violet-400" : "text-violet-500"}
              bg={isDark ? "bg-violet-500/5 border-violet-500/15" : "bg-violet-50/60 border-violet-200"}
              valueColor={isDark ? "text-violet-300" : "text-violet-700"}
              loading={loading}
              isDark={isDark}
            />
            <StatCard
              label="Avg. Sale Value"
              value={fmtCurrency(summary?.average_sale_value ?? 0)}
              icon="fa-solid fa-chart-simple"
              iconColor={isDark ? "text-amber-400" : "text-amber-500"}
              bg={isDark ? "bg-amber-500/5 border-amber-500/15" : "bg-amber-50/60 border-amber-200"}
              valueColor={isDark ? "text-amber-300" : "text-amber-700"}
              loading={loading}
              isDark={isDark}
            />
          </div>

          {/* Sales Trend Chart */}
          <div className={`rounded-2xl border mb-6 ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className={`px-5 py-4 border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <i className={`fa-solid fa-chart-line text-sm ${isDark ? "text-teal-400" : "text-teal-500"}`} />
                    <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Sales Trend</h3>
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Daily revenue for{" "}
                    {preset === "custom"
                      ? `${customFrom} – ${customTo}`
                      : PRESETS.find(p => p.key === preset)?.label}
                  </p>
                </div>
                {!loading && trendData.length > 0 && (
                  <div className={`text-right text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    <p>{trendData.length} data point{trendData.length !== 1 ? "s" : ""}</p>
                    <p className={`font-semibold mt-0.5 ${isDark ? "text-teal-400" : "text-teal-600"}`}>
                      {fmtCurrency(trend.reduce((s, t) => s + t.total_sales, 0))} total
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-2 pt-4 pb-3">
              {loading ? (
                <div className="flex justify-center items-center" style={{ height: 220 }}>
                  <i className={`fa-solid fa-circle-notch animate-spin text-2xl ${isDark ? "text-slate-700" : "text-slate-300"}`} />
                </div>
              ) : trendData.length === 0 ? (
                <div className={`flex flex-col items-center justify-center text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`} style={{ height: 220 }}>
                  <i className="fa-solid fa-chart-line text-2xl mb-2 opacity-40" />
                  No sales data in this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trendData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartStroke} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={chartStroke} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: axisColor }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: axisColor }}
                      axisLine={false}
                      tickLine={false}
                      width={55}
                      tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                    />
                    <RechartsTip
                      content={({ active, payload, label }) => (
                        <ChartTooltip
                          active={active}
                          payload={payload as { value: number }[]}
                          label={label}
                          isDark={isDark}
                        />
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="total_sales"
                      stroke={chartStroke}
                      strokeWidth={2.5}
                      fill="url(#trendGradient)"
                      dot={trendData.length <= 14}
                      activeDot={{ r: 5, fill: chartStroke, stroke: isDark ? "#0f172a" : "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bottom row: Top Products + Cashier Performance */}
          <div className={`grid gap-6 ${isAdmin ? "lg:grid-cols-2" : "lg:grid-cols-1 max-w-2xl"}`}>
            <TopProductsPanel products={topProducts} loading={loading} isDark={isDark} />
            {isAdmin && (
              <CashierPerfPanel cashiers={cashiers} loading={loading} isDark={isDark} />
            )}
          </div>

          {/* Period note */}
          <p className={`mt-6 text-xs text-center ${isDark ? "text-slate-700" : "text-slate-400"}`}>
            Data shown for {range.from === range.to ? range.from : `${range.from} – ${range.to}`}
          </p>
        </>
      )}
    </div>
  );
}
