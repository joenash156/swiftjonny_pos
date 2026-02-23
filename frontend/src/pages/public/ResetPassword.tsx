import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import ThemeToggler from "../../components/ThemeToggler";
import api from "../../services/api";
import { AxiosError } from "axios";

export default function ResetPassword() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Auto-redirect to login after success
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => navigate("/login"), 4000);
    return () => clearTimeout(t);
  }, [success, navigate]);

  const passwordStrength = (p: string) => {
    if (p.length === 0) return null;
    const score = [p.length >= 8, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
    if (score <= 1) return { label: "Weak", color: "bg-red-500", textColor: isDark ? "text-red-400" : "text-red-600" };
    if (score === 2) return { label: "Fair", color: "bg-amber-500", textColor: isDark ? "text-amber-400" : "text-amber-600" };
    if (score === 3) return { label: "Good", color: "bg-blue-500", textColor: isDark ? "text-blue-400" : "text-blue-600" };
    return { label: "Strong", color: "bg-teal-500", textColor: isDark ? "text-teal-400" : "text-teal-600" };
  };

  const strength = passwordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    if (newPassword.length < 8) {
      setFieldError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/users/reset_password?token=${encodeURIComponent(token)}`, {
        new_password: newPassword,
      });
      setSuccess(true);
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      setError(axiosErr.response?.data?.error ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // No token and email in URL — invalid link
  if (!token || !email) {
    return (
      <div
        className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark
            ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-900 text-white"
            : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/80 text-slate-900"
          }`}
      >
        <header
          className={`sticky top-0 z-30 border-b backdrop-blur-md px-5 h-14 flex items-center justify-between ${isDark ? "bg-slate-950/85 border-slate-800" : "bg-white/85 border-slate-200"
            }`}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-cash-register text-white text-xs" />
            </div>
            <span className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>SwiftJonny POS</span>
          </Link>
          <ThemeToggler theme={theme} onToggle={toggleTheme} />
        </header>
        <main className="flex-1 flex items-center justify-center px-5 py-12">
          <div className={`w-full max-w-md rounded-2xl border p-8 text-center ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-red-500/10" : "bg-red-50"}`}>
              <i className="fa-solid fa-link-slash text-red-500 text-lg" />
            </div>
            <h1 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Invalid reset link</h1>
            <p className={`text-sm mb-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              This link is missing required information. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
            >
              Request new link
            </Link>
          </div>
        </main>
      </div>
    );
  }

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
        <ThemeToggler theme={theme} onToggle={toggleTheme} />
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`w-full max-w-md rounded-2xl border p-8 ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-slate-100 border-slate-100"
            }`}
        >
          {/* Icon */}
          <div className={`w-12 h-12 text-center rounded-2xl flex items-center justify-center mx-auto mb-5 ${isDark ? "bg-teal-500/10" : "bg-teal-50"}`}>
            <i className="fa-solid fa-lock-open text-teal-500 text-lg" />
          </div>

          {!success ? (
            <>
              <h1 className={`text-xl text-center font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                Set a new password
              </h1>
              {email && (
                <p className={`text-center text-sm mb-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Resetting password for{" "}
                  <span className={`font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{email}</span>
                </p>
              )}
              {!email && (
                <p className={`text-sm text-center mb-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Choose a strong new password for your account.
                </p>
              )}

              {/* API error */}
              {error && (
                <div className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-start gap-2 ${isDark ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                  <i className="fa-solid fa-circle-exclamation mt-0.5 shrink-0" />
                  <span>
                    {error}{" "}
                    {error.toLowerCase().includes("expired") || error.toLowerCase().includes("invalid") ? (
                      <Link to="/forgot-password" className={`underline font-medium ${isDark ? "text-red-300" : "text-red-700"}`}>
                        Request a new link
                      </Link>
                    ) : null}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="new-password" className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    New password
                  </label>
                  <div className="relative">
                    <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      <i className="fa-solid fa-lock" />
                    </span>
                    <input
                      id="new-password"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      required
                      className={`w-full h-11 pl-10 pr-11 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${isDark
                          ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-400 focus:ring-teal-400/20"
                          : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-sm transition-colors ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      <i className={`fa-regular ${showNew ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>

                  {/* Strength bar */}
                  {newPassword && strength && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {["Weak", "Fair", "Good", "Strong"].map((level, idx) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${["Weak", "Fair", "Good", "Strong"].indexOf(strength.label) >= idx
                                ? strength.color
                                : isDark ? "bg-slate-700" : "bg-slate-200"
                              }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${strength.textColor}`}>{strength.label} password</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="confirm-password" className={`block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Confirm password
                  </label>
                  <div className="relative">
                    <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      <i className="fa-solid fa-lock" />
                    </span>
                    <input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className={`w-full h-11 pl-10 pr-11 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${isDark
                          ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-400 focus:ring-teal-400/20"
                          : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20"
                        } ${confirmPassword && newPassword !== confirmPassword ? (isDark ? "border-red-500/60" : "border-red-400") : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-sm transition-colors ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      <i className={`fa-regular ${showConfirm ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className={`text-xs mt-1 ${isDark ? "text-red-400" : "text-red-500"}`}>Passwords do not match</p>
                  )}
                </div>

                {/* Field error */}
                {fieldError && (
                  <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
                    <i className="fa-solid fa-circle-exclamation mr-1.5" />
                    {fieldError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-circle-notch animate-spin text-xs" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check text-xs" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-teal-500/10" : "bg-teal-50"}`}>
                <i className="fa-solid fa-circle-check text-teal-500 text-xl" />
              </div>
              <h2 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                Password reset!
              </h2>
              <p className={`text-sm leading-relaxed mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Your password has been updated successfully. A confirmation email has been sent to your inbox.
              </p>
              <p className={`text-xs mb-6 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                Redirecting you to login in a moment...
              </p>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
              >
                <i className="fa-solid fa-arrow-right-to-bracket text-xs" />
                Sign In Now
              </Link>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
