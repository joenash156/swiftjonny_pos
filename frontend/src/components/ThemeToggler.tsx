type Theme = "light" | "dark";

function ThemeToggler({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const isDark = theme === "dark";

  return (
    <button
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`
        relative w-13 h-6 rounded-full
        transition-all duration-500 ease-out
        cursor-pointer
        ${isDark
          ? "bg-linear-to-r from-purple-900 to-indigo-900 shadow-[inset_0_1px_4px_rgba(0,0,0,0.4),0_0_12px_rgba(168,85,247,0.15)]"
          : "bg-lime-500 shadow-[inset_0_1px_4px_rgba(0,0,0,0.1),0_1px_4px_rgba(0,0,0,0.08)]"
        }
      `}
    >
      {/* Stars (dark mode) */}
      <span
        className={`
          absolute top-1.5 left-2 text-[6px] text-lime-200
          transition-all duration-500
          ${isDark ? "opacity-100 scale-100" : "opacity-0 scale-50"}
        `}
      >
        <i className="fa-solid fa-sparkles"></i>
      </span>
      <span
        className={`
          absolute bottom-1.5 left-3 text-[5px] text-purple-300
          transition-all duration-500 delay-100
          ${isDark ? "opacity-70 scale-100" : "opacity-0 scale-50"}
        `}
      >
        <i className="fa-solid fa-star animate-pulse"></i>
      </span>

      {/* Toggle knob */}
      <span
        className={`
          absolute top-0.5 w-5 h-5 rounded-full
          flex items-center justify-center
          transition-all duration-500 ease-out
          ${isDark
            ? "left-[calc(100%-1.4rem)] bg-linear-to-br from-slate-700 to-slate-900 shadow-[0_0_8px_rgba(168,85,247,0.3)]"
            : "left-0.5 bg-slate-500 shadow-[0_1px_6px_rgba(132,204,22,0.4)]"
          }
        `}
      >
        <i
          className={`
            fa-solid text-[10px]
            transition-all duration-500
            ${isDark ? "fa-moon text-purple-300 rotate-0" : "fa-sun text-yellow-500 rotate-180"}
          `}
        ></i>
      </span>
    </button>
  );
}

export default ThemeToggler;