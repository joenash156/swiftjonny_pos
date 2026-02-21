import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { salesService, type Sale } from "../../services/salesService";

function formatCurrency(v: number) {
  return `GH₵ ${v.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(str: string) {
  return new Date(str).toLocaleString("en-GH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface SaleDetailModalProps {
  publicId: string;
  isDark: boolean;
  onClose: () => void;
}

export function SaleDetailModal({ publicId, isDark, onClose }: SaleDetailModalProps) {
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    salesService
      .getSaleDetails(publicId)
      .then((res) => { if (!cancelled) setSale(res.sale); })
      .catch(() => { if (!cancelled) setError("Failed to load transaction details."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [publicId]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const statusColors = (status: string) => {
    if (status === "voided") return isDark ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-600 border-red-200";
    return isDark ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-teal-50 text-teal-700 border-teal-200";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className={`absolute inset-0 ${isDark ? "bg-black/60" : "bg-black/30"} backdrop-blur-sm`} />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full sm:max-w-lg max-h-[92vh] overflow-hidden rounded-t-3xl sm:rounded-2xl border flex flex-col ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
            }`}
        >
          {/* Drag handle (mobile) */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className={`w-10 h-1 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
          </div>

          {/* Header */}
          <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-slate-700/60" : "border-slate-100"}`}>
            <div>
              <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                Transaction Details
              </h2>
              {sale && (
                <p className={`text-xs mt-0.5 font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  #{sale.public_id}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
                }`}
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-3 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-8 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className={`rounded-xl p-4 text-sm ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}>
                <i className="fa-solid fa-triangle-exclamation mr-2" />
                {error}
              </div>
            )}

            {sale && !loading && (
              <>
                {/* Status & date */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColors(sale.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sale.status === "voided" ? "bg-red-500" : "bg-teal-500"}`} />
                    {sale.status}
                  </span>
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {formatDateTime(sale.created_at)}
                  </span>
                </div>

                {/* Cashier */}
                <div className={`rounded-xl p-3.5 ${isDark ? "bg-slate-800/60" : "bg-slate-50"}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Cashier
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {sale.cashier.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{sale.cashier.name}</p>
                      {sale.cashier.phone && (
                        <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{sale.cashier.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Items ({sale.items.length})
                  </p>
                  <div className={`rounded-xl overflow-hidden border divide-y ${isDark ? "border-slate-800 divide-slate-800" : "border-slate-100 divide-slate-100"}`}>
                    {sale.items.map((item, i) => (
                      <div key={i} className={`flex items-center justify-between px-4 py-3 ${isDark ? "bg-slate-800/40" : "bg-white"}`}>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-slate-900"}`}>{item.product_name}</p>
                          <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {formatCurrency(item.product_price)} × {item.quantity}
                          </p>
                        </div>
                        <p className={`text-sm font-semibold ml-3 shrink-0 ${isDark ? "text-white" : "text-slate-900"}`}>
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className={`rounded-xl p-4 space-y-2 ${isDark ? "bg-slate-800/60" : "bg-slate-50"}`}>
                  {[
                    { label: "Subtotal", value: formatCurrency(sale.subtotal) },
                    { label: "Tax", value: formatCurrency(sale.tax_amount) },
                    { label: "Discount", value: `−${formatCurrency(sale.discount_amount)}` },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{row.label}</span>
                      <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>{row.value}</span>
                    </div>
                  ))}
                  <div className={`border-t pt-2 flex justify-between items-center ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                    <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Total</span>
                    <span className="text-sm font-bold text-teal-500">{formatCurrency(sale.total)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Payment</span>
                    <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                      {sale.payment_method}
                    </span>
                  </div>
                </div>

                {/* Void reason */}
                {sale.status === "voided" && sale.void_reason && (
                  <div className={`rounded-xl p-3.5 border ${isDark ? "bg-red-500/5 border-red-500/20" : "bg-red-50 border-red-200"}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-red-400" : "text-red-600"}`}>
                      Void Reason
                    </p>
                    <p className={`text-sm ${isDark ? "text-red-300" : "text-red-700"}`}>{sale.void_reason}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
