import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AxiosError } from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { productService, type Product } from "../../services/productService";
import { posSettingsService, type POSSettings } from "../../services/posSettingsService";
import { salesService } from "../../services/salesService";
import { ProductCard } from "../../components/pos/ProductCard";
import { CartItem } from "../../components/pos/CartItem";
import { PageTransition } from "../../components/shared/PageTransition";
import { printSaleReceipt } from "../../utils/printReceipt";

// Types
interface CartEntry {
  product: Product;
  quantity: number;
}

type PaymentMethod = "cash" | "card" | "mobile";

interface CompletedSale {
  public_id: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  payment_method: string;
  items: { product_name: string; product_price: number; quantity: number; price: number }[];
  cashier_name: string;
  receipt_header: string;
  receipt_footer: string;
  created_at: string | Date;
}


function fmt(n: number) {
  return `GH₵ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface ConfirmModalProps {
  isDark: boolean;
  cart: CartEntry[];
  settings: POSSettings;
  paymentMethod: PaymentMethod;
  printReceipt: boolean;
  submitting: boolean;
  onSetPrintReceipt: (v: boolean) => void;
  onSetPayment: (v: PaymentMethod) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  isDark, cart, settings, paymentMethod, printReceipt, submitting,
  onSetPrintReceipt, onSetPayment, onConfirm, onCancel,
}: ConfirmModalProps) {
  const subtotal = cart.reduce((s, e) => s + e.product.price * e.quantity, 0);
  const discountAmount = +(subtotal * (settings.discount_percent / 100)).toFixed(2);
  const taxableAmount = +(subtotal - discountAmount).toFixed(2);
  const taxAmount = +(taxableAmount * (settings.tax_percent / 100)).toFixed(2);
  const total = +(taxableAmount + taxAmount).toFixed(2);

  const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: string }[] = [
    { key: "cash", label: "Cash", icon: "fa-solid fa-money-bills" },
    { key: "card", label: "Card", icon: "fa-solid fa-credit-card" },
    { key: "mobile", label: "Mobile Money", icon: "fa-solid fa-mobile-screen" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${isDark ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200"
          }`}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? "bg-teal-500/10" : "bg-teal-50"}`}>
              <i className="fa-solid fa-receipt text-teal-500 text-sm" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Confirm Sale</h2>
              <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Review before completing</p>
            </div>
          </div>
          <button onClick={onCancel} className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${isDark ? "text-slate-500 hover:bg-slate-800 hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}>
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Receipt preview */}
          <div className={`rounded-xl border-2 border-dashed p-4 font-mono text-sm ${isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"}`}>
            <p className={`text-center font-bold text-base mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>{settings.receipt_header}</p>
            <p className={`text-center text-xs mb-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {new Date().toLocaleString("en-GH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
            <div className={`border-t border-dashed mb-3 ${isDark ? "border-slate-700" : "border-slate-300"}`} />
            <div className="space-y-1.5 mb-3">
              {cart.map((entry) => (
                <div key={entry.product.id} className="flex justify-between items-start gap-2">
                  <span className={`text-xs flex-1 truncate ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {entry.product.name} x {entry.quantity}
                  </span>
                  <span className={`text-xs font-semibold shrink-0 ${isDark ? "text-white" : "text-slate-900"}`}>
                    {fmt(entry.product.price * entry.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className={`border-t border-dashed mb-3 ${isDark ? "border-slate-700" : "border-slate-300"}`} />
            <div className="space-y-1">
              {[
                { label: "Subtotal", value: fmt(subtotal) },
                { label: `Discount (${settings.discount_percent}%)`, value: `-${fmt(discountAmount)}` },
                { label: `Tax (${settings.tax_percent}%)`, value: `+${fmt(taxAmount)}` },
              ].map((r) => (
                <div key={r.label} className="flex justify-between">
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{r.label}</span>
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>{r.value}</span>
                </div>
              ))}
              <div className={`flex justify-between pt-1 mt-1 border-t border-dashed ${isDark ? "border-slate-700" : "border-slate-300"}`}>
                <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>TOTAL</span>
                <span className="text-sm font-bold text-teal-500">{fmt(total)}</span>
              </div>
            </div>
            <div className={`border-t border-dashed mt-3 pt-3 text-center ${isDark ? "border-slate-700" : "border-slate-300"}`}>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>{settings.receipt_footer}</p>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.key}
                  onClick={() => onSetPayment(pm.key)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold transition-all ${paymentMethod === pm.key
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                    : isDark
                      ? "border-slate-700 text-slate-400 hover:border-teal-500/40 hover:text-slate-200"
                      : "border-slate-200 text-slate-600 hover:border-teal-400 hover:bg-teal-50"
                    }`}
                >
                  <i className={`${pm.icon} text-base`} />
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Print receipt toggle */}
          <button
            onClick={() => onSetPrintReceipt(!printReceipt)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${printReceipt
              ? isDark ? "border-teal-500/30 bg-teal-500/5" : "border-teal-400 bg-teal-50"
              : isDark ? "border-slate-700 hover:border-slate-600" : "border-slate-200 hover:border-slate-300"
              }`}
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${printReceipt ? "bg-teal-600 border-teal-600" : isDark ? "border-slate-600" : "border-slate-300"}`}>
              {printReceipt && <i className="fa-solid fa-check text-white text-[10px]" />}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>Print Receipt</p>
              <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Opens receipt in a printable window</p>
            </div>
            <i className="fa-solid fa-print text-slate-400 text-sm" />
          </button>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel} disabled={submitting}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-50 ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
            >
              Back to Cart
            </button>
            <button
              onClick={onConfirm} disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-60"
            >
              {submitting ? (
                <><i className="fa-solid fa-circle-notch animate-spin" /> Processing...</>
              ) : (
                <><i className="fa-solid fa-check text-xs" /> Complete Sale</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


interface SuccessModalProps {
  isDark: boolean;
  sale: CompletedSale;
  onClose: () => void;
  onPrintAgain: () => void;
}

function SuccessModal({ isDark, sale, onClose, onPrintAgain }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`relative w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center ${isDark ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200"}`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isDark ? "text-slate-500 hover:bg-slate-800 hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
        >
          <i className="fa-solid fa-xmark text-sm" />
        </button>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-teal-500/10" : "bg-teal-50"}`}>
          <i className="fa-solid fa-circle-check text-teal-500 text-3xl" />
        </div>
        <h2 className={`text-xl font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Sale Complete!</h2>
        <p className={`text-sm mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Transaction processed successfully.</p>
        <p className="text-2xl font-bold text-teal-500 mb-2">{fmt(sale.total)}</p>
        <p className={`text-xs font-mono mb-6 ${isDark ? "text-slate-600" : "text-slate-400"}`}>#{sale.public_id.slice(0, 16).toUpperCase()}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onPrintAgain}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
          >
            <i className="fa-solid fa-print text-xs" /> Print Again
          </button>
          <button onClick={onClose} className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors">
            <i className="fa-solid fa-plus text-xs" /> New Sale
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function POSTerminal() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";

  // Per-user localStorage key so different cashiers on the same machine
  // each have their own independent cart.
  const cartKey = `pos_cart_${user?.id ?? "guest"}`;

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [settings, setSettings] = useState<POSSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsConfigured, setSettingsConfigured] = useState(false);

  const [search, setSearch] = useState("");
  // Initialize cart from localStorage.
  const [cart, setCart] = useState<CartEntry[]>(() => {
    try {
      // Read the user ID from localStorage directly (AuthContext seeds it there)
      const stored = localStorage.getItem(
        `pos_cart_${(JSON.parse(localStorage.getItem("user") ?? "null") as { id?: string } | null)?.id ?? "guest"}`
      );
      return stored ? (JSON.parse(stored) as CartEntry[]) : [];
    } catch {
      return [];
    }
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [printReceipt, setPrintReceipt] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const loadProducts = useCallback(async (q?: string) => {
    setProductsLoading(true);
    try {
      const res = await productService.getAllProducts({ search: q || undefined, limit: 60, order: "ASC", sortBy: "name" });
      setProducts(res.products ?? []);
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }

  }, []);

  // console.log(products)

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await posSettingsService.getSettings();
      setSettingsConfigured(res.is_set);
      if (res.is_set && res.settings) setSettings(res.settings);
    } catch {
      setSettingsConfigured(false);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); loadProducts(); }, [loadSettings, loadProducts]);

  // Persist cart to localStorage whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch { /* storage full or unavailable — fail silently */ }
  }, [cart, cartKey]);

  // debounced product search
  useEffect(() => {
    const t = setTimeout(() => loadProducts(search), 300);
    return () => clearTimeout(t);
  }, [search, loadProducts]);

  // cart helpers
  const cartQtyFor = (productId: string) => cart.find((e) => e.product.id === productId)?.quantity ?? 0;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const idx = prev.findIndex((e) => e.product.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        const entry = updated[idx]!;
        if (entry.quantity < product.stock) updated[idx] = { ...entry, quantity: entry.quantity + 1 };
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const setQty = (productId: string, qty: number) => {
    setCart((prev) =>
      prev.map((e) => e.product.id === productId ? { ...e, quantity: Math.max(1, Math.min(qty, e.product.stock)) } : e)
    );
  };

  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((e) => e.product.id !== productId));
  const clearCart = () => {
    setCart([]);
    try { localStorage.removeItem(cartKey); } catch { /* storage unavailable */ }
  };

  // totals
  const subtotal = cart.reduce((s, e) => s + e.product.price * e.quantity, 0);
  const discountAmount = settings ? +(subtotal * (settings.discount_percent / 100)).toFixed(2) : 0;
  const taxableAmount = +(subtotal - discountAmount).toFixed(2);
  const taxAmount = settings ? +(taxableAmount * (settings.tax_percent / 100)).toFixed(2) : 0;
  const total = +(taxableAmount + taxAmount).toFixed(2);
  const totalItems = cart.reduce((s, e) => s + e.quantity, 0);

  const completeSale = async () => {
    if (!settings || cart.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await salesService.createSale({
        payment_method: paymentMethod,
        items: cart.map((e) => ({ product_id: e.product.id, quantity: e.quantity })),
      });
      const sale = res.sale;
      const completed: CompletedSale = {
        public_id: sale.public_id,
        subtotal: sale.subtotal,
        discount_amount: sale.discount_amount,
        tax_amount: sale.tax_amount,
        total: sale.total,
        payment_method: sale.payment_method,
        items: sale.items.map((i) => ({ product_name: i.product_name, product_price: i.product_price, quantity: i.quantity, price: i.price })),
        cashier_name: `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim(),
        receipt_header: settings.receipt_header,
        receipt_footer: settings.receipt_footer,
        created_at: sale.created_at,
      };
      if (printReceipt) printSaleReceipt(completed);
      setShowConfirm(false);
      setCompletedSale(completed);
      clearCart();
      setSearch("");
      loadProducts();
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.error ?? "Failed to complete sale." : "Failed to complete sale.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewSale = () => {
    setCompletedSale(null);
    setPaymentMethod("cash");
    setPrintReceipt(false);
    setTimeout(() => searchRef.current?.focus(), 100);
  };

  const bg = isDark
    ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-900"
    : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/80";

  const isLoading = productsLoading || settingsLoading;

  return (
    <PageTransition className={`min-h-screen flex flex-col ${bg}`}>

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-0">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-teal-500/10" : "bg-teal-50"}`}>
            <i className="fa-solid fa-cash-register text-teal-500 text-sm" />
          </div>
          <div>
            <h1 className={`text-xl font-bold tracking-tight leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>POS Terminal</h1>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Select products and complete a sale</p>
          </div>
        </div>
        {!settingsLoading && !settingsConfigured && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${isDark ? "bg-amber-500/5 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
            <i className="fa-solid fa-triangle-exclamation text-[11px]" />
            POS not configured contact your admin
          </div>
        )}
        {!settingsLoading && settingsConfigured && settings && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${isDark ? "bg-teal-500/5 border-teal-500/20 text-teal-400" : "bg-teal-50 border-teal-200 text-teal-700"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Tax {settings.tax_percent}% <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Discount {settings.discount_percent}%
          </div>
        )}
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mx-5 mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border ${isDark ? "bg-red-500/5 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600"}`}
          >
            <i className="fa-solid fa-triangle-exclamation text-xs" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="shrink-0 opacity-60 hover:opacity-100">
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row flex-1 gap-4 p-5 pt-3 overflow-hidden min-h-0">

        {/* LEFT: Product grid */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
          {/* Search bar */}
          <div className="relative mb-4 shrink-0">
            <i className={`fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${isDark
                ? "bg-slate-900/70 border-slate-700 text-white placeholder-slate-600 focus:border-teal-500"
                : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-teal-500"
                }`}
            />
            {search && (
              <button onClick={() => setSearch("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-700"}`}>
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            )}
          </div>

          {/* Products */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className={`rounded-2xl border animate-pulse ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"}`} style={{ height: 200 }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-16 rounded-2xl border ${isDark ? "bg-slate-900/40 border-slate-800" : "bg-white/60 border-slate-200"}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                  <i className="fa-solid fa-box text-slate-400 text-xl" />
                </div>
                <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {search ? `No products matching "${search}"` : "No products found"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartQty={cartQtyFor(product.id)}
                    isDark={isDark}
                    onAdd={() => addToCart(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Cart */}
        <div
          className={`w-full lg:w-72 xl:w-80 shrink-0 flex flex-col rounded-2xl border overflow-hidden ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"}`}
          style={{ minHeight: 320, maxHeight: "calc(100vh - 120px)" }}
        >
          {/* Cart header */}
          <div className={`flex items-center justify-between px-4 py-3.5 border-b shrink-0 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
            <div className="flex items-center gap-2">
              <i className={`fa-solid fa-cart-shopping text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`} />
              <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Cart</span>
              {totalItems > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white">{totalItems}</span>
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className={`text-xs font-medium transition-colors ${isDark ? "text-slate-600 hover:text-red-400" : "text-slate-400 hover:text-red-500"}`}>
                Clear all
              </button>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
                  <i className={`fa-solid fa-cart-shopping text-xl ${isDark ? "text-slate-700" : "text-slate-300"}`} />
                </div>
                <p className={`text-sm font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>Cart is empty</p>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>Tap a product to add it here</p>
              </div>
            ) : (
              cart.map((entry) => (
                <CartItem
                  key={entry.product.id}
                  name={entry.product.name}
                  pricePerUnit={entry.product.price}
                  quantity={entry.quantity}
                  maxQty={entry.product.stock}
                  isDark={isDark}
                  onIncrement={() => setQty(entry.product.id, entry.quantity + 1)}
                  onDecrement={() => setQty(entry.product.id, entry.quantity - 1)}
                  onRemove={() => removeFromCart(entry.product.id)}
                />
              ))
            )}
          </div>

          {/* Totals + checkout */}
          {cart.length > 0 && settings && (
            <div className={`border-t shrink-0 px-4 pt-3 pb-4 space-y-2 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
              <div className="space-y-1.5">
                {[
                  { label: "Subtotal", value: fmt(subtotal) },
                  { label: `Discount (${settings.discount_percent}%)`, value: `-${fmt(discountAmount)}` },
                  { label: `Tax (${settings.tax_percent}%)`, value: `+${fmt(taxAmount)}` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{row.label}</span>
                    <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>{row.value}</span>
                  </div>
                ))}
                <div className={`flex justify-between items-center pt-2 border-t ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                  <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Total</span>
                  <span className="text-base font-bold text-teal-500">{fmt(total)}</span>
                </div>
              </div>
              <button
                onClick={() => { setError(null); setShowConfirm(true); }}
                disabled={!settingsConfigured}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-cash-register text-xs" />
                Proceed to Checkout
              </button>
            </div>
          )}

          {cart.length === 0 && !isLoading && (
            <div className="px-4 pb-4 shrink-0">
              <div className={`text-center text-xs py-2 ${isDark ? "text-slate-700" : "text-slate-300"}`}>Add items to begin a sale</div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && settings && (
          <ConfirmModal
            isDark={isDark} cart={cart} settings={settings}
            paymentMethod={paymentMethod} printReceipt={printReceipt} submitting={submitting}
            onSetPrintReceipt={setPrintReceipt} onSetPayment={setPaymentMethod}
            onConfirm={completeSale} onCancel={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {completedSale && (
          <SuccessModal isDark={isDark} sale={completedSale} onClose={handleNewSale} onPrintAgain={() => printSaleReceipt(completedSale)} />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

export default POSTerminal;
