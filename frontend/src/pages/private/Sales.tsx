import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { salesService, type Sale } from "../../services/salesService";
import { SaleDetailModal } from "../../components/sales/SaleDetailModal";
import api from "../../services/api";

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtCurrency(v: number) {
  return `GH₵ ${v.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(str: string) {
  return new Date(str).toLocaleString("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── stat card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  color: "teal" | "blue" | "amber" | "red" | "purple";
  isDark: boolean;
}

const colorMap = {
  teal: { bg: "bg-teal-500/10", text: "text-teal-500", border: "border-teal-500/20" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  red: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
};

function SalesStatCard({ icon, label, value, sub, color, isDark }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-3 transition-colors duration-300 ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white/80 border-slate-200/80"
      }`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {label}
        </span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${c.bg} ${c.border}`}>
          <i className={`${icon} text-sm ${c.text}`} />
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{value}</p>
        {sub && <p className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── void confirm modal ───────────────────────────────────────────────────────

interface VoidModalProps {
  publicId: string;
  isDark: boolean;
  onClose: () => void;
  onVoided: () => void;
}

function VoidModal({ publicId, isDark, onClose, onVoided }: VoidModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleVoid = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/api/sale/${publicId}/void`, { void_reason: reason || null });
      onVoided();
    } catch {
      setError("Failed to void this sale. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
          }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-red-500/10" : "bg-red-50"}`}>
            <i className="fa-solid fa-ban text-red-500" />
          </div>
          <div>
            <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Void Sale</h2>
            <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              #{publicId.slice(0, 14)}&hellip;
            </p>
          </div>
        </div>

        <p className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          This will void the sale and restore product stock. This action cannot be undone.
        </p>

        <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Void reason <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          ref={inputRef}
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe why this sale is being voided..."
          className={`w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors ${isDark
              ? "bg-slate-800 border-slate-700 text-white placeholder-slate-600 focus:border-red-500/50"
              : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-red-400"
            }`}
        />

        {error && (
          <p className="text-xs text-red-500 mt-2">{error}</p>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark
                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
          >
            Cancel
          </button>
          <button
            onClick={handleVoid}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <i className="fa-solid fa-circle-notch animate-spin text-xs" />}
            {loading ? "Voiding…" : "Void Sale"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

type SortBy = "created_at" | "total" | "cashier_firstname" | "cashier_lastname";
type Order = "ASC" | "DESC";

const PAGE_SIZE = 10;

export default function Sales() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const isAdmin = user?.role === "admin";

  // ── data state ──
  const [sales, setSales] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── filter / pagination state ──
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
  const [order, setOrder] = useState<Order>("DESC");
  const [page, setPage] = useState(1);

  // ── modal state ──
  const [viewId, setViewId] = useState<string | null>(null);
  const [voidId, setVoidId] = useState<string | null>(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, sortBy, order]);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await salesService.getAllSales({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        sortBy,
        order,
      });
      setSales(res.sales ?? []);
      setTotal(res.counts ?? 0);
    } catch {
      setError("Failed to load sales. Please try again.");
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortBy, order]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  // ── derived stats ──
  const completedSales = sales.filter((s) => s.status !== "voided");
  const voidedSales = sales.filter((s) => s.status === "voided");
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.total, 0);
  const avgOrder = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;
  const totalItems = completedSales.reduce((sum, s) => sum + s.items.length, 0);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── sort toggle helper ──
  const handleSort = (col: SortBy) => {
    if (sortBy === col) setOrder((o) => (o === "DESC" ? "ASC" : "DESC"));
    else { setSortBy(col); setOrder("DESC"); }
  };

  const SortIcon = ({ col }: { col: SortBy }) => {
    if (sortBy !== col) return <i className={`fa-solid fa-sort text-[10px] ml-1 ${isDark ? "text-slate-600" : "text-slate-300"}`} />;
    return <i className={`fa-solid fa-sort-${order === "DESC" ? "down" : "up"} text-[10px] ml-1 text-teal-500`} />;
  };

  const statusBadge = (status: string) =>
    status === "voided"
      ? <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Voided</span>
      : <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-700"}`}><span className="w-1.5 h-1.5 rounded-full bg-teal-500" />Completed</span>;

  const payBadge = (method: string) => (
    <span className={`capitalize text-[11px] font-medium px-2 py-0.5 rounded-full ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
      {method}
    </span>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Sales & Transactions
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {isAdmin ? "All cashier & admin transactions" : "Your personal transaction history"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={fetchSales}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors disabled:opacity-50 ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
          >
            <i className={`fa-solid fa-rotate-right text-xs ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SalesStatCard
          icon="fa-solid fa-receipt"
          label="Completed Sales"
          value={loading ? "—" : String(completedSales.length)}
          sub={`of ${total} this page`}
          color="teal"
          isDark={isDark}
        />
        <SalesStatCard
          icon="fa-solid fa-coins"
          label="Total Revenue"
          value={loading ? "—" : fmtCurrency(totalRevenue)}
          sub="Completed sales only"
          color="blue"
          isDark={isDark}
        />
        <SalesStatCard
          icon="fa-solid fa-chart-line"
          label="Avg. Order Value"
          value={loading ? "—" : fmtCurrency(avgOrder)}
          sub={`${totalItems} items sold`}
          color="purple"
          isDark={isDark}
        />
        <SalesStatCard
          icon="fa-solid fa-ban"
          label="Voided Sales"
          value={loading ? "—" : String(voidedSales.length)}
          sub="Revenue not counted"
          color="red"
          isDark={isDark}
        />
      </div>

      {/* ── Filters row ── */}
      <div className={`flex flex-col sm:flex-row gap-3 mb-5 p-4 rounded-2xl border ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-white/80 border-slate-200"
        }`}>
        {/* Search */}
        <div className={`relative flex-1 flex items-center gap-2 rounded-xl border px-3 transition-colors ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
          }`}>
          <i className={`fa-solid fa-magnifying-glass text-xs shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
          <input
            type="text"
            placeholder={isAdmin ? "Search by cashier name…" : "Search transactions…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`flex-1 bg-transparent py-2.5 text-sm outline-none ${isDark ? "text-white placeholder-slate-600" : "text-slate-900 placeholder-slate-400"
              }`}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <i className={`fa-solid fa-xmark text-xs ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`} />
            </button>
          )}
        </div>

        {/* Sort select */}
        <select
          value={`${sortBy}:${order}`}
          onChange={(e) => {
            const [col, ord] = e.target.value.split(":") as [SortBy, Order];
            setSortBy(col); setOrder(ord);
          }}
          className={`px-3 py-2.5 rounded-xl border text-sm outline-none cursor-pointer ${isDark
              ? "bg-slate-800 border-slate-700 text-slate-300"
              : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
        >
          <option value="created_at:DESC">Newest first</option>
          <option value="created_at:ASC">Oldest first</option>
          <option value="total:DESC">Highest total</option>
          <option value="total:ASC">Lowest total</option>
          {isAdmin && <option value="cashier_firstname:ASC">Cashier A → Z</option>}
          {isAdmin && <option value="cashier_firstname:DESC">Cashier Z → A</option>}
        </select>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border mb-5 ${isDark ? "bg-red-500/8 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600"
          }`}>
          <i className="fa-solid fa-triangle-exclamation" />
          <span className="text-sm">{error}</span>
          <button onClick={fetchSales} className="ml-auto text-xs underline underline-offset-2">Retry</button>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`flex items-center gap-4 px-5 py-4 border-b last:border-0 animate-pulse ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-100"
              }`}>
              <div className={`h-4 w-28 rounded ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
              <div className={`h-4 w-24 rounded ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
              <div className={`h-4 w-16 rounded ml-auto ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && sales.length === 0 && (
        <div className={`rounded-2xl border p-16 text-center ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"}`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
            <i className="fa-solid fa-receipt text-slate-400 text-xl" />
          </div>
          <p className={`text-base font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>No transactions found</p>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {debouncedSearch ? "Try a different search term" : "Sales will appear here once created"}
          </p>
        </div>
      )}

      {/* ── Desktop table ── */}
      {!loading && sales.length > 0 && (
        <div className={`hidden md:block rounded-2xl border overflow-hidden mb-5 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b text-left ${isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                {/* Transaction ID */}
                <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Transaction ID
                </th>
                {/* Cashier — admin only */}
                {isAdmin && (
                  <th
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"}`}
                    onClick={() => handleSort("cashier_firstname")}
                  >
                    Cashier <SortIcon col="cashier_firstname" />
                  </th>
                )}
                <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>Items</th>
                <th
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"}`}
                  onClick={() => handleSort("total")}
                >
                  Total <SortIcon col="total" />
                </th>
                <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>Payment</th>
                <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>Status</th>
                <th
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"}`}
                  onClick={() => handleSort("created_at")}
                >
                  Date <SortIcon col="created_at" />
                </th>
                <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-100"}`}>
              {sales.map((sale) => (
                <tr
                  key={sale.public_id}
                  className={`transition-colors ${isDark ? "bg-slate-900/60 hover:bg-slate-800/60" : "bg-white hover:bg-slate-50/80"}`}
                >
                  <td className="px-4 py-3.5">
                    <span className={`font-mono text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      #{sale.public_id.slice(0, 14)}&hellip;
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3.5">
                      <div>
                        <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{sale.cashier.name}</p>
                        <p className={`text-xs mt-0.5 ${isDark ? "text-slate-600" : "text-slate-400"}`}>{sale.cashier.phone}</p>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3.5">
                    <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{fmtCurrency(sale.total)}</span>
                  </td>
                  <td className="px-4 py-3.5">{payBadge(sale.payment_method)}</td>
                  <td className="px-4 py-3.5">{statusBadge(sale.status)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-500" : "text-slate-400"}`}>{fmtDate(sale.created_at)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {/* View */}
                      <button
                        onClick={() => setViewId(sale.public_id)}
                        title="View details"
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isDark
                            ? "border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                            : "border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                      >
                        <i className="fa-solid fa-eye text-[10px]" />
                        View
                      </button>
                      {/* Void — only completed + admin */}
                      {isAdmin && sale.status !== "voided" && (
                        <button
                          onClick={() => setVoidId(sale.public_id)}
                          title="Void sale"
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isDark
                              ? "border-red-800/60 text-red-400 hover:bg-red-500/10"
                              : "border-red-200 text-red-500 hover:bg-red-50"
                            }`}
                        >
                          <i className="fa-solid fa-ban text-[10px]" />
                          Void
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Mobile cards ── */}
      {!loading && sales.length > 0 && (
        <div className="md:hidden space-y-3 mb-5">
          {sales.map((sale) => (
            <div
              key={sale.public_id}
              className={`rounded-2xl border p-4 ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{fmtCurrency(sale.total)}</p>
                  <p className={`text-xs font-mono mt-0.5 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    #{sale.public_id.slice(0, 14)}&hellip;
                  </p>
                </div>
                {statusBadge(sale.status)}
              </div>

              <div className="space-y-1.5 mb-3">
                {isAdmin && (
                  <div className="flex justify-between">
                    <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Cashier</span>
                    <span className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>{sale.cashier.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Items</span>
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>{sale.items.length} item{sale.items.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Payment</span>
                  {payBadge(sale.payment_method)}
                </div>
                <div className="flex justify-between">
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Date</span>
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{fmtDate(sale.created_at)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewId(sale.public_id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-colors ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <i className="fa-solid fa-eye text-[10px]" />
                  View
                </button>
                {isAdmin && sale.status !== "voided" && (
                  <button
                    onClick={() => setVoidId(sale.public_id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-colors ${isDark ? "border-red-800/60 text-red-400 hover:bg-red-500/10" : "border-red-200 text-red-500 hover:bg-red-50"
                      }`}
                  >
                    <i className="fa-solid fa-ban text-[10px]" />
                    Void
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Page {page} of {totalPages} &mdash; {total} total records
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs transition-colors disabled:opacity-40 ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
            >
              <i className="fa-solid fa-chevron-left" />
            </button>

            {/* page pills */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium border transition-colors ${p === page
                      ? "border-teal-500 bg-teal-500 text-white"
                      : isDark
                        ? "border-slate-700 text-slate-400 hover:bg-slate-800"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs transition-colors disabled:opacity-40 ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {viewId && (
          <SaleDetailModal
            key="view"
            publicId={viewId}
            isDark={isDark}
            onClose={() => setViewId(null)}
          />
        )}
        {voidId && (
          <VoidModal
            key="void"
            publicId={voidId}
            isDark={isDark}
            onClose={() => setVoidId(null)}
            onVoided={() => { setVoidId(null); fetchSales(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
