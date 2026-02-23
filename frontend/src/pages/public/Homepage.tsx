import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import ThemeToggler from "../../components/ThemeToggler";

const FEATURES = [
  {
    icon: "fa-solid fa-cash-register",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    title: "Fast Point of Sale",
    desc: "Process transactions in seconds with a clean, distraction-free interface built for speed.",
  },
  {
    icon: "fa-solid fa-chart-line",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    title: "Real-time Analytics",
    desc: "Understand your sales trends, top products, and cashier performance at a glance.",
  },
  {
    icon: "fa-solid fa-boxes-stacked",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    title: "Inventory Control",
    desc: "Track stock levels automatically with every sale and get notified on low inventory.",
  },
];

export default function Homepage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const isLoggedIn = !!user;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark
          ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-900 text-white"
          : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/80 text-slate-900"
        }`}
    >
      {/* ── Header ── */}
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-md px-5 h-14 flex items-center justify-between ${isDark
            ? "bg-slate-950/85 border-slate-800"
            : "bg-white/85 border-slate-200"
          }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-cash-register text-white text-xs" />
          </div>
          <span
            className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"
              }`}
          >
            SwiftJonny POS
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggler theme={theme} onToggle={toggleTheme} />
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors"
            >
              <i className="fa-solid fa-gauge text-[10px]" />
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors"
            >
              <i className="fa-solid fa-arrow-right-to-bracket text-[10px]" />
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="max-w-3xl mx-auto px-5 pt-20 pb-16 text-center"
        >
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border ${isDark
                ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                : "bg-teal-50 text-teal-600 border-teal-200"
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Built for modern retail
          </div>

          {/* Heading */}
          <h1
            className={`text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4 ${isDark ? "text-white" : "text-slate-900"
              }`}
          >
            The smart POS for{" "}
            <span className="text-teal-500">growing businesses</span>
          </h1>

          {/* Subheading */}
          <p
            className={`text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10 ${isDark ? "text-slate-400" : "text-slate-500"
              }`}
          >
            Manage sales, inventory, and team performance, all from one clean,
            fast dashboard.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold transition-colors"
                >
                  <i className="fa-solid fa-gauge text-xs" />
                  Open Dashboard
                </Link>
                <Link
                  to="/help"
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border text-sm font-medium transition-colors ${isDark
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                >
                  <i className="fa-solid fa-headset text-xs" />
                  Help & Support
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold transition-colors"
                >
                  <i className="fa-solid fa-rocket text-xs" />
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border text-sm font-medium transition-colors ${isDark
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                >
                  <i className="fa-solid fa-arrow-right-to-bracket text-xs" />
                  Sign In
                </Link>
              </>
            )}
          </div>
        </motion.section>

        {/* ── Features ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12, ease: "easeOut" }}
          className="max-w-4xl mx-auto px-5 pb-20"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`rounded-2xl border p-5 transition-colors ${isDark
                    ? "bg-slate-900/60 border-slate-800"
                    : "bg-white/70 border-slate-200"
                  }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.bg}`}
                >
                  <i className={`${f.icon} ${f.color} text-base`} />
                </div>
                <p
                  className={`text-sm font-semibold mb-1.5 ${isDark ? "text-white" : "text-slate-900"
                    }`}
                >
                  {f.title}
                </p>
                <p
                  className={`text-xs leading-relaxed ${isDark ? "text-slate-500" : "text-slate-500"
                    }`}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.section>
      </main>

      {/* ── Footer ── */}
      <footer
        className={`border-t px-5 py-5 text-center text-xs ${isDark
            ? "border-slate-800 text-slate-600"
            : "border-slate-200 text-slate-400"
          }`}
      >
        © {new Date().getFullYear()} SwiftJonny POS. All rights reserved.
      </footer>
    </div>
  );
}
