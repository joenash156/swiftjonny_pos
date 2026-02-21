interface POSFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  disabled: boolean;
  isDark: boolean;
  hint?: string;
  onChange?: (v: string) => void;
}

export function POSField({
  label,
  value,
  placeholder,
  type = "text",
  disabled,
  isDark,
  hint,
  onChange,
}: POSFieldProps) {
  const inputClass = `w-full rounded-xl px-3.5 py-2.5 text-sm border outline-none transition-all ${disabled
      ? isDark
        ? "bg-slate-800/60 border-slate-700/60 text-slate-400 cursor-default"
        : "bg-slate-50 border-slate-200 text-slate-500 cursor-default"
      : isDark
        ? "bg-slate-800 border-slate-600 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
        : "bg-white border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
    }`;

  return (
    <div>
      <label
        className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-500" : "text-slate-400"
          }`}
      >
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
      {hint && (
        <p className={`text-xs mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
