import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AxiosError } from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { categoryService, type Category } from "../../services/categoryService";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { formatDate } from "../../utils/formatDate";

// ─── Category Form Modal ───────────────────────────────────────────────────────

interface CategoryModalProps {
  isDark: boolean;
  editing: Category | null;
  onClose: () => void;
  onSaved: (category: Category, isNew: boolean) => void;
}

function CategoryModal({ isDark, editing, onClose, onSaved }: CategoryModalProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Category name is required."); return; }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const res = await categoryService.updateCategory(editing.id, { name: name.trim(), description: description.trim() || undefined });
        onSaved(res.category!, false);
      } else {
        const res = await categoryService.createCategory({ name: name.trim(), description: description.trim() || undefined });
        onSaved(res.category!, true);
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
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-purple-500/10" : "bg-purple-50"}`}>
            <i className={`fa-solid ${editing ? "fa-pen" : "fa-plus"} text-purple-500 text-sm`} />
          </div>
          <div>
            <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              {editing ? "Edit Category" : "Add Category"}
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {editing ? `Updating "${editing.name}"` : "Create a new product category"}
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

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Category Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Beverages"
              className={field}
              disabled={saving}
              autoFocus
            />
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Description <span className={`font-normal ${isDark ? "text-slate-500" : "text-slate-400"}`}>(optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this category…"
              className={`${field} resize-none`}
              disabled={saving}
            />
          </div>

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
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-60"
            >
              {saving && <i className="fa-solid fa-circle-notch animate-spin text-xs" />}
              {saving ? "Saving…" : editing ? "Update" : "Add Category"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Categories() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const isAdmin = user?.role === "admin";

  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "created_at">("created_at");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoryService.getAllCategories({
        search: debouncedSearch || undefined,
        limitTo: 1000,
        sortBy: sortBy === "name" ? "name" : undefined,
      });
      setCategories(res.categories ?? []);
      setTotal(res.counts ?? 0);
    } catch {
      setError("Failed to load categories. Please try again.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sortBy]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSaved = (category: Category, isNew: boolean) => {
    if (isNew) {
      setCategories(prev => [category, ...prev]);
      setTotal(t => t + 1);
    } else {
      setCategories(prev => prev.map(c => c.id === category.id ? category : c));
    }
    setShowModal(false);
    setEditingCategory(null);
    showToast(isNew ? "Category created successfully." : "Category updated.", true);
  };

  const executeDelete = async () => {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      await categoryService.deleteCategory(pendingDelete.id);
      setCategories(prev => prev.filter(c => c.id !== pendingDelete.id));
      setTotal(t => t - 1);
      showToast("Category deleted.", true);
    } catch (err: unknown) {
      showToast(
        err instanceof AxiosError
          ? (err.response?.data?.error ?? "Delete failed.")
          : "Delete failed.",
        false,
      );
    } finally {
      setDeleteLoading(false);
      setPendingDelete(null);
    }
  };

  // stats — product_count now comes from backend
  const usedCount = categories.filter(c => (c.product_count ?? 0) > 0).length;
  const unusedCount = categories.length - usedCount;

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
            Categories
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {isAdmin ? "Organize your products into categories." : "Browse product categories."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors disabled:opacity-50 ${isDark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
          >
            <i className={`fa-solid fa-rotate-right text-xs ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {isAdmin && (
            <button
              onClick={() => { setEditingCategory(null); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors"
            >
              <i className="fa-solid fa-plus text-xs" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total", value: total, icon: "fa-solid fa-tags", color: isDark ? "text-slate-300" : "text-slate-700", iconColor: isDark ? "text-slate-500" : "text-slate-400", bg: isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-white border-slate-200" },
          { label: "In Use", value: usedCount, icon: "fa-solid fa-check-double", color: isDark ? "text-teal-300" : "text-teal-700", iconColor: isDark ? "text-teal-500" : "text-teal-500", bg: isDark ? "bg-teal-500/5 border-teal-500/15" : "bg-teal-50/60 border-teal-200" },
          { label: "Unused", value: unusedCount, icon: "fa-solid fa-folder-open", color: isDark ? "text-amber-300" : "text-amber-700", iconColor: isDark ? "text-amber-500" : "text-amber-500", bg: isDark ? "bg-amber-500/5 border-amber-500/15" : "bg-amber-50/60 border-amber-200" },
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
            placeholder="Search categories…"
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
          {(["created_at", "name"] as const).map(col => (
            <button
              key={col}
              onClick={() => setSortBy(col)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${sortBy === col
                ? "bg-teal-600 text-white"
                : isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"
                }`}
            >
              {col === "created_at" ? "Newest" : "Name"}
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
          <button onClick={fetchCategories} className="mt-3 text-teal-500 hover:underline block mx-auto">Retry</button>
        </div>
      ) : categories.length === 0 ? (
        <div className={`text-center py-20 text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          <i className="fa-solid fa-tags text-2xl block mb-2 opacity-40" />
          {debouncedSearch ? "No categories match your search." : "No categories yet."}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className={`hidden md:block rounded-2xl border overflow-hidden ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "bg-slate-900/80 text-slate-500 border-b border-slate-800" : "bg-slate-50 text-slate-400 border-b border-slate-200"}`}>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Products</th>
                  <th className="px-5 py-3.5">Created</th>
                  {isAdmin && <th className="px-5 py-3.5">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {categories.map((category, i) => {
                  const productCount = category.product_count ?? 0;
                  return (
                    <tr
                      key={category.id}
                      className={`transition-colors ${isDark
                        ? `${i % 2 === 0 ? "bg-slate-900/40" : "bg-slate-900/70"} hover:bg-slate-800/80 border-b border-slate-800/60 text-slate-300`
                        : `${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-slate-50 border-b border-slate-100 text-slate-700`
                        }`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-purple-500/10" : "bg-purple-50"}`}>
                            <i className="fa-solid fa-tag text-xs text-purple-500" />
                          </div>
                          <span className={`font-semibold whitespace-nowrap ${isDark ? "text-white" : "text-slate-900"}`}>{category.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 max-w-xs">
                        {category.description
                          ? <span className="block truncate opacity-80 max-w-55">{category.description}</span>
                          : <span className={`italic text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>No description</span>
                        }
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${productCount > 0
                          ? isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-700"
                          : isDark ? "bg-slate-700/60 text-slate-500" : "bg-slate-100 text-slate-400"
                          }`}>
                          <i className={`fa-solid fa-box text-[9px] ${productCount > 0 ? "text-teal-500" : isDark ? "text-slate-600" : "text-slate-400"}`} />
                          {productCount} product{productCount !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs opacity-70">{formatDate(category.created_at)}</td>
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => { setEditingCategory(category); setShowModal(true); }}
                              title="Edit"
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${isDark ? "text-blue-400 hover:bg-blue-500/10" : "text-blue-600 hover:bg-blue-50"}`}
                            >
                              <i className="fa-solid fa-pen" />
                            </button>
                            <button
                              onClick={() => setPendingDelete(category)}
                              title="Delete"
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"}`}
                            >
                              <i className="fa-solid fa-trash-can" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {categories.map((category) => {
              const productCount = category.product_count ?? 0;
              return (
                <div
                  key={category.id}
                  className={`rounded-2xl border p-4 transition-colors ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-purple-500/10" : "bg-purple-50"}`}>
                      <i className="fa-solid fa-tag text-sm text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{category.name}</p>
                      {category.description && (
                        <p className={`text-xs mt-0.5 line-clamp-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{category.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${productCount > 0
                          ? isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-50 text-teal-700"
                          : isDark ? "bg-slate-700/60 text-slate-500" : "bg-slate-100 text-slate-400"
                          }`}>
                          <i className="fa-solid fa-box text-[9px]" />
                          {productCount} product{productCount !== 1 ? "s" : ""}
                        </span>
                        <span className={`text-[11px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>{formatDate(category.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className={`flex gap-2 mt-3 pt-3 border-t ${isDark ? "border-slate-700/60" : "border-slate-100"}`}>
                      <button
                        onClick={() => { setEditingCategory(category); setShowModal(true); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-colors ${isDark ? "border-slate-700 text-blue-400 hover:bg-slate-800" : "border-slate-200 text-blue-600 hover:bg-slate-50"}`}
                      >
                        <i className="fa-solid fa-pen text-[10px]" /> Edit
                      </button>
                      <button
                        onClick={() => setPendingDelete(category)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-colors ${isDark ? "border-slate-700 text-red-400 hover:bg-slate-800" : "border-slate-200 text-red-500 hover:bg-slate-50"}`}
                      >
                        <i className="fa-solid fa-trash-can text-[10px]" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className={`mt-4 text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            Showing {categories.length} of {total} categor{total !== 1 ? "ies" : "y"}
          </p>
        </>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <CategoryModal
            isDark={isDark}
            editing={editingCategory}
            onClose={() => { setShowModal(false); setEditingCategory(null); }}
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
              title: "Delete Category",
              message: (pendingDelete?.product_count ?? 0) > 0
                ? `"${pendingDelete?.name}" has ${pendingDelete?.product_count} product(s). Remove all products from this category first before deleting it.`
                : `Delete "${pendingDelete?.name}"? This cannot be undone.`,
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
