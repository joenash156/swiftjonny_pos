import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AxiosError } from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import { adminService, type Cashier } from "../../services/adminService";
import { formatDate } from "../../utils/formatDate";
import { StatusBadge } from "../../components/cashiers/StatusBadge";
import { DetailModal, type PendingAction } from "../../components/cashiers/DetailModal";
import { ConfirmDialog, type ConfirmDialogConfig } from "../../components/shared/ConfirmDialog";

function getInitials(c: Cashier) {
  return `${c.firstname?.[0] ?? ""}${c.lastname?.[0] ?? ""}`.toUpperCase();
}

function getConfirmConfig(action: PendingAction): ConfirmDialogConfig {
  const name = `${action.cashier.firstname} ${action.cashier.lastname}`;
  switch (action.type) {
    case "approve":
      return {
        title: "Approve Cashier",
        message: `Grant ${name} access to the POS system? They will be able to log in and process transactions.`,
        confirmLabel: "Approve",
        variant: "success",
        iconClass: "fa-solid fa-circle-check",
      };
    case "disable":
      return {
        title: "Disable Cashier",
        message: `Revoke ${name}'s access? They will no longer be able to log in until re-approved.`,
        confirmLabel: "Disable",
        variant: "warning",
        iconClass: "fa-solid fa-ban",
      };
    case "delete":
      return {
        title: "Delete Cashier",
        message: `Permanently delete ${name}'s account? This action cannot be undone.`,
        confirmLabel: "Delete",
        variant: "danger",
        iconClass: "fa-solid fa-triangle-exclamation",
      };
    case "role":
      return {
        title: "Change Role",
        message: `Change ${name}'s role to ${action.role === "admin" ? "Admin" : "Cashier"
          }? ${action.role === "admin"
            ? "They will gain full administrative access."
            : "They will lose admin privileges."
          }`,
        confirmLabel: "Confirm",
        variant: action.role === "admin" ? "warning" : "success",
        iconClass: "fa-solid fa-user-shield",
      };
  }
}

