import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useSidebar } from "../contexts/SidebarContext";
import Logo from "../assets/logo.png";
import { useState } from "react";

interface NavItem {
  label: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: "fa-solid fa-gauge" },
  { label: "POS Terminal", path: "/pos", icon: "fa-solid fa-cash-register" },
  { label: "Sales / Transactions", path: "/sales", icon: "fa-solid fa-receipt" },
  { label: "Products", path: "/products", icon: "fa-solid fa-box" },
  { label: "Categories", path: "/categories", icon: "fa-solid fa-tags" },
  { label: "Inventory", path: "/inventory", icon: "fa-solid fa-warehouse", adminOnly: true },
  { label: "POS Settings", path: "/pos-settings", icon: "fa-solid fa-sliders" },
  { label: "Cashiers", path: "/cashiers", icon: "fa-solid fa-users", adminOnly: true },
  { label: "Analytics", path: "/analytics", icon: "fa-solid fa-chart-bar" },
  { label: "Settings", path: "/settings", icon: "fa-solid fa-gear" },
];

function SidebarContent() {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const { isCollapsed, toggleCollapsed, closeSidebar } = useSidebar();
  const [avatarErrorUrl, setAvatarErrorUrl] = useState<string | null>(null);
  const location = useLocation();

  const isDark = theme === "dark";

  // console.log(user)

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const gradientClass = isDark
    ? "bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900"
    : "bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900";

  const userInitials = user
    ? `${user.firstname?.[0] ?? ""}${user.lastname?.[0] ?? ""}`.toUpperCase()
    : "Guest";

  // console.log(userInitials)

  return (
    <div
      className={`flex flex-col h-full ${gradientClass} transition-all duration-300 ease-in-out overflow-hidden hide-scrollbar`}
      style={{ width: isCollapsed ? 70 : 260 }}
    >
      {/* Top: Logo + Collapse Toggle */}
      <div className="flex items-center justify-between px-4 pt-1 pb-2 shrink-0">
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <img src={Logo} alt="SwiftJonny" className="h-24 w-auto object-contain shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 shrink-0"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i className={`fa-solid ${isCollapsed ? "fa-chevron-right" : "fa-chevron-left"} text-xs`}></i>
        </button>
      </div>

      {/* User Info*/}
      <div
        className={`mx-3 mb-4 rounded-xl p-3 shrink-0 transition-all duration-300 ${isDark ? "bg-white/5" : "bg-white/10"
          } ${isCollapsed ? "flex justify-center" : ""}`}
      >
        {/* Avatar */}
        <div
          className={`${isCollapsed ? "" : "flex items-center gap-3"
            }`}
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.avatar_url && user.avatar_url !== avatarErrorUrl ? (
              <img
                src={user.avatar_url}
                alt="avatar"
                className="w-full h-full rounded-full object-cover"
                onError={() => setAvatarErrorUrl(user.avatar_url ?? null)}
              />
            ) : (
              <span>{userInitials}</span>
            )}
          </div>

          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden min-w-0"
              >
                <p className="text-white text-sm font-semibold truncate leading-tight">
                  {user?.firstname} {user?.lastname}
                </p>
                <p className="text-white/60 text-xs truncate leading-tight mt-0.5">
                  {user?.email}
                </p>
                <span
                  className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${user?.role === "admin"
                    ? "bg-amber-400/20 text-amber-300"
                    : "bg-white/10 text-white/70"
                    }`}
                >
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Cashier"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/*  Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pt-2 pb-4 hide-scrollbar">
        {navItems
          .filter((item) => !item.adminOnly || user?.role === "admin")
          .map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl transition-all duration-200 group
                ${isCollapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}
                ${isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <i
                  className={`${item.icon} text-[15px] shrink-0 transition-transform duration-200
                  ${isActive ? "text-white" : "text-white/70 group-hover:text-white"}
                  ${!isCollapsed ? "" : "mx-auto"}`}
                />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      key={`label-${item.path}`}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
      </nav>

      {/*  Bottom: Logout  */}
      <div className="px-3 pb-5 shrink-0">
        <div className={`border-t ${isDark ? "border-white/10" : "border-white/20"} pt-3`}>
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 rounded-xl text-white/70 hover:bg-red-500/30 hover:text-red-300 transition-all duration-200
              ${isCollapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}`}
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-[15px] shrink-0" />
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.span
                  key="logout-label"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm font-medium"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const { isOpen, closeSidebar, isCollapsed } = useSidebar();

  return (
    <>
      {/*  Mobile Overlay  */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed backdrop-blur-xs inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/*  Mobile Sidebar (slide in/out)  */}
      <motion.div
        key="mobile-sidebar"
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full z-50 md:hidden"
        style={{ width: 270 }}
      >
        <SidebarContent />
      </motion.div>

      {/*  Desktop Sidebar (inline, collapsible) ─ */}
      <motion.div
        key="desktop-sidebar"
        animate={{ width: isCollapsed ? 70 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col h-screen shrink-0 sticky top-0"
      >
        <SidebarContent />
      </motion.div>
    </>
  );
}

export default Sidebar;
