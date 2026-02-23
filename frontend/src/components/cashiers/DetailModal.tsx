import { motion } from "framer-motion";
import { formatDate } from "../../utils/formatDate";
import { StatusBadge } from "./StatusBadge";
import type { Cashier } from "../../services/adminService";

type PendingAction =
  | { type: "approve"; cashier: Cashier }
  | { type: "disable"; cashier: Cashier }
  | { type: "delete"; cashier: Cashier }
  | { type: "role"; cashier: Cashier; role: "admin" | "cashier" };

interface DetailModalProps {
  cashier: Cashier;
  isDark: boolean;
  onClose: () => void;
  onRequestAction: (action: PendingAction) => void;
}

function getInitials(c: Cashier) {
  return `${c.firstname?.[0] ?? ""}${c.lastname?.[0] ?? ""}`.toUpperCase();
}

export function DetailModal({
  cashier,
  isDark,
  onClose,
  onRequestAction,
}: DetailModalProps) {
  const isApproved = Boolean(cashier.is_approved);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
          }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-slate-700/60" : "border-slate-100"
            }`}
        >
          <h2
            className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"
              }`}
          >
            Cashier Details
          </h2>
          <button
            onClick={onClose}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDark
                ? "text-slate-500 hover:bg-slate-800 hover:text-white"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              }`}
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            {cashier.avatar_url ? (
              <img
                src={cashier.avatar_url}
                alt="Cashier avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {getInitials(cashier)}
              </div>
            )}
            <div>
              <p
                className={`font-semibold text-base ${isDark ? "text-white" : "text-slate-900"
                  }`}
              >
                {cashier.firstname} {cashier.othername ? `${cashier.othername} ` : ""}
                {cashier.lastname}
              </p>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {cashier.email}
              </p>
            </div>
          </div>

          {/* Info grid */}
          <div
            className={`grid grid-cols-2 gap-3 rounded-xl p-4 text-sm ${isDark ? "bg-slate-800/50" : "bg-slate-50"
              }`}
          >
            {[
              { label: "Phone", value: cashier.phone || "—" },
              { label: "Alt. Phone", value: cashier.other_phone || "—" },
              {
                label: "Status",
                value: <StatusBadge approved={isApproved} isDark={isDark} />,
              },
              { label: "Last Login", value: formatDate(cashier.last_login_at) },
              { label: "Member Since", value: formatDate(cashier.created_at) },
              {
                label: "Profile",
                value: cashier.is_profile_complete ? "Complete" : "Incomplete",
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <p
                  className={`text-[11px] font-medium uppercase tracking-wider mb-0.5 ${isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                >
                  {label}
                </p>
                <p
                  className={`${isDark ? "text-slate-200" : "text-slate-700"
                    } text-[12px] font-medium`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Role update */}
          <div>
            <label
              className={`text-xs font-medium uppercase tracking-wider block mb-2 ${isDark ? "text-slate-500" : "text-slate-400"
                }`}
            >
              Role
            </label>
            <select
              defaultValue={cashier.role}
              onChange={(e) => {
                const newRole = e.target.value as "admin" | "cashier";
                if (newRole !== cashier.role) {
                  onRequestAction({ type: "role", cashier, role: newRole });
                  e.target.value = cashier.role;
                }
              }}
              className={`w-full rounded-xl px-3 py-2 text-sm border transition-colors outline-none ${isDark
                  ? "bg-slate-800 border-slate-700 text-white focus:border-teal-500"
                  : "bg-white border-slate-200 text-slate-900 focus:border-teal-500"
                }`}
            >
              <option value="cashier">Cashier</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Footer actions */}
        <div
          className={`px-6 py-4 border-t flex flex-wrap gap-2 ${isDark ? "border-slate-700/60" : "border-slate-100"
            }`}
        >
          {isApproved ? (
            <button
              onClick={() => onRequestAction({ type: "disable", cashier })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium border transition-colors ${isDark
                  ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  : "border-amber-200 text-amber-600 hover:bg-amber-50"
                }`}
            >
              <i className="fa-solid fa-ban text-xs" />
              Disable
            </button>
          ) : (
            <button
              onClick={() => onRequestAction({ type: "approve", cashier })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium border transition-colors ${isDark
                  ? "border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                  : "border-teal-200 text-teal-600 hover:bg-teal-50"
                }`}
            >
              <i className="fa-solid fa-check text-xs" />
              Approve
            </button>
          )}
          <button
            onClick={() => onRequestAction({ type: "delete", cashier })}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium border transition-colors ${isDark
                ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                : "border-red-200 text-red-500 hover:bg-red-50"
              }`}
          >
            <i className="fa-solid fa-trash-can text-xs" />
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export type { PendingAction };