function Cashiers() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [filterApproved, setFilterApproved] = useState<"all" | "active" | "pending">("all");
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Derived stats
  const stats = {
    total: cashiers.length,
    active: cashiers.filter((c) => c.is_approved).length,
    pending: cashiers.filter((c) => !c.is_approved).length,
    profileComplete: cashiers.filter((c) => c.is_profile_complete === 1).length,
  };

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCashiers = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsUnauthorized(false);
    try {
      const params =
        filterApproved === "active"
          ? { is_approved: true }
          : filterApproved === "pending"
            ? { is_approved: false }
            : undefined;
      const res = await adminService.getCashiers(params);
      setCashiers(res.cashiers ?? []);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.status === 403) {
        setIsUnauthorized(true);
        setError(
          err.response?.data?.error ||
          "Administrator access required. Unauthorized users cannot access this."
        );
      } else {
        setError("Failed to load cashiers. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [filterApproved]);

  useEffect(() => {
    fetchCashiers();
  }, [fetchCashiers]);

  // Client-side search filter
  const filtered = cashiers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.firstname.toLowerCase().includes(q) ||
      c.lastname.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  // Request an action (shows confirm dialog)
  const requestAction = (action: PendingAction) => {
    setSelectedCashier(null); // close detail modal first
    setPendingAction(action);
  };

  // Execute confirmed action
  const executeAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    const { cashier } = pendingAction;
    try {
      if (pendingAction.type === "approve") {
        await adminService.approveCashier(cashier.id);
        setCashiers((prev) =>
          prev.map((c) => (c.id === cashier.id ? { ...c, is_approved: 1 } : c))
        );
        showToast("Cashier approved successfully.", true);
      } else if (pendingAction.type === "disable") {
        await adminService.disableCashier(cashier.id);
        setCashiers((prev) =>
          prev.map((c) => (c.id === cashier.id ? { ...c, is_approved: 0 } : c))
        );
        showToast("Cashier disabled.", true);
      } else if (pendingAction.type === "delete") {
        await adminService.deleteCashier(cashier.id);
        setCashiers((prev) => prev.filter((c) => c.id !== cashier.id));
        showToast("Cashier deleted.", true);
      } else if (pendingAction.type === "role") {
        const { role } = pendingAction;
        await adminService.updateUserRole(cashier.id, role);
        setCashiers((prev) =>
          prev.map((c) => (c.id === cashier.id ? { ...c, role } : c))
        );
        showToast("Role updated.", true);
      }
    } catch {
      showToast("Action failed. Please try again.", false);
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  };

  // Table row actions

  const ActionCell = ({ cashier }: { cashier: Cashier }) => {
    const isApproved = Boolean(cashier.is_approved);
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedCashier(cashier); }}
          title="View details"
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${isDark
            ? "text-slate-400 hover:bg-slate-700 hover:text-white"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
        >
          <i className="fa-solid fa-eye" />
        </button>

        {isApproved ? (
          <button
            onClick={(e) => { e.stopPropagation(); requestAction({ type: "disable", cashier }); }}
            title="Disable"
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${isDark ? "text-amber-400 hover:bg-amber-500/10" : "text-amber-500 hover:bg-amber-50"
              }`}
          >
            <i className="fa-solid fa-ban" />
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); requestAction({ type: "approve", cashier }); }}
            title="Approve"
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${isDark ? "text-teal-400 hover:bg-teal-500/10" : "text-teal-600 hover:bg-teal-50"
              }`}
          >
            <i className="fa-solid fa-check" />
          </button>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); requestAction({ type: "delete", cashier }); }}
          title="Delete"
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"
            }`}
        >
          <i className="fa-solid fa-trash-can" />
        </button>
      </div>
    );
  };

  // Render

  return (
    <div
      className={`min-h-screen p-5 md:p-7 ${isDark
        ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-900"
        : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/80"
        }`}
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed top-5 right-5 z-70 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg ${toast.ok
              ? isDark
                ? "bg-teal-900 text-teal-300 border border-teal-700"
                : "bg-teal-50 text-teal-700 border border-teal-200"
              : isDark
                ? "bg-red-900/50 text-red-300 border border-red-700"
                : "bg-red-50 text-red-600 border border-red-200"
              }`}
          >
            <i className={`fa-solid ${toast.ok ? "fa-check" : "fa-xmark"} text-xs`} />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
          Cashiers
        </h1>
        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Manage cashier accounts, approvals and roles.
        </p>
      </div>

      {/* Unauthorized — show API message, hide everything else */}
      {isUnauthorized && error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isDark ? "bg-red-500/10" : "bg-red-50"
              }`}
          >
            <i className="fa-solid fa-shield-halved text-red-500 text-xl" />
          </div>
          <p className={`text-sm font-semibold mb-1.5 ${isDark ? "text-red-400" : "text-red-600"}`}>
            Access Denied
          </p>
          <p className={`text-sm max-w-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {error}
          </p>
        </div>
      )}

      {/* Stats */}
      {!isUnauthorized && <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Total",
            value: stats.total,
            icon: "fa-solid fa-users",
            color: isDark ? "text-slate-300" : "text-slate-700",
            iconColor: isDark ? "text-slate-500" : "text-slate-400",
            bg: isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-white border-slate-200",
          },
          {
            label: "Active",
            value: stats.active,
            icon: "fa-solid fa-circle-check",
            color: isDark ? "text-teal-300" : "text-teal-700",
            iconColor: isDark ? "text-teal-500" : "text-teal-500",
            bg: isDark ? "bg-teal-500/5 border-teal-500/15" : "bg-teal-50/60 border-teal-200",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: "fa-solid fa-clock",
            color: isDark ? "text-amber-300" : "text-amber-700",
            iconColor: isDark ? "text-amber-500" : "text-amber-500",
            bg: isDark ? "bg-amber-500/5 border-amber-500/15" : "bg-amber-50/60 border-amber-200",
          },
          {
            label: "Profile Complete",
            value: stats.profileComplete,
            icon: "fa-solid fa-user",
            color: isDark ? "text-slate-300" : "text-slate-700",
            iconColor: isDark ? "text-slate-500" : "text-slate-500",
            bg: isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-white border-slate-200",
          },
        ].map(({ label, value, icon, color, iconColor, bg }) => (
          <div
            key={label}
            className={`rounded-2xl border px-4 py-3.5 flex items-center gap-3 ${loading ? "opacity-40" : ""
              } ${bg}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-slate-700/60" : "bg-white"
                } shadow-sm`}
            >
              <i className={`${icon} text-sm ${iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-xl font-bold leading-none ${color}`}>{value}</p>
              <p
                className={`text-[11px] font-medium mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"
                  }`}
              >
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>}

      {/* Toolbar + Content — hidden when unauthorized */}
      {!isUnauthorized && <>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <i
              className={`fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-slate-500" : "text-slate-400"
                }`}
            />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm transition-colors outline-none ${isDark
                ? "bg-slate-900/70 border-slate-700 text-white placeholder-slate-500 focus:border-teal-500"
                : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-teal-500"
                }`}
            />
          </div>

          {/* Filter tabs */}
          <div
            className={`flex rounded-xl border p-1 gap-1 text-sm shrink-0 ${isDark ? "bg-slate-900/70 border-slate-700" : "bg-white border-slate-200"
              }`}
          >
            {(["all", "active", "pending"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterApproved(f)}
                className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${filterApproved === f
                  ? isDark
                    ? "bg-teal-600 text-white"
                    : "bg-teal-600 text-white"
                  : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <i
              className={`fa-solid fa-circle-notch animate-spin text-2xl ${isDark ? "text-slate-600" : "text-slate-400"
                }`}
            />
          </div>
        ) : error ? (
          <div className={`text-center py-20 text-sm ${isDark ? "text-red-400" : "text-red-500"}`}>
            <i className="fa-solid fa-circle-exclamation mb-2 text-xl block" />
            {error}
            <button
              onClick={fetchCashiers}
              className="mt-3 text-teal-500 hover:underline block mx-auto"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-20 text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            <i className="fa-solid fa-users-slash text-2xl block mb-2 opacity-40" />
            {search ? "No cashiers match your search." : "No cashiers found."}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div
              className={`hidden md:block rounded-2xl border overflow-hidden ${isDark ? "border-slate-800" : "border-slate-200"
                }`}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className={`text-left text-xs font-semibold uppercase tracking-wider ${isDark
                      ? "bg-slate-900/80 text-slate-500 border-b border-slate-800"
                      : "bg-slate-50 text-slate-400 border-b border-slate-200"
                      }`}
                  >
                    <th className="px-5 py-3.5">Cashier</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Phone</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Last Login</th>
                    <th className="px-5 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cashier, i) => (
                    <tr
                      key={cashier.id}
                      onClick={() => setSelectedCashier(cashier)}
                      className={`cursor-pointer transition-colors ${isDark
                        ? `${i % 2 === 0 ? "bg-slate-900/40" : "bg-slate-900/70"} hover:bg-slate-800/80 border-b border-slate-800/60 text-slate-300`
                        : `${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-slate-50 border-b border-slate-100 text-slate-700`
                        }`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {getInitials(cashier)}
                          </div>
                          <span className="font-medium">
                            {cashier.firstname} {cashier.lastname}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs opacity-80">
                        {cashier.email}
                      </td>
                      <td className="px-5 py-3.5">{cashier.phone || "—"}</td>
                      <td className="px-5 py-3.5 capitalize">{cashier.role}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge approved={Boolean(cashier.is_approved)} isDark={isDark} />
                      </td>
                      <td className="px-5 py-3.5 text-xs opacity-70">
                        {formatDate(cashier.last_login_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <ActionCell cashier={cashier} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((cashier) => (
                <div
                  key={cashier.id}
                  onClick={() => setSelectedCashier(cashier)}
                  className={`rounded-2xl border p-4 cursor-pointer transition-colors ${isDark
                    ? "bg-slate-900/70 border-slate-800 hover:bg-slate-800/80"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {getInitials(cashier)}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-slate-900"
                            }`}
                        >
                          {cashier.firstname} {cashier.lastname}
                        </p>
                        <p
                          className={`text-xs truncate mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                        >
                          {cashier.email}
                        </p>
                      </div>
                    </div>
                    <StatusBadge approved={Boolean(cashier.is_approved)} isDark={isDark} />
                  </div>

                  <div
                    className={`flex items-center justify-between mt-3 pt-3 border-t ${isDark ? "border-slate-700/60" : "border-slate-100"
                      }`}
                  >
                    <div className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      <i className="fa-solid fa-right-to-bracket mr-1 opacity-60" />
                      {formatDate(cashier.last_login_at)}
                    </div>
                    <ActionCell cashier={cashier} />
                  </div>
                </div>
              ))}
            </div>

            {/* Count */}
            <p className={`mt-4 text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
              Showing {filtered.length} of {cashiers.length} cashier
              {cashiers.length !== 1 ? "s" : ""}
            </p>
          </>
        )}

      </>}{/* end !isUnauthorized */}

      {/* Modals */}
      <AnimatePresence>
        {selectedCashier && (
          <DetailModal
            key="detail"
            cashier={selectedCashier}
            isDark={isDark}
            onClose={() => setSelectedCashier(null)}
            onRequestAction={requestAction}
          />
        )}
        {pendingAction && (
          <ConfirmDialog
            key="confirm"
            isDark={isDark}
            config={getConfirmConfig(pendingAction)}
            onConfirm={executeAction}
            onCancel={() => setPendingAction(null)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Cashiers;
