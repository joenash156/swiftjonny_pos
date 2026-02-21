import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  dashboardService,
  type PeriodPreset,
  type DashboardSummary,
  type SalesTrendPoint,
  type TopProduct,
  type RevenueComparison,
} from "../../services/dashboardService";
import { StatCard } from "../../components/dashboard/StatCard";
import { SalesTrendChart } from "../../components/dashboard/SalesTrendChart";
import { TopProductsChart } from "../../components/dashboard/TopProductsChart";
import { RevenueComparisonBanner } from "../../components/dashboard/RevenueComparisonBanner";

function formatCurrency(v: number) {
  return `GH₵ ${v.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const PERIODS: { key: PeriodPreset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

function Dashboard() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";

  const [period, setPeriod] = useState<PeriodPreset>("today");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrendPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [revenueComp, setRevenueComp] = useState<RevenueComparison | null>(null);
  const [error, setError] = useState<string | null>(null);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const fetchDashboard = useCallback(async (p: PeriodPreset) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, revenueRes] = await Promise.all([
        dashboardService.getSummary(p),
        dashboardService.getRevenueComparison(),
      ]);
      setSummary(summaryRes.summary);
      setSalesTrend(summaryRes.charts.sales_trend);
      setTopProducts(summaryRes.charts.top_selling_products);
      setRevenueComp(revenueRes.revenue_comparison);
    } catch {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(period);
  }, [period, fetchDashboard]);

  const pctChange = revenueComp
    ? revenueComp.percent_change >= 0
      ? `+${revenueComp.percent_change}% vs yesterday`
      : `${revenueComp.percent_change}% vs yesterday`
    : "—";
  const pctUp = (revenueComp?.percent_change ?? 0) >= 0;

  return (
    <div
      className={`min-h-full p-5 md:p-7 transition-colors duration-300 ${isDark
        ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-900"
        : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/80"
        }`}
    >
      {/* Greeting */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            {greeting()}, {user?.firstname}!
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Here's an overview of your store.
          </p>
        </div>

        {/* Refresh */}
        <button
          onClick={() => fetchDashboard(period)}
          disabled={loading}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors disabled:opacity-50 self-start sm:self-auto ${isDark
            ? "border-slate-700 text-slate-400 hover:bg-slate-800"
            : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
        >
          <i className={`fa-solid fa-rotate-right text-xs ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Period Tab Bar */}
      <div
        className={`inline-flex rounded-xl border p-1 gap-1 mb-6 ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
          }`}
      >
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === key
              ? "bg-teal-600 text-white"
              : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-800"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-5 border ${isDark
              ? "bg-red-900/30 border-red-700/40 text-red-300"
              : "bg-red-50 border-red-200 text-red-600"
              }`}
          >
            <i className="fa-solid fa-triangle-exclamation text-xs" />
            {error}
            <button onClick={() => fetchDashboard(period)} className="ml-auto underline text-xs">
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        <StatCard
          label="Total Sales"
          value={summary ? formatCurrency(summary.total_sales) : "—"}
          icon="fa-solid fa-chart-line"
          iconColor="text-teal-500"
          iconBg={isDark ? "bg-teal-500/10" : "bg-teal-50"}
          sub={pctChange}
          subUp={pctUp}
          isDark={isDark}
          loading={loading}
        />
        <StatCard
          label="Transactions"
          value={summary ? String(summary.total_transactions) : "—"}
          icon="fa-solid fa-receipt"
          iconColor="text-blue-500"
          iconBg={isDark ? "bg-blue-500/10" : "bg-blue-50"}
          sub={`Avg ${summary ? formatCurrency(summary.average_sale_value) : "—"} / sale`}
          subUp={true}
          isDark={isDark}
          loading={loading}
        />
        <StatCard
          label="Items Sold"
          value={summary ? String(summary.total_items_sold) : "—"}
          icon="fa-solid fa-box"
          iconColor="text-purple-500"
          iconBg={isDark ? "bg-purple-500/10" : "bg-purple-50"}
          sub="Total units in period"
          subUp={true}
          isDark={isDark}
          loading={loading}
        />
        <StatCard
          label="Avg Sale Value"
          value={summary ? formatCurrency(summary.average_sale_value) : "—"}
          icon="fa-solid fa-coins"
          iconColor="text-amber-500"
          iconBg={isDark ? "bg-amber-500/10" : "bg-amber-50"}
          sub="Per transaction"
          subUp={true}
          isDark={isDark}
          loading={loading}
        />
      </div>

      {/* Revenue Comparison Banner */}
      {revenueComp !== null && !loading && (
        <RevenueComparisonBanner data={revenueComp} isDark={isDark} />
      )}

      {/* Quick Actions */}
      <div className="mb-7">
        <h2 className={`text-xs font-semibold uppercase tracking-widest mb-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "New Sale", icon: "fa-solid fa-cash-register", color: "bg-teal-600 hover:bg-teal-700" },
            { label: "Add Product", icon: "fa-solid fa-plus", color: "bg-blue-600 hover:bg-blue-700" },
            { label: "View Reports", icon: "fa-solid fa-chart-bar", color: "bg-purple-600 hover:bg-purple-700" },
          ].map((a) => (
            <button
              key={a.label}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-sm ${a.color}`}
            >
              <i className={`${a.icon} text-xs`} />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sales Trend */}
        <div
          className={`rounded-2xl p-5 border min-h-60 flex flex-col transition-colors duration-300 ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white/80 border-slate-200/80"
            }`}
        >
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Sales Trend
          </h3>
          {loading ? (
            <div className={`flex-1 rounded-xl animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"}`} style={{ minHeight: 140 }} />
          ) : (
            <SalesTrendChart data={salesTrend} isDark={isDark} />
          )}
        </div>

        {/* Top Products */}
        <div
          className={`rounded-2xl p-5 border min-h-60 flex flex-col transition-colors duration-300 ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white/80 border-slate-200/80"
            }`}
        >
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Top Products
          </h3>
          {loading ? (
            <div className="space-y-3 flex-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-8 rounded-lg animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
              ))}
            </div>
          ) : (
            <TopProductsChart data={topProducts} isDark={isDark} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
