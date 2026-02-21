interface StatusBadgeProps {
  approved: boolean;
  isDark: boolean;
}

export function StatusBadge({ approved, isDark }: StatusBadgeProps) {
  return approved ? (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isDark
          ? "bg-teal-500/10 text-teal-300 border border-teal-500/20"
          : "bg-teal-50 text-teal-700 border border-teal-200"
        }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
      Active
    </span>
  ) : (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isDark
          ? "bg-slate-700 text-slate-400 border border-slate-600"
          : "bg-slate-100 text-slate-500 border border-slate-200"
        }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Pending
    </span>
  );
}
