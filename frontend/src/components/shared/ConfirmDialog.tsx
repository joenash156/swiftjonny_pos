import React from "react";
import { motion } from "framer-motion";

export interface ConfirmDialogConfig {
  title: string;
  message: string | React.ReactNode;
  confirmLabel: string;
  variant: "danger" | "warning" | "success";
  iconClass: string;
}

interface ConfirmDialogProps {
  isDark: boolean;
  config: ConfirmDialogConfig;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export function ConfirmDialog({
  isDark,
  config,
  onCancel,
  onConfirm,
  loading,
}: ConfirmDialogProps) {
  const vs = {
    danger: {
      bg: isDark ? "bg-red-500/10" : "bg-red-50",
      icon: "text-red-500",
      btn: "bg-red-500 hover:bg-red-600 text-white",
    },
    warning: {
      bg: isDark ? "bg-amber-500/10" : "bg-amber-50",
      icon: "text-amber-500",
      btn: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    success: {
      bg: isDark ? "bg-teal-500/10" : "bg-teal-50",
      icon: "text-teal-500",
      btn: "bg-teal-600 hover:bg-teal-700 text-white",
    },
  }[config.variant];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
          }`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${vs.bg}`}
        >
          <i className={`${config.iconClass} ${vs.icon}`} />
        </div>
        <h3
          className={`text-base font-semibold mb-1 ${isDark ? "text-white" : "text-slate-900"
            }`}
        >
          {config.title}
        </h3>
        <div
          className={`text-sm mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {config.message}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors border ${isDark
                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${vs.btn}`}
          >
            {loading ? (
              <i className="fa-solid fa-circle-notch animate-spin" />
            ) : (
              config.confirmLabel
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
