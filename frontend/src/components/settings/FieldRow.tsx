interface FieldRowProps {
  label: string;
  value: string;
  placeholder?: string;
  editing: boolean;
  isDark: boolean;
  type?: string;
  readOnly?: boolean;
  onChange?: (v: string) => void;
}

export function FieldRow({
  label,
  value,
  placeholder,
  editing,
  isDark,
  type = "text",
  readOnly = false,
  onChange,
}: FieldRowProps) {
  const disabled = !editing || readOnly;
  return (
    <div>
      <label
        className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-500" : "text-slate-400"
          }`}
      >
        {label}
        {readOnly && (
          <span
            className={`ml-2 font-normal normal-case tracking-normal text-[10px] ${isDark ? "text-slate-600" : "text-slate-400"
              }`}
          >
            (cannot be changed)
          </span>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full rounded-xl px-3.5 py-2.5 text-sm border outline-none transition-all ${disabled
            ? isDark
              ? "bg-slate-800/60 border-slate-700/60 text-slate-400 cursor-default"
              : "bg-slate-50 border-slate-200 text-slate-500 cursor-default"
            : isDark
              ? "bg-slate-800 border-slate-600 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
              : "bg-white border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
          }`}
      />
    </div>
  );
}
