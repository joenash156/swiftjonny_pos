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
import { salesService, type Sale } from "../../services/salesService";
import { StatCard } from "../../components/dashboard/StatCard";
import { SalesTrendChart } from "../../components/dashboard/SalesTrendChart";
import { TopProductsChart } from "../../components/dashboard/TopProductsChart";
import { RevenueComparisonBanner } from "../../components/dashboard/RevenueComparisonBanner";
import { SaleDetailModal } from "../../components/sales/SaleDetailModal";
import { useNavigate } from "react-router-dom";

function formatCurrency(v: number) {
  return `GH₵ ${v.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const PERIODS: { key: PeriodPreset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
];

function Dashboard() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const isAdmin = user?.role === "admin";
  const router = useNavigate();

  const [period, setPeriod] = useState<PeriodPreset>("today");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrendPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [revenueComp, setRevenueComp] = useState<RevenueComparison | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Recent transactions
  const [transactions, setTransactions] = useState<Sale[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Dashboard | SwiftJonny POS";
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 16) return "Good afternoon";
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

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const res = await salesService.getAllSales({ limit: 5, order: "DESC" });
      setTransactions(res.sales ?? []);
    } catch {
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(period);
  }, [period, fetchDashboard]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatDateTime = (str: string) =>
    new Date(str).toLocaleString("en-GH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const statusBadge = (status: string) => {
    if (status === "voided") {
      return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Voided
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-700"}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
        Completed
      </span>
    );
  };

  const pctChange = revenueComp
    ? revenueComp.percent_change >= 0
      ? `+${revenueComp.percent_change}% vs yesterday`
      : `${revenueComp.percent_change}% vs yesterday`
    : "—";
  const pctUp = (revenueComp?.percent_change ?? 0) >= 0;

  return (
    <div
      className={`min-h-screen p-5 md:p-7 transition-colors duration-300 ${isDark
        ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-900"
        : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/80"
        }`}
    >
      {/* Greeting */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            {greeting()}, {user?.firstname}!
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Here's an overview of your store.
          </p>
        </div>

        <button
          onClick={() => { fetchDashboard(period); fetchTransactions(); }}
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

      <div className="flex flex-col items-start lg:flex-row lg:items-center lg:justify-between">
        {/* Scope note */}
        <div className={`inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full text-xs font-medium border ${isAdmin
          ? isDark ? "bg-amber-500/8 border-amber-500/20 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-700"
          : isDark ? "bg-blue-500/8 border-blue-500/20 text-blue-300" : "bg-blue-50 border-blue-200 text-blue-700"
          }`}>
          <i className={`fa-solid ${isAdmin ? "fa-users" : "fa-user"} text-[10px]`} />
          {isAdmin
            ? "Viewing activity across all cashiers & admins"
            : "Viewing your personal transaction activity only"}
        </div>

        {/* Period Tab Bar */}
        <div
          className={`inline-flex flex-wrap justify-center rounded-xl border p-0.5 sm:p-1 gap-1 mb-6 ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
            }`}
        >
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-4 py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-colors ${period === key
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
            { label: "New Sale", icon: "fa-solid fa-cash-register", color: "bg-teal-600 hover:bg-teal-700", path: "/pos" },
            { label: "Add Product", icon: "fa-solid fa-plus", color: "bg-blue-600 hover:bg-blue-700", path: "/products" },
            { label: "View Reports", icon: "fa-solid fa-chart-bar", color: "bg-purple-600 hover:bg-purple-700", path: "/analytics" },
          ].filter(a => a.label !== "Add Product" || user?.role === "admin").map((a) => (
            <button
              onClick={() => router(a.path)}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
        {/* Sales Trend */}
        <div
          className={`rounded-2xl p-5 border flex flex-col transition-colors duration-300 ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white/80 border-slate-200/80"
            }`}
        >
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Sales Trend
          </h3>
          {loading ? (
            <div className={`flex-1 rounded-xl animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"}`} style={{ minHeight: 200 }} />
          ) : (
            <SalesTrendChart data={salesTrend} isDark={isDark} />
          )}
        </div>

        {/* Top Products */}
        <div
          className={`rounded-2xl p-5 border flex flex-col transition-colors duration-300 ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white/80 border-slate-200/80"
            }`}
        >
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Top Products
          </h3>
          {loading ? (
            <div className="space-y-3 flex-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-10 rounded-lg animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
              ))}
            </div>
          ) : (
            <TopProductsChart data={topProducts} isDark={isDark} />
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xs font-semibold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Recent Transactions
          </h2>
          {!txLoading && transactions.length > 0 && (
            <span className={`text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
              Last {transactions.length} records
            </span>
          )}
        </div>

        {/* Loading skeleton */}
        {txLoading && (
          <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-5 py-4 border-b last:border-0 animate-pulse ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-100"
                  }`}
              >
                <div className={`h-4 w-24 rounded ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
                <div className={`h-4 w-20 rounded ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
                <div className={`h-4 w-16 rounded ml-auto ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!txLoading && transactions.length === 0 && (
          <div className={`rounded-2xl border p-10 text-center ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
              <i className="fa-solid fa-receipt text-slate-400 text-lg" />
            </div>
            <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>No transactions yet</p>
          </div>
        )}

        {/* Desktop Table (md+) */}
        {!txLoading && transactions.length > 0 && (
          <div className={`hidden md:block rounded-2xl border overflow-hidden ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b text-left ${isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  {["Transaction ID", "Cashier", "Items", "Total", "Payment", "Status", "Date", "View"].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? "text-slate-500" : "text-slate-400"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-100"}`}>
                {transactions.map((tx) => (
                  <tr
                    key={tx.public_id}
                    className={`transition-colors ${isDark ? "bg-slate-900/60 hover:bg-slate-800/60" : "bg-white hover:bg-slate-50"}`}
                  >
                    <td className="px-4 py-3.5">
                      <span className={`font-mono text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        #{tx.public_id.slice(0, 14)}&hellip;
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>{tx.cashier.name}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{tx.items.length} item{tx.items.length !== 1 ? "s" : ""}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{formatCurrency(tx.total)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`capitalize text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                        {tx.payment_method}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">{statusBadge(tx.status)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-500" : "text-slate-400"}`}>{formatDateTime(tx.created_at)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setSelectedTxId(tx.public_id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${isDark
                          ? "border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                          : "border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                      >
                        <i className="fa-solid fa-eye text-[10px]" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Cards */}
        {!txLoading && transactions.length > 0 && (
          <div className="md:hidden space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.public_id}
                className={`rounded-2xl border p-4 ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {formatCurrency(tx.total)}
                    </p>
                    <p className={`text-xs font-mono mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      #{tx.public_id.slice(0, 12)}&hellip;
                    </p>
                  </div>
                  {statusBadge(tx.status)}
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Cashier</span>
                    <span className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>{tx.cashier.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Items</span>
                    <span className={`text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>{tx.items.length} item{tx.items.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Payment</span>
                    <span className={`capitalize text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                      {tx.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Date</span>
                    <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{formatDateTime(tx.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTxId(tx.public_id)}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium border transition-colors ${isDark
                    ? "border-slate-700 text-slate-300 hover:bg-slate-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <i className="fa-solid fa-eye text-[10px]" />
                  View Transaction
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sale Detail Modal */}
      {selectedTxId && (
        <SaleDetailModal
          publicId={selectedTxId}
          isDark={isDark}
          onClose={() => setSelectedTxId(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;
