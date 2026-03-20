import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AxiosError } from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  posSettingsService,
  type POSSettings,
  type CreatePOSSettingsPayload,
} from "../../services/posSettingsService";
import { POSField } from "../../components/pos/POSField";
import { InfoRow } from "../../components/pos/InfoRow";
import { PageTransition } from "../../components/shared/PageTransition";

interface FormState {
  tax_percent: string;
  discount_percent: string;
  receipt_header: string;
  receipt_footer: string;
}

function POSSettingsPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const isAdmin = user?.role === "admin";

  const [pageLoading, setPageLoading] = useState(true);
  const [settings, setSettings] = useState<POSSettings | null>(null);
  const [isSet, setIsSet] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState>({
    tax_percent: "",
    discount_percent: "",
    receipt_header: "",
    receipt_footer: "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    document.title = "POS Settings | SwiftJonny POS";
  }, []);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const syncFormFromSettings = (s: POSSettings) => {
    setForm({
      tax_percent: String(s.tax_percent),
      discount_percent: String(s.discount_percent),
      receipt_header: s.receipt_header,
      receipt_footer: s.receipt_footer,
    });
  };

  const loadSettings = async () => {
    setPageLoading(true);
    setFetchError(null);
    try {
      const res = await posSettingsService.getSettings();
      setIsSet(res.is_set);
      if (res.is_set && res.settings) {
        setSettings(res.settings);
        syncFormFromSettings(res.settings);
      } else {
        setSettings(null);
        setForm({ tax_percent: "", discount_percent: "", receipt_header: "", receipt_footer: "" });
      }
    } catch (err: unknown) {
      const axiosErr = err instanceof AxiosError ? err : null;
      const isNotConfigured =
        axiosErr?.response?.status === 404
        && (axiosErr.response?.data?.is_set === false
          || axiosErr.response?.data?.message === "POS settings not yet configured!");

      if (isNotConfigured) {
        setIsSet(false);
        setSettings(null);
        setForm({ tax_percent: "", discount_percent: "", receipt_header: "", receipt_footer: "" });
      } else {
        setFetchError("Failed to load POS settings. Please try again.");
      }
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = (): string | null => {
    const tax = parseFloat(form.tax_percent);
    const disc = parseFloat(form.discount_percent);
    if (isNaN(tax) || tax < 0) return "Tax percent must be a non-negative number.";
    if (tax > 100) return "Tax percent must not exceed 100.";
    if (isNaN(disc) || disc < 0) return "Discount percent must be a non-negative number.";
    if (disc > 100) return "Discount percent must not exceed 100.";
    if (!form.receipt_header.trim() || form.receipt_header.trim().length < 2)
      return "Receipt header must be at least 2 characters.";
    if (form.receipt_header.trim().length > 50)
      return "Receipt header must not exceed 50 characters.";
    if (!form.receipt_footer.trim() || form.receipt_footer.trim().length < 3)
      return "Receipt footer must be at least 3 characters.";
    if (form.receipt_footer.trim().length > 100)
      return "Receipt footer must not exceed 100 characters.";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { showToast(err, false); return; }
    setSaving(true);
    try {
      const payload: CreatePOSSettingsPayload = {
        tax_percent: parseFloat(form.tax_percent),
        discount_percent: parseFloat(form.discount_percent),
        receipt_header: form.receipt_header.trim(),
        receipt_footer: form.receipt_footer.trim(),
      };
      let res;
      if (isSet) {
        res = await posSettingsService.updateSettings(payload);
      } else {
        res = await posSettingsService.createSettings(payload);
      }
      if (res.settings) {
        setSettings(res.settings);
        syncFormFromSettings(res.settings);
        setIsSet(true);
      }
      setEditing(false);
      showToast(isSet ? "POS settings updated." : "POS settings configured!", true);
    } catch (err: unknown) {
      const axiosErr = err instanceof AxiosError ? err : null;
      const fallback = "Failed to save settings.";
      const firstIssue = axiosErr?.response?.data?.issues?.[0]?.message;
      const msg = axiosErr?.response?.data?.error ?? firstIssue ?? fallback;
      showToast(msg, false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (settings) syncFormFromSettings(settings);
    setEditing(false);
  };

  const bg = isDark
    ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-900"
    : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/80";

  return (
    <PageTransition className={`min-h-screen p-5 md:p-7 ${bg}`}>
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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? "bg-purple-500/10" : "bg-purple-50"
                }`}
            >
              <i className="fa-solid fa-sliders text-purple-500 text-sm" />
            </div>
            <h1
              className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"
                }`}
            >
              POS Configuration
            </h1>
          </div>
          <p className={`text-sm ml-10.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {isAdmin
              ? "Manage tax, discounts, and receipt templates for all transactions."
              : "View the store's current POS configuration."}
          </p>
        </div>

        {/* Config status badge */}
        {!pageLoading && (
          <div
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${isSet
              ? isDark
                ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                : "bg-teal-50 text-teal-700 border-teal-200"
              : isDark
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isSet ? "bg-teal-500" : "bg-amber-500"
                }`}
            />
            {isSet ? "Configured" : "Not Configured"}
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {pageLoading && (
        <div className="max-w-2xl space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-6 animate-pulse ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
                }`}
            >
              <div className={`h-4 w-32 rounded mb-4 ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
              <div className={`h-10 rounded-xl mb-3 ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
              <div className={`h-10 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
            </div>
          ))}
        </div>
      )}

      {/* Fetch error */}
      {!pageLoading && fetchError && (
        <div
          className={`rounded-2xl border p-6 flex items-center gap-4 max-w-2xl ${isDark ? "bg-red-500/5 border-red-500/20" : "bg-red-50 border-red-200"
            }`}
        >
          <i className={`fa-solid fa-triangle-exclamation text-lg ${isDark ? "text-red-400" : "text-red-500"}`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${isDark ? "text-red-300" : "text-red-700"}`}>{fetchError}</p>
          </div>
          <button
            onClick={loadSettings}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${isDark ? "border-red-700 text-red-300 hover:bg-red-500/10" : "border-red-300 text-red-600 hover:bg-red-100"
              }`}
          >
            Retry
          </button>
        </div>
      )}

      {/* Main content */}
      {!pageLoading && !fetchError && (
        <div className="max-w-2xl space-y-5">

          {/* Not configured — cashier view */}
          {!isSet && !isAdmin && (
            <div
              className={`rounded-2xl border p-10 text-center ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
                }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-amber-500/10" : "bg-amber-50"
                  }`}
              >
                <i className="fa-solid fa-cash-register text-amber-500 text-xl" />
              </div>
              <h3 className={`text-base font-semibold mb-1.5 ${isDark ? "text-red-400" : "text-red-500"}`}>
                POS Settings Not Configured!
              </h3>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                The POS terminal hasn't been set up yet. Please contact your store admin.
              </p>
            </div>
          )}

          {/* Not configured — admin setup form */}
          {!isSet && isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-6 ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
                }`}
            >
              <div
                className={`flex items-start gap-3 rounded-xl px-4 py-3 mb-5 text-sm ${isDark
                  ? "bg-amber-500/8 border border-amber-500/20 text-amber-300"
                  : "bg-amber-50 border border-amber-200 text-amber-700"
                  }`}
              >
                <i className="fa-solid fa-triangle-exclamation mt-0.5 shrink-0" />
                <span>
                  POS settings haven't been configured yet. Fill in the details below to get started.
                </span>
              </div>

              <div className="mb-5">
                <h2 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Initial Configuration
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                  These settings apply to all transactions processed through the POS terminal.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <POSField
                    label="Tax (%)" value={form.tax_percent} placeholder="e.g. 15"
                    type="number" disabled={false} isDark={isDark} hint="Applied to every sale"
                    onChange={(v) => setForm((p) => ({ ...p, tax_percent: v }))}
                  />
                  <POSField
                    label="Discount (%)" value={form.discount_percent} placeholder="e.g. 0"
                    type="number" disabled={false} isDark={isDark} hint="Default max discount"
                    onChange={(v) => setForm((p) => ({ ...p, discount_percent: v }))}
                  />
                </div>
                <POSField
                  label="Receipt Header" value={form.receipt_header} placeholder="e.g. SwiftJonny Store"
                  disabled={false} isDark={isDark} hint="Printed at the top of every receipt"
                  onChange={(v) => setForm((p) => ({ ...p, receipt_header: v }))}
                />
                <POSField
                  label="Receipt Footer" value={form.receipt_footer}
                  placeholder="e.g. Thank you for shopping with us!" type="textarea"
                  disabled={false} isDark={isDark} hint="Printed at the bottom of every receipt"
                  onChange={(v) => setForm((p) => ({ ...p, receipt_footer: v }))}
                />
              </div>

              <button
                onClick={handleSave} disabled={saving}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <i className="fa-solid fa-circle-notch animate-spin" />
                ) : (
                  <i className="fa-solid fa-floppy-disk text-xs" />
                )}
                Save Configuration
              </button>
            </motion.div>
          )}

          {/* Configured settings view */}
          {isSet && settings && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

              {/* Tax & Discount card */}
              <div
                className={`rounded-2xl border p-6 ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
                  }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Tax &amp; Discount
                    </h2>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                      Rates automatically applied to every transaction.
                    </p>
                  </div>
                  {isAdmin && !editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isDark
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <i className="fa-solid fa-pen text-[10px]" />
                      Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <POSField
                        label="Tax (%)" value={form.tax_percent} placeholder="e.g. 15"
                        type="number" disabled={false} isDark={isDark}
                        onChange={(v) => setForm((p) => ({ ...p, tax_percent: v }))}
                      />
                      <POSField
                        label="Discount (%)" value={form.discount_percent} placeholder="e.g. 0"
                        type="number" disabled={false} isDark={isDark}
                        onChange={(v) => setForm((p) => ({ ...p, discount_percent: v }))}
                      />
                    </div>
                    <POSField
                      label="Receipt Header" value={form.receipt_header}
                      placeholder="e.g. SwiftJonny Store" disabled={false} isDark={isDark}
                      onChange={(v) => setForm((p) => ({ ...p, receipt_header: v }))}
                    />
                    <POSField
                      label="Receipt Footer" value={form.receipt_footer}
                      placeholder="e.g. Thank you for shopping with us!" type="textarea"
                      disabled={false} isDark={isDark}
                      onChange={(v) => setForm((p) => ({ ...p, receipt_footer: v }))}
                    />
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={handleCancelEdit} disabled={saving}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${isDark
                          ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave} disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-60"
                      >
                        {saving ? <i className="fa-solid fa-circle-notch animate-spin" /> : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <InfoRow label="Tax Rate" value={`${settings.tax_percent}%`} isDark={isDark} />
                    <InfoRow label="Max Discount" value={`${settings.discount_percent}%`} isDark={isDark} />
                  </div>
                )}
              </div>

              {/* Receipt preview card */}
              {!editing && (
                <div
                  className={`rounded-2xl border p-6 ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
                    }`}
                >
                  <div className="mb-5">
                    <h2 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Receipt Template
                    </h2>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                      Text printed on every customer receipt.
                    </p>
                  </div>

                  <div
                    className={`rounded-xl border-2 border-dashed p-5 font-mono text-sm text-center space-y-2 ${isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"
                      }`}
                  >
                    <p className={`font-bold text-base ${isDark ? "text-white" : "text-slate-900"}`}>
                      {settings.receipt_header}
                    </p>
                    <div className={`border-t border-dashed my-2 ${isDark ? "border-slate-600" : "border-slate-300"}`} />
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      — items & totals appear here —
                    </p>
                    <div className={`border-t border-dashed my-2 ${isDark ? "border-slate-600" : "border-slate-300"}`} />
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {settings.receipt_footer}
                    </p>
                  </div>

                  <div className="mt-4 space-y-0">
                    <InfoRow label="Header" value={settings.receipt_header} isDark={isDark} />
                    <InfoRow label="Footer" value={settings.receipt_footer} isDark={isDark} />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </PageTransition>
  );
}

export default POSSettingsPage;
