import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useSidebar } from "../contexts/SidebarContext";
import ThemeToggler from "./ThemeToggler";


function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { toggleOpen } = useSidebar();

  const isDark = theme === "dark";

  const userInitials = user
    ? `${user.firstname?.[0] ?? ""}${user.lastname?.[0] ?? ""}`.toUpperCase()
    : "??";

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b transition-colors duration-300
        ${isDark
          ? "bg-slate-950/85 border-slate-800 backdrop-blur-md"
          : "bg-white/85 border-slate-200 backdrop-blur-md"
        }
      `}
    >
      {/* ── Left: Sidebar toggle (mobile)  */}
      <button
        onClick={toggleOpen}
        className={`md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200
          ${isDark
            ? "text-slate-400 hover:text-white hover:bg-slate-800"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        aria-label="Open sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M2 3.75A.75.75 0 0 1 2.75 3h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75ZM2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Zm0 4.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* ── Center/Left: Page context on desktop ──────────── */}
      <div className="hidden md:flex items-center gap-2">
        <span className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          <i className="fa-solid fa-calendar-days mr-1.5 text-xs opacity-70" />
          {dateStr}
        </span>
      </div>

      {/* ── Right: Actions ─ */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <button
          className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200
            ${isDark
              ? "text-slate-400 hover:text-white hover:bg-slate-800"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          aria-label="Notifications"
        >
          <i className="fa-regular fa-bell text-[15px]" />
          {/* Notification badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Theme toggler */}
        <ThemeToggler theme={theme} onToggle={toggleTheme} />

        {/* Divider */}
        <div className={`h-6 w-px mx-1 ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />

        {/* User avatar + name */}
        <div
          className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer transition-colors duration-200
            ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
        >
          <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{userInitials}</span>
            )}
          </div>
          <span
            className={`hidden sm:block text-sm font-medium max-w-30 truncate ${isDark ? "text-slate-200" : "text-slate-700"
              }`}
          >
            {user?.firstname} {user?.lastname}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
