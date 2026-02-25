import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import ThemeToggler from "../../components/ThemeToggler";
import api from "../../services/api";
import { AxiosError } from "axios";

export default function ForgotPassword() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Forgot Password | SwiftJonny POS";
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/api/user/forgot_password", { email });
      setSent(true);
      setEmail("");
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      setError(axiosErr.response?.data?.error ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark
        ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-900 text-white"
        : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/80 text-slate-900"
        }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-md px-5 h-14 flex items-center justify-between ${isDark ? "bg-slate-950/85 border-slate-800" : "bg-white/85 border-slate-200"
          }`}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-cash-register text-white text-xs" />
          </div>
          <span className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            SwiftJonny POS
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggler theme={theme} onToggle={toggleTheme} />
          <Link
            to="/login"
            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isDark
              ? "border-slate-700 text-slate-300 hover:bg-slate-800"
              : "border-slate-200 text-slate-600 hover:bg-white"
              }`}
          >
            <i className="fa-solid fa-arrow-left text-[10px] group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back to Login
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-1 md:px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`w-full max-w-md rounded-2xl border p-8 ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-slate-100 border-slate-100"
            }`}
        >
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 mx-auto ${isDark ? "bg-teal-500/10" : "bg-teal-50"
              }`}
          >
            <i className="fa-solid fa-key text-teal-500 text-lg" />
          </div>

          {!sent ? (
            <>
              <h1 className={`text-xl font-bold text-center mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                Forgot your password?
              </h1>
              <p className={`text-sm text-center mb-6 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Enter the email address linked to your account and we'll send you a reset link.
              </p>

              {/* Error */}
              {error && (
                <div className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${isDark ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                  <i className="fa-solid fa-circle-exclamation shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      <i className="fa-regular fa-envelope" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className={`w-full h-11 pl-10 pr-4 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${isDark
                        ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-400 focus:ring-teal-400/20"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20"
                        }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-circle-notch animate-spin text-xs" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane text-xs" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <p className={`mt-5 text-center text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                Remembered it?{" "}
                <Link
                  to="/login"
                  className={`font-medium transition-colors ${isDark ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-700"}`}
                >
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`w-10 mx-auto text-center h-10 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-teal-500/10" : "bg-teal-50"}`}>
                <i className="fa-solid fa-circle-check text-teal-500 text-lg" />
              </div>
              <h2 className={`text-lg mx-auto text-center font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                Check your inbox
              </h2>
              <p className={`text-sm mx-auto text-center leading-relaxed mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                If <span className={`font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{email}</span> is
                registered, you'll receive a password reset link shortly. The link expires in 15 minutes.
              </p>
              <p className={`text-xs mx-auto text-center mb-5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Didn't receive it? Check your spam folder, or{" "}
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className={`font-medium transition-colors ${isDark ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-700"}`}
                >
                  try again
                </button>
                .
              </p>
              <Link
                to="/login"
                className={`flex items-center justify-center gap-2 w-full h-11 rounded-xl border text-sm font-medium transition-colors ${isDark
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <i className="fa-solid fa-arrow-left text-xs" />
                Back to Login
              </Link>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
