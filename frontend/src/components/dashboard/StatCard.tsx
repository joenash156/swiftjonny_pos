interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  sub: string;
  subUp: boolean;
  isDark: boolean;
  loading: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  iconColor,
  iconBg,
  sub,
  subUp,
  isDark,
  loading,
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 border transition-colors duration-300 ${isDark
          ? "bg-slate-900/70 border-slate-800 hover:bg-slate-800/80"
          : "bg-white/80 border-slate-200/80 hover:bg-white"
        }`}
    >
      <div className="flex items-start justify-between mb-4">
        <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {label}
        </p>
        <span className={`flex items-center justify-center w-9 h-9 rounded-xl ${iconBg}`}>
          <i className={`${icon} text-sm ${iconColor}`} />
        </span>
      </div>
      {loading ? (
        <div
          className={`h-8 w-24 rounded-lg animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"
            }`}
        />
      ) : (
        <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          {value}
        </p>
      )}
      {loading ? (
        <div
          className={`h-4 w-20 rounded mt-1.5 animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"
            }`}
        />
      ) : (
        <p
          className={`text-xs mt-1.5 font-medium ${subUp
              ? isDark
                ? "text-teal-400"
                : "text-teal-600"
              : "text-red-400"
            }`}
        >
          <i
            className={`fa-solid ${subUp ? "fa-arrow-trend-up" : "fa-arrow-trend-down"
              } mr-1 text-[10px]`}
          />
          {sub}
        </p>
      )}
    </div>
  );
}
