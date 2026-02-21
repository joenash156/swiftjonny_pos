interface PwFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  isDark: boolean;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
}

export function PwField({
  label,
  value,
  placeholder,
  isDark,
  onChange,
  show,
  onToggleShow,
}: PwFieldProps) {
  return (
    <div>
      <label
        className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-500" : "text-slate-400"
          }`}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          className={`w-full rounded-xl px-3.5 py-2.5 pr-10 text-sm border outline-none transition-all ${isDark
              ? "bg-slate-800 border-slate-600 text-white placeholder-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
              : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
            }`}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm transition-colors ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
            }`}
          tabIndex={-1}
        >
          <i className={`fa-solid ${show ? "fa-eye-slash" : "fa-eye"}`} />
        </button>
      </div>
    </div>
  );
}
