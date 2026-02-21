interface InfoRowProps {
  label: string;
  value: string;
  isDark: boolean;
}

export function InfoRow({ label, value, isDark }: InfoRowProps) {
  return (
    <div
      className={`flex items-center justify-between py-3 border-b last:border-0 ${isDark ? "border-slate-800" : "border-slate-100"
        }`}
    >
      <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        {label}
      </span>
      <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
        {value}
      </span>
    </div>
  );
}
