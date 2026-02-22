import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AxiosError } from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { productService, type Product } from "../../services/productService";
import { categoryService, type Category } from "../../services/categoryService";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { formatDate } from "../../utils/formatDate";

function fmtCurrency(v: number) {
  return `GH₵ ${v.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type SortBy = "created_at" | "name" | "price" | "stock";

const PAGE_SIZE = 10;

// ─── Product Form Modal ────────────────────────────────────────────────────────

interface FormState {
  name: string;
  price: string;
  category_id: string;
  stock: string;
  description: string;
  image: File | null;
}

const emptyForm: FormState = { name: "", price: "", category_id: "", stock: "", description: "", image: null };

interface ProductModalProps {
  isDark: boolean;
  editing: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (product: Product, isNew: boolean) => void;
}

function ProductModal({ isDark, editing, categories, onClose, onSaved }: ProductModalProps) {
  const [form, setForm] = useState<FormState>(
    editing
      ? { name: editing.name, price: String(editing.price), category_id: editing.category_id, stock: String(editing.stock), description: editing.description ?? "", image: null }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const validate = (): string | null => {
    if (!form.name.trim()) return "Product name is required.";
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) return "Price must be a positive number.";
    if (!form.category_id) return "Please select a category.";
    const stock = parseInt(form.stock);
    if (isNaN(stock) || stock < 0) return "Stock must be 0 or more.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("price", form.price);
      fd.append("category_id", form.category_id);
      fd.append("stock", form.stock);
      if (form.description.trim()) fd.append("description", form.description.trim());
      if (form.image) fd.append("product", form.image);

      if (editing) {
        const res = await productService.updateProduct(editing.id, fd);
        onSaved(res.product!, false);
      } else {
        const res = await productService.createProduct(fd);
        onSaved(res.product!, true);
      }
    } catch (err: unknown) {
      setError(err instanceof AxiosError ? (err.response?.data?.error ?? "Operation failed.") : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const field = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors ${isDark
    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-600 focus:border-teal-500/60"
    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-teal-500"
    }`;

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
        className={`relative w-full max-w-lg rounded-2xl border shadow-2xl p-6 max-h-[90vh] overflow-y-auto ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-teal-500/10" : "bg-teal-50"}`}>
            <i className={`fa-solid ${editing ? "fa-pen" : "fa-plus"} text-teal-500 text-sm`} />
          </div>
          <div>
            <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              {editing ? "Edit Product" : "Add Product"}
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {editing ? `Updating "${editing.name}"` : "Fill in the details below"}
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

          {/* Name */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Product Name <span className="text-red-400">*</span>
            </label>
            <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mineral Water 500ml" className={field} disabled={saving} />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Price (GH₵) <span className="text-red-400">*</span>
              </label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" className={field} disabled={saving} />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Stock <span className="text-red-400">*</span>
              </label>
              <input type="number" min="0" value={form.stock} onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" className={field} disabled={saving} />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Category <span className="text-red-400">*</span>
            </label>
            <select value={form.category_id} onChange={(e) => setForm(f => ({ ...f, category_id: e.target.value }))} className={field} disabled={saving}>
              <option value="">Select a category…</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short product description…" className={`${field} resize-none`} disabled={saving} />
          </div>

          {/* Image */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Product Image <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-4 text-center transition-colors ${isDark ? "border-slate-700 hover:border-teal-500/40 bg-slate-800/30" : "border-slate-200 hover:border-teal-400/60 bg-slate-50"}`}
            >
              {form.image ? (
                <p className={`text-sm font-medium ${isDark ? "text-teal-400" : "text-teal-600"}`}>
                  <i className="fa-solid fa-image mr-2" />
                  {form.image.name}
                </p>
              ) : editing?.image_url ? (
                <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  <i className="fa-solid fa-image mr-1 text-teal-500" />
                  Current image set — click to replace
                </p>
              ) : (
                <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  <i className="fa-solid fa-arrow-up-from-bracket mr-1" />
                  Click to upload image
                </p>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setForm(f => ({ ...f, image: e.target.files?.[0] ?? null }))} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={saving} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-60">
              {saving && <i className="fa-solid fa-circle-notch animate-spin text-xs" />}
              {saving ? "Saving…" : editing ? "Update" : "Add Product"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Products() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [inStockTotal, setInStockTotal] = useState(0);
  const [outOfStockTotal, setOutOfStockTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, sortBy, order]);

  // load categories once
  useEffect(() => {
    categoryService.getAllCategories({ limitTo: 1000 })
      .then(r => setCategories(r.categories ?? []))
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getAllProducts({
        search: debouncedSearch || undefined,
        page,
        limit: PAGE_SIZE,
        sortBy: sortBy === "created_at" ? undefined : sortBy,
        order,
      });
      setProducts(res.products ?? []);
      setTotal(res.counts ?? 0);
      setInStockTotal(res.in_stock_count ?? 0);
      setOutOfStockTotal(res.out_of_stock_count ?? 0);
    } catch {
      setError("Failed to load products. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sortBy, order, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSort = (col: SortBy) => {
    if (sortBy === col) setOrder(o => o === "DESC" ? "ASC" : "DESC");
    else { setSortBy(col); setOrder("DESC"); }
  };

  const SortIcon = ({ col }: { col: SortBy }) => {
    if (sortBy !== col) return <i className={`fa-solid fa-sort text-[10px] ml-1 ${isDark ? "text-slate-600" : "text-slate-300"}`} />;
    return <i className={`fa-solid fa-sort-${order === "DESC" ? "down" : "up"} text-[10px] ml-1 text-teal-500`} />;
  };

  const handleSaved = (product: Product, isNew: boolean) => {
    if (isNew) {
      setProducts(prev => [product, ...prev]);
      setTotal(t => t + 1);
    } else {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    }
    setShowModal(false);
    setEditingProduct(null);
    showToast(isNew ? "Product added successfully." : "Product updated.", true);
  };

  const executeDelete = async () => {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      await productService.deleteProduct(pendingDelete.id);
      setProducts(prev => prev.filter(p => p.id !== pendingDelete.id));
      setTotal(t => t - 1);
      showToast("Product deleted.", true);
    } catch (err: unknown) {
      showToast(err instanceof AxiosError ? (err.response?.data?.error ?? "Delete failed.") : "Delete failed.", false);
    } finally {
      setDeleteLoading(false);
      setPendingDelete(null);
    }
  };

  const stockBadge = (stock: number) =>
    stock > 10
      ? <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-700"}`}><span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />{stock}</span>
      : stock > 0
        ? <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-700"}`}><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />{stock} low</span>
        : <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}><span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />Out of stock</span>;

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

      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Products
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {isAdmin ? "Manage your product catalog." : "Browse available products."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors disabled:opacity-50 ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
          >
            <i className={`fa-solid fa-rotate-right text-xs ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {isAdmin && (
            <button
              onClick={() => { setEditingProduct(null); setShowModal(true); }}
              disabled={catLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-60"
            >
              <i className="fa-solid fa-plus text-xs" />
              Add Product
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: total, icon: "fa-solid fa-box", color: isDark ? "text-slate-300" : "text-slate-700", iconColor: isDark ? "text-slate-500" : "text-slate-400", bg: isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-white border-slate-200" },
          { label: "In Stock", value: inStockTotal, icon: "fa-solid fa-circle-check", color: isDark ? "text-teal-300" : "text-teal-700", iconColor: isDark ? "text-teal-500" : "text-teal-500", bg: isDark ? "bg-teal-500/5 border-teal-500/15" : "bg-teal-50/60 border-teal-200" },
          { label: "Out of Stock", value: outOfStockTotal, icon: "fa-solid fa-circle-xmark", color: isDark ? "text-red-300" : "text-red-700", iconColor: isDark ? "text-red-500" : "text-red-500", bg: isDark ? "bg-red-500/5 border-red-500/15" : "bg-red-50/60 border-red-200" },
          { label: "Categories", value: categories.length, icon: "fa-solid fa-tags", color: isDark ? "text-purple-300" : "text-purple-700", iconColor: isDark ? "text-purple-500" : "text-purple-500", bg: isDark ? "bg-purple-500/5 border-purple-500/15" : "bg-purple-50/60 border-purple-200" },
        ].map(({ label, value, icon, color, iconColor, bg }) => (
          <div key={label} className={`rounded-2xl border px-4 py-3.5 flex items-center gap-3 ${loading ? "opacity-40" : ""} ${bg}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-slate-700/60" : "bg-white"} shadow-sm`}>
              <i className={`${icon} text-sm ${iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-xl font-bold leading-none ${color}`}>{value}</p>
              <p className={`text-[11px] font-medium mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
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
        <div className={`flex rounded-xl border p-1 gap-1 text-sm shrink-0 ${isDark ? "bg-slate-900/70 border-slate-700" : "bg-white border-slate-200"}`}>
          {(["created_at", "name", "price", "stock"] as SortBy[]).map(col => (
            <button
              key={col}
              onClick={() => handleSort(col)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${sortBy === col
                ? isDark ? "bg-teal-600 text-white" : "bg-teal-600 text-white"
                : isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"
                }`}
            >
              {col === "created_at" ? "Newest" : col.charAt(0).toUpperCase() + col.slice(1)}
              {sortBy === col && <SortIcon col={col} />}
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
          <button onClick={fetchProducts} className="mt-3 text-teal-500 hover:underline block mx-auto">Retry</button>
        </div>
      ) : products.length === 0 ? (
        <div className={`text-center py-20 text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          <i className="fa-solid fa-box-open text-2xl block mb-2 opacity-40" />
          {debouncedSearch ? "No products match your search." : "No products yet."}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className={`hidden md:block rounded-2xl border overflow-hidden ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "bg-slate-900/80 text-slate-500 border-b border-slate-800" : "bg-slate-50 text-slate-400 border-b border-slate-200"}`}>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5 cursor-pointer select-none" onClick={() => handleSort("name")}>Name <SortIcon col="name" /></th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5 cursor-pointer select-none" onClick={() => handleSort("price")}>Price <SortIcon col="price" /></th>
                  <th className="px-5 py-3.5 cursor-pointer select-none" onClick={() => handleSort("stock")}>Stock <SortIcon col="stock" /></th>
                  <th className="px-5 py-3.5 cursor-pointer select-none" onClick={() => handleSort("created_at")}>Added <SortIcon col="created_at" /></th>
                  {isAdmin && <th className="px-5 py-3.5">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => (
                  <tr
                    key={product.id}
                    className={`transition-colors ${isDark
                      ? `${i % 2 === 0 ? "bg-slate-900/40" : "bg-slate-900/70"} hover:bg-slate-800/80 border-b border-slate-800/60 text-slate-300`
                      : `${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-slate-50 border-b border-slate-100 text-slate-700`
                      }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className={`w-10 h-10 rounded-xl overflow-hidden shrink-0 ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
                        {product.image_url
                          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><i className={`fa-solid fa-image text-lg ${isDark ? "text-slate-600" : "text-slate-300"}`} /></div>
                        }
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium max-w-45 truncate">{product.name}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium whitespace-nowrap ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
                        {product.category_name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold whitespace-nowrap">{fmtCurrency(product.price)}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">{stockBadge(product.stock)}</td>
                    <td className="px-5 py-3.5 text-xs opacity-70">{formatDate(product.created_at)}</td>
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { setEditingProduct(product); setShowModal(true); }}
                            title="Edit"
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${isDark ? "text-blue-400 hover:bg-blue-500/10" : "text-blue-600 hover:bg-blue-50"}`}
                          >
                            <i className="fa-solid fa-pen" />
                          </button>
                          <button
                            onClick={() => setPendingDelete(product)}
                            title="Delete"
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}
                          >
                            <i className="fa-solid fa-trash-can" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className={`rounded-2xl border p-4 transition-colors ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 ${isDark ? "bg-slate-700" : "bg-slate-100"}`}>
                    {product.image_url
                      ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><i className={`fa-solid fa-image text-xl ${isDark ? "text-slate-600" : "text-slate-300"}`} /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-slate-900"}`}>{product.name}</p>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{product.category_name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-sm font-bold ${isDark ? "text-teal-400" : "text-teal-600"}`}>{fmtCurrency(product.price)}</span>
                      {stockBadge(product.stock)}
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className={`flex gap-2 mt-3 pt-3 border-t ${isDark ? "border-slate-700/60" : "border-slate-100"}`}>
                    <button
                      onClick={() => { setEditingProduct(product); setShowModal(true); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-colors ${isDark ? "border-slate-700 text-blue-400 hover:bg-slate-800" : "border-slate-200 text-blue-600 hover:bg-slate-50"}`}
                    >
                      <i className="fa-solid fa-pen text-[10px]" /> Edit
                    </button>
                    <button
                      onClick={() => setPendingDelete(product)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-colors ${isDark ? "border-slate-700 text-red-400 hover:bg-slate-800" : "border-slate-200 text-red-500 hover:bg-slate-50"}`}
                    >
                      <i className="fa-solid fa-trash-can text-[10px]" /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className={`text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                Page {page} of {totalPages} &mdash; {total} product{total !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors disabled:opacity-40 ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors disabled:opacity-40 ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
            </div>
          )}

          <p className={`mt-4 text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            Showing {products.length} of {total} product{total !== 1 ? "s" : ""}
          </p>
        </>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <ProductModal
            isDark={isDark}
            editing={editingProduct}
            categories={categories}
            onClose={() => { setShowModal(false); setEditingProduct(null); }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {pendingDelete && (
          <ConfirmDialog
            isDark={isDark}
            config={{
              title: "Delete Product",
              message: `Permanently delete "${pendingDelete.name}"? This cannot be undone.`,
              confirmLabel: "Delete",
              variant: "danger",
              iconClass: "fa-solid fa-trash-can",
            }}
            onConfirm={executeDelete}
            onCancel={() => setPendingDelete(null)}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
