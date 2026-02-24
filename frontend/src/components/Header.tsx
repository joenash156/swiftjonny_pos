import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useSidebar } from "../contexts/SidebarContext";
import ThemeToggler from "./ThemeToggler";
import { useThemeSync } from "../hooks/useThemeSync";

function Header() {
  const { theme, toggleTheme } = useThemeSync();
  const { user, logout } = useAuth();
  const { toggleOpen } = useSidebar();
  // const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarErrorUrl, setAvatarErrorUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    window.location.href = "/login";
  };

  const isDark = theme === "dark";

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Cashier";

  const roleBadgeClass =
    user?.role === "admin"
      ? isDark
        ? "bg-amber-400/15 text-amber-300 border border-amber-400/20"
        : "bg-amber-50 text-amber-600 border border-amber-200"
      : isDark
        ? "bg-teal-400/10 text-teal-300 border border-teal-400/20"
        : "bg-teal-50 text-teal-600 border border-teal-200";

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

        {/* ── User menu button + dropdown ───────────────── */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-200 ${isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"
              } ${menuOpen ? (isDark ? "bg-slate-800" : "bg-slate-100") : ""}`}
            aria-label="User menu"
          >
            <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
              {user?.avatar_url && user.avatar_url !== avatarErrorUrl ? (
                <img
                  src={user.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarErrorUrl(user.avatar_url ?? null)}
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
            <i
              className={`fa-solid fa-chevron-down text-[10px] hidden sm:block transition-transform duration-200 ${isDark ? "text-slate-500" : "text-slate-400"
                } ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={`absolute right-0 top-full mt-2 w-64 rounded-2xl border shadow-xl z-50 overflow-hidden ${isDark
                  ? "bg-slate-900 border-slate-700 shadow-black/40"
                  : "bg-white border-slate-200 shadow-slate-200/60"
                  }`}
              >
                {/* User info block */}
                <div className={`px-4 py-4 border-b ${isDark ? "border-slate-700/60" : "border-slate-100"
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                      {user?.avatar_url && user.avatar_url !== avatarErrorUrl ? (
                        <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{userInitials}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-900"
                        }`}>
                        {user?.firstname} {user?.lastname}
                      </p>
                      <p className={`text-xs truncate mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"
                        }`}>
                        {user?.email}
                      </p>
                      <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleBadgeClass}`}>
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nav links */}
                <div className="py-1.5">
                  {[
                    { icon: "fa-solid fa-user", label: "My Profile", to: "/settings" },
                    // { icon: "fa-solid fa-shield-halved",   label: "Account & Security", to: "/settings/security" },
                    { icon: "fa-solid fa-home",            label: "Home",           to: "/" },
                    { icon: "fa-solid fa-circle-question", label: "Help & Support", to: "/help" },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${isDark
                        ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      <i className={`${item.icon} w-4 text-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"
                        }`} />
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Logout */}
                <div className={`border-t py-1.5 ${isDark ? "border-slate-700/60" : "border-slate-100"
                  }`}>
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${isDark
                      ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      : "text-red-500 hover:bg-red-50 hover:text-red-600"
                      }`}
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center text-xs" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default Header;
