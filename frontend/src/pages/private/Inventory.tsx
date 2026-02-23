import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AxiosError } from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  inventoryService,
  type StockProduct,
} from "../../services/inventoryService";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";

// ─── Constants ───────────

const LOW_STOCK_THRESHOLD = 10;

function fmtCurrency(v: number) {
  return `GH₵ ${v.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type StockFilter = "all" | "low" | "out";

// ─── Adjust Stock Modal ───

interface AdjustModalProps {
  isDark: boolean;
  product: StockProduct;
  onClose: () => void;
  onAdjusted: (productId: string, newStock: number, newTotalValue: number) => void;
}

function AdjustModal({ isDark, product, onClose, onAdjusted }: AdjustModalProps) {
  const [adjType, setAdjType] = useState<"add" | "remove">("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const qty = parseInt(quantity) || 0;
  const previewStock =
    adjType === "add"
      ? product.stock + qty
      : Math.max(0, product.stock - qty);
  const validQty = qty > 0 && (adjType === "add" || qty <= product.stock);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validQty) {
      setError(
        adjType === "remove" && qty > product.stock
          ? `Cannot remove ${qty} unit(s) — current stock is only ${product.stock}.`
          : "Enter a valid quantity (at least 1)."
      );
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await inventoryService.adjustStock(product.id, {
        type: adjType,
        quantity: qty,
        reason: reason.trim() || undefined,
      });
      onAdjusted(product.id, res.adjustment.new_stock, res.adjustment.new_total_value);
    } catch (err: unknown) {
      setError(
        err instanceof AxiosError
          ? (err.response?.data?.error ?? "Adjustment failed.")
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  const field = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors ${isDark
    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-600 focus:border-teal-500/60"
    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-teal-500"
    }`;

  const stockDelta = adjType === "add" ? qty : -qty;
  const isRemove = adjType === "remove";

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
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-teal-500/10" : "bg-teal-50"}`}>
            <i className="fa-solid fa-arrows-up-down text-teal-500 text-sm" />
          </div>
          <div className="min-w-0">
            <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              Adjust Stock
            </h2>
            <p className={`text-xs mt-0.5 truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {product.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm ${isDark ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-50 text-red-600 border border-red-200"}`}>
              <i className="fa-solid fa-triangle-exclamation text-xs shrink-0" />
              {error}
            </div>
          )}

          {/* Type toggle */}
          <div>
            <label className={`block text-xs font-medium mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Adjustment Type
            </label>
            <div className={`flex rounded-xl border p-1 gap-1 ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
              <button
                type="button"
                onClick={() => { setAdjType("add"); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${adjType === "add"
                  ? "bg-teal-600 text-white shadow-sm"
                  : isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <i className="fa-solid fa-plus text-xs" />
                Add Stock
              </button>
              <button
                type="button"
                onClick={() => { setAdjType("remove"); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${adjType === "remove"
                  ? isDark ? "bg-red-500/20 text-red-400 shadow-sm" : "bg-red-500 text-white shadow-sm"
                  : isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <i className="fa-solid fa-minus text-xs" />
                Remove Stock
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Quantity <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => { setQuantity(e.target.value); setError(null); }}
              placeholder="Enter quantity…"
              className={field}
              disabled={saving}
              autoFocus
            />
          </div>

          {/* Stock Preview */}
          {qty > 0 && (
            <div className={`rounded-xl border px-4 py-3 ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
              <p className={`text-xs font-medium mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Preview</p>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className={`text-lg font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>{product.stock}</p>
                  <p className={`text-[10px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>Current</p>
                </div>
                <div className="flex-1 flex flex-col items-center gap-0.5">
                  <span className={`text-xs font-semibold ${isRemove ? "text-red-500" : "text-teal-500"}`}>
                    {isRemove ? "−" : "+"}{qty}
                  </span>
                  <div className={`w-full h-0.5 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
                </div>
                <div className="text-center">
                  <p className={`text-lg font-bold ${previewStock === 0 ? "text-red-500" : previewStock <= LOW_STOCK_THRESHOLD ? "text-amber-500" : isDark ? "text-teal-400" : "text-teal-600"}`}>
                    {previewStock}
                  </p>
                  <p className={`text-[10px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>New Stock</p>
                </div>
                <div className="text-center">
                  <p className={`text-xs font-semibold ${isRemove ? "text-red-400" : "text-teal-500"}`}>
                    {stockDelta > 0 ? "+" : ""}{fmtCurrency(stockDelta * product.unit_price)}
                  </p>
                  <p className={`text-[10px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>Value Δ</p>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Reason <span className={`font-normal ${isDark ? "text-slate-500" : "text-slate-400"}`}>(optional)</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Restocked from supplier, damaged goods…"
              className={`${field} resize-none`}
              disabled={saving}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !validQty}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${adjType === "remove"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-teal-600 hover:bg-teal-700 text-white"
                }`}
            >
              {saving && <i className="fa-solid fa-circle-notch animate-spin text-xs" />}
              {saving ? "Saving…" : adjType === "add" ? "Add Units" : "Remove Units"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────

export default function Inventory() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState<StockProduct[]>([]);
  const [reportDate, setReportDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [sortAsc, setSortAsc] = useState(true);
  const [sortCol, setSortCol] = useState<"name" | "stock" | "unit_price" | "total_value">("name");

  const [adjustingProduct, setAdjustingProduct] = useState<StockProduct | null>(null);
  const [pendingZero, setPendingZero] = useState<StockProduct | null>(null);
  const [zeroLoading, setZeroLoading] = useState(false);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getStockReport();
      setProducts(res.report.products ?? []);
      setReportDate(res.report.date);
    } catch (err: unknown) {
      setError(
        err instanceof AxiosError
          ? (err.response?.data?.error ?? "Failed to load stock report.")
          : "Failed to load stock report."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchReport();
    else setLoading(false);
  }, [isAdmin, fetchReport]);

  // computed stats (always from full product list — not filtered)
  const stats = useMemo(() => {
    const totalUnits = products.reduce((s, p) => s + p.stock, 0);
    const totalValue = products.reduce((s, p) => s + p.total_value, 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    return { totalUnits, totalValue, lowStock, outOfStock };
  }, [products]);

  // filtered + sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // text search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }

    // stock filter
    if (filter === "low") list = list.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD);
    else if (filter === "out") list = list.filter(p => p.stock === 0);

    // sort
    list.sort((a, b) => {
      let cmp = 0;
      if (sortCol === "name") cmp = a.name.localeCompare(b.name);
      else if (sortCol === "stock") cmp = a.stock - b.stock;
      else if (sortCol === "unit_price") cmp = a.unit_price - b.unit_price;
      else if (sortCol === "total_value") cmp = a.total_value - b.total_value;
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [products, search, filter, sortCol, sortAsc]);

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(true); }
  };

  const SortIcon = ({ col }: { col: typeof sortCol }) => {
    if (sortCol !== col) return <i className={`fa-solid fa-sort text-[10px] ml-1 ${isDark ? "text-slate-600" : "text-slate-300"}`} />;
    return <i className={`fa-solid fa-sort-${sortAsc ? "up" : "down"} text-[10px] ml-1 text-teal-500`} />;
  };

  const handleAdjusted = (productId: string, newStock: number, newTotalValue: number) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, stock: newStock, total_value: newTotalValue } : p
      )
    );
    setAdjustingProduct(null);
    showToast("Stock adjusted successfully.", true);
  };

  const handleZeroStock = async () => {
    if (!pendingZero) return;
    setZeroLoading(true);
    try {
      if (pendingZero.stock > 0) {
        const res = await inventoryService.adjustStock(pendingZero.id, {
          type: "remove",
          quantity: pendingZero.stock,
          reason: "Manual zero-out",
        });
        handleAdjusted(pendingZero.id, res.adjustment.new_stock, res.adjustment.new_total_value);
      }
      showToast(`"${pendingZero.name}" stock zeroed out.`, true);
    } catch (err: unknown) {
      showToast(
        err instanceof AxiosError ? (err.response?.data?.error ?? "Failed.") : "Failed.",
        false,
      );
    } finally {
      setZeroLoading(false);
      setPendingZero(null);
    }
  };

  // CSV export — uses currently filtered list
  const exportCSV = () => {
    const headers = ["Product Name", "Unit Price (GH₵)", "Stock Qty", "Total Value (GH₵)", "Status"];
    const rows = filteredProducts.map(p => {
      const status = p.stock === 0 ? "Out of Stock" : p.stock <= LOW_STOCK_THRESHOLD ? "Low Stock" : "In Stock";
      return [`"${p.name}"`, p.unit_price.toFixed(2), p.stock, p.total_value.toFixed(2), status];
    });
    const totalRow = [
      "\"--- TOTALS ---\"",
      "",
      stats.totalUnits,
      stats.totalValue.toFixed(2),
      "",
    ];
    const metaRows = [
      [],
      [`"Generated At"`, `"${reportDate ? fmtDate(reportDate) : "N/A"}"`],
      [`"Total Products"`, filteredProducts.length],
    ];
    const csv = [
      headers.join(","),
      ...rows.map(r => r.join(",")),
      totalRow.join(","),
      ...metaRows.map(r => r.join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stockBadge = (stock: number) => {
    if (stock === 0)
      return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          Out of Stock
        </span>
      );
    if (stock <= LOW_STOCK_THRESHOLD)
      return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-700"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          Low Stock
        </span>
      );
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-700"}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
        In Stock
      </span>
    );
  };

  const stockNumColor = (stock: number) => {
    if (stock === 0) return isDark ? "text-red-400" : "text-red-600";
    if (stock <= LOW_STOCK_THRESHOLD) return isDark ? "text-amber-400" : "text-amber-600";
    return isDark ? "text-teal-400" : "text-teal-700";
  };

  return (
    <div className={`min-h-screen p-5 md:p-7 ${isDark ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-900" : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/80"}`}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed top-5 right-5 z-70 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg ${toast.ok
              ? isDark ? "bg-teal-900 text-teal-300 border border-teal-700" : "bg-teal-50 text-teal-700 border border-teal-200"
              : isDark ? "bg-red-900/50 text-red-300 border border-red-700" : "bg-red-50 text-red-600 border border-red-200"
              }`}
          >
            <i className={`fa-solid ${toast.ok ? "fa-check" : "fa-xmark"} text-xs`} />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Access Denied */}
      {!isAdmin ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isDark ? "bg-red-500/10" : "bg-red-50"}`}>
            <i className="fa-solid fa-shield-halved text-red-500 text-xl" />
          </div>
          <h2 className={`text-lg font-semibold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Access Denied</h2>
          <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>Only administrators can view the inventory report.</p>
        </div>
      ) : (
        <>
          {/* Page Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Inventory
              </h1>
              <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Real-time stock levels and valuation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchReport}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors disabled:opacity-50 ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              >
                <i className={`fa-solid fa-rotate-right text-xs ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={exportCSV}
                disabled={loading || filteredProducts.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-colors disabled:opacity-40 ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
              >
                <i className="fa-solid fa-file-csv text-xs" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {[
              { label: "Products", value: products.length, icon: "fa-solid fa-boxes-stacked", color: isDark ? "text-slate-300" : "text-slate-700", iconColor: isDark ? "text-slate-500" : "text-slate-400", bg: isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-white border-slate-200" },
              { label: "Total Units", value: stats.totalUnits.toLocaleString(), icon: "fa-solid fa-cube", color: isDark ? "text-blue-300" : "text-blue-700", iconColor: isDark ? "text-blue-500" : "text-blue-500", bg: isDark ? "bg-blue-500/5 border-blue-500/15" : "bg-blue-50/60 border-blue-200" },
              { label: "Stock Value", value: fmtCurrency(stats.totalValue), icon: "fa-solid fa-sack-dollar", color: isDark ? "text-teal-300" : "text-teal-700", iconColor: isDark ? "text-teal-500" : "text-teal-500", bg: isDark ? "bg-teal-500/5 border-teal-500/15" : "bg-teal-50/60 border-teal-200" },
              { label: "Low Stock", value: stats.lowStock, icon: "fa-solid fa-triangle-exclamation", color: isDark ? "text-amber-300" : "text-amber-700", iconColor: isDark ? "text-amber-500" : "text-amber-500", bg: isDark ? "bg-amber-500/5 border-amber-500/15" : "bg-amber-50/60 border-amber-200" },
              { label: "Out of Stock", value: stats.outOfStock, icon: "fa-solid fa-circle-xmark", color: isDark ? "text-red-300" : "text-red-700", iconColor: isDark ? "text-red-500" : "text-red-500", bg: isDark ? "bg-red-500/5 border-red-500/15" : "bg-red-50/60 border-red-200" },
            ].map(({ label, value, icon, color, iconColor, bg }) => (
              <div key={label} className={`rounded-2xl border px-4 py-3.5 flex items-center gap-3 ${loading ? "opacity-40" : ""} ${bg}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-slate-700/60" : "bg-white"} shadow-sm`}>
                  <i className={`${icon} text-sm ${iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-lg font-bold leading-none truncate ${color}`}>{loading ? "—" : value}</p>
                  <p className={`text-[11px] font-medium mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className={`relative flex-1 flex items-center rounded-xl border overflow-hidden transition-colors ${isDark ? "bg-slate-900/70 border-slate-700 focus-within:border-teal-500" : "bg-white border-slate-200 focus-within:border-teal-500"}`}>
              <i className={`fa-solid fa-magnifying-glass absolute left-3 text-xs pointer-events-none ${isDark ? "text-slate-500" : "text-slate-400"}`} />
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`flex-1 bg-transparent pl-8 ${search ? "pr-8" : "pr-4"} py-2.5 text-sm outline-none ${isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"}`}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3">
                  <i className={`fa-solid fa-xmark text-xs ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`} />
                </button>
              )}
            </div>

            {/* Filter tabs */}
            <div className={`flex rounded-xl border p-1 gap-1 text-sm shrink-0 ${isDark ? "bg-slate-900/70 border-slate-700" : "bg-white border-slate-200"}`}>
              {([
                { key: "all", label: "All", count: products.length },
                { key: "low", label: "Low Stock", count: stats.lowStock },
                { key: "out", label: "Out of Stock", count: stats.outOfStock },
              ] as { key: StockFilter; label: string; count: number }[]).map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-colors whitespace-nowrap ${filter === key
                    ? "bg-teal-600 text-white"
                    : isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {label}
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${filter === key
                    ? "bg-white/20 text-white"
                    : isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"
                    }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <i className={`fa-solid fa-circle-notch animate-spin text-2xl ${isDark ? "text-slate-600" : "text-slate-400"}`} />
            </div>
          ) : error ? (
            <div className={`text-center py-20 text-sm ${isDark ? "text-red-400" : "text-red-500"}`}>
              <i className="fa-solid fa-circle-exclamation mb-2 text-xl block" />
              {error}
              <button onClick={fetchReport} className="mt-3 text-teal-500 hover:underline block mx-auto">
                Retry
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={`text-center py-20 text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>
              <i className={`fa-solid ${filter === "out" ? "fa-box-open" : filter === "low" ? "fa-triangle-exclamation" : "fa-warehouse"} text-2xl block mb-2 opacity-40`} />
              {search
                ? "No products match your search."
                : filter === "low"
                  ? "No low stock products — great!"
                  : filter === "out"
                    ? "No products are out of stock — great!"
                    : "No products in inventory."}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className={`hidden lg:block rounded-2xl border overflow-hidden ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "bg-slate-900/80 text-slate-500 border-b border-slate-800" : "bg-slate-50 text-slate-400 border-b border-slate-200"}`}>
                      <th className="pl-5 pr-3 py-3.5 w-8">#</th>
                      <th
                        className="px-3 py-3.5 cursor-pointer select-none"
                        onClick={() => handleSort("name")}
                      >
                        Product <SortIcon col="name" />
                      </th>
                      <th
                        className="px-3 py-3.5 cursor-pointer select-none whitespace-nowrap"
                        onClick={() => handleSort("unit_price")}
                      >
                        Unit Price <SortIcon col="unit_price" />
                      </th>
                      <th
                        className="px-3 py-3.5 cursor-pointer select-none"
                        onClick={() => handleSort("stock")}
                      >
                        Stock <SortIcon col="stock" />
                      </th>
                      <th
                        className="px-3 py-3.5 cursor-pointer select-none whitespace-nowrap"
                        onClick={() => handleSort("total_value")}
                      >
                        Total Value <SortIcon col="total_value" />
                      </th>
                      <th className="px-3 py-3.5">Status</th>
                      <th className="px-3 pr-5 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, i) => (
                      <tr
                        key={product.id}
                        className={`transition-colors ${isDark
                          ? `${i % 2 === 0 ? "bg-slate-900/40" : "bg-slate-900/70"} hover:bg-slate-800/80 border-b border-slate-800/60 text-slate-300`
                          : `${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-slate-50 border-b border-slate-100 text-slate-700`
                          }`}
                      >
                        <td className="pl-5 pr-3 py-3.5">
                          <span className={`text-xs font-medium ${isDark ? "text-slate-600" : "text-slate-400"}`}>{i + 1}</span>
                        </td>
                        <td className="px-3 py-3.5 font-medium">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${product.stock === 0 ? "bg-red-500" : product.stock <= LOW_STOCK_THRESHOLD ? "bg-amber-500" : "bg-teal-500"}`} />
                            {product.name}
                          </div>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap font-medium">
                          {fmtCurrency(product.unit_price)}
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <span className={`text-base font-bold ${stockNumColor(product.stock)}`}>{product.stock}</span>
                          <span className={`text-xs ml-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>units</span>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap font-semibold">
                          {fmtCurrency(product.total_value)}
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          {stockBadge(product.stock)}
                        </td>
                        <td className="px-3 pr-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setAdjustingProduct(product)}
                              title="Adjust Stock"
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark ? "text-teal-400 bg-teal-500/10 hover:bg-teal-500/20" : "text-teal-600 bg-teal-50 hover:bg-teal-100"}`}
                            >
                              <i className="fa-solid fa-arrows-up-down text-[10px]" />
                              Adjust
                            </button>
                            {product.stock > 0 && (
                              <button
                                onClick={() => setPendingZero(product)}
                                title="Zero Out Stock"
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}
                              >
                                <i className="fa-solid fa-ban" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Table footer with totals */}
                  <tfoot>
                    <tr className={`text-xs font-semibold ${isDark ? "bg-slate-900/90 text-slate-400 border-t border-slate-800" : "bg-slate-50 text-slate-500 border-t border-slate-200"}`}>
                      <td className="pl-5 pr-3 py-3" />
                      <td className="px-3 py-3 uppercase tracking-wider">
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-3 py-3" />
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                          {filteredProducts.reduce((s, p) => s + p.stock, 0).toLocaleString()}
                        </span>
                        <span className={`text-xs ml-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>units</span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`font-bold text-sm ${isDark ? "text-teal-400" : "text-teal-700"}`}>
                          {fmtCurrency(filteredProducts.reduce((s, p) => s + p.total_value, 0))}
                        </span>
                      </td>
                      <td className="px-3 py-3" />
                      <td className="px-3 pr-5 py-3" />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden grid sm:grid-cols-2 gap-4">
                {filteredProducts.map((product, i) => (
                  <div
                    key={product.id}
                    className={`rounded-2xl border p-4 ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${product.stock === 0 ? "bg-red-500" : product.stock <= LOW_STOCK_THRESHOLD ? "bg-amber-500" : "bg-teal-500"}`} />
                        <div className="min-w-0">
                          <p className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                            {product.name}
                          </p>
                          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            #{i + 1} · {fmtCurrency(product.unit_price)} / unit
                          </p>
                        </div>
                      </div>
                      {stockBadge(product.stock)}
                    </div>

                    <div className={`flex items-center justify-between mt-3 pt-3 border-t ${isDark ? "border-slate-700/60" : "border-slate-100"}`}>
                      <div>
                        <p className={`text-[11px] uppercase font-medium tracking-wide ${isDark ? "text-slate-600" : "text-slate-400"}`}>Stock</p>
                        <p className={`text-xl font-bold mt-0.5 ${stockNumColor(product.stock)}`}>{product.stock}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[11px] uppercase font-medium tracking-wide ${isDark ? "text-slate-600" : "text-slate-400"}`}>Value</p>
                        <p className={`text-sm font-bold mt-0.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>{fmtCurrency(product.total_value)}</p>
                      </div>
                    </div>

                    <div className={`flex gap-2 mt-3 pt-3 border-t ${isDark ? "border-slate-700/60" : "border-slate-100"}`}>
                      <button
                        onClick={() => setAdjustingProduct(product)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-colors ${isDark ? "border-teal-500/30 text-teal-400 hover:bg-teal-500/10" : "border-teal-200 text-teal-600 hover:bg-teal-50"}`}
                      >
                        <i className="fa-solid fa-arrows-up-down text-[10px]" />
                        Adjust Stock
                      </button>
                      {product.stock > 0 && (
                        <button
                          onClick={() => setPendingZero(product)}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${isDark ? "border-slate-700 text-red-400 hover:bg-red-500/10" : "border-slate-200 text-red-500 hover:bg-red-50"}`}
                        >
                          <i className="fa-solid fa-ban text-[10px]" />
                          Zero Out
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary of inventory stats */}
              <div className={`lg:hidden grid text-center grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <div>
                  <p className={`text-xs font-medium uppercase ${isDark ? "text-slate-600" : "text-slate-400"}`}>Total Units</p>
                  <p className={`text-sm font-bold mt-0.5 ${isDark ? "text-teal-400" : "text-teal-700"}`}>{stats.totalUnits.toLocaleString()}</p>
                </div>
                <div>
                  <p className={`text-xs font-medium uppercase ${isDark ? "text-slate-600" : "text-slate-400"}`}>Total Value</p>
                  <p className={`text-sm font-bold mt-0.5 ${isDark ? "text-teal-400" : "text-teal-700"}`}>{fmtCurrency(stats.totalValue)}</p>
                </div>
                <div>
                  <p className={`text-xs font-medium uppercase ${isDark ? "text-slate-600" : "text-slate-400"}`}>Low Stock</p>
                  <p className={`text-sm font-bold mt-0.5 ${isDark ? "text-amber-400" : "text-amber-700"}`}>{stats.lowStock}</p>
                </div>
                <div>
                  <p className={`text-xs font-medium uppercase ${isDark ? "text-slate-600" : "text-slate-400"}`}>Out of Stock</p>
                  <p className={`text-sm font-bold mt-0.5 ${isDark ? "text-red-400" : "text-red-700"}`}>{stats.outOfStock}</p>
                </div>
              </div>

              {/* Report metadata footer */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between mt-5 gap-2 pt-4 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <p className={`text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                  Showing {filteredProducts.length} of {products.length} product{products.length !== 1 ? "s" : ""}
                </p>
                {reportDate && (
                  <p className={`text-xs flex items-center gap-1.5 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    <i className="fa-regular fa-clock text-[10px]" />
                    Report generated {fmtDate(reportDate)}
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Adjust Stock Modal */}
      <AnimatePresence>
        {adjustingProduct && (
          <AdjustModal
            isDark={isDark}
            product={adjustingProduct}
            onClose={() => setAdjustingProduct(null)}
            onAdjusted={handleAdjusted}
          />
        )}
      </AnimatePresence>

      {/* Zero Out Confirm */}
      <AnimatePresence>
        {pendingZero && (
          <ConfirmDialog
            isDark={isDark}
            config={{
              title: "Zero Out Stock",
              message: `Set stock of "${pendingZero.name}" to 0? This will mark it as out of stock.`,
              confirmLabel: "Zero Out",
              variant: "warning",
              iconClass: "fa-solid fa-ban",
            }}
            onConfirm={handleZeroStock}
            onCancel={() => setPendingZero(null)}
            loading={zeroLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
