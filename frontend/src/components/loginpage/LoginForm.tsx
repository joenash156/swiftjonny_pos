import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import ThemeToggler from "../ThemeToggler";
import Swal from "sweetalert2";
import type { SweetAlertIcon } from "sweetalert2";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";

interface FormData {
  email: string;
  password: string;
}

function LoginForm() {
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loading } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await login(formData);

      let title = "Login Failed!";
      let icon: SweetAlertIcon = "error";

      const isEmailNotVerified =
        response.is_email_verified !== undefined &&
        (response.is_email_verified === false || response.is_email_verified === 0);
      const isNotApproved =
        response.is_approved !== undefined &&
        (response.is_approved === false || response.is_approved === 0);

      if (response.success) {
        // Fully successful login
        title = "Login Successful!";
        icon = "success";
      } else if (isEmailNotVerified) {
        // Credentials correct but email not verified – treat as a successful login step
        title = "Verify Your Email";
        icon = "success";
      } else if (isNotApproved) {
        // Credentials correct but account pending approval
        title = "Approval Required";
        icon = "info";
      }

      const msg = response.success
        ? response.message
        : response.error;

      await Swal.fire({
        icon,
        title,
        html: `<p class="text-[14px]">${msg}</p>`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: response.success ? 2000 : 3000,
        background: theme === "dark" ? "#1f2937" : "#ffffff",
        color: theme === "dark" ? "#f9fafb" : "#111827",
        customClass: {
          popup: "rounded-2xl shadow-2xl",
          title: "font-semibold",
          htmlContainer: "text-[14px]",
        },
      });

      if (response.success) {
        setFormData({
          email: "",
          password: "",
        });
        navigate("/dashboard");
        return;
      }

      if (isEmailNotVerified) {
        const userEmail = formData.email;
        // Store in localStorage for persistence across page reloads
        localStorage.setItem("pending_verification_email", userEmail);

        setFormData({
          email: "",
          password: "",
        });
        navigate("/verify-email", { state: { email: userEmail } });
        return;
      }

      if (isNotApproved) {
        setFormData({
          email: "",
          password: "",
        });
        navigate("/approval-pending");
        return;
      }

      // Other login failure (wrong credentials etc.)
      // Stay on login page

    } catch (error) {
      console.error("Unexpected error in logging in:", error);
    }
  };


  return (
    <div
      className={`w-full h-screen lg:h-full flex flex-col px-6 sm:px-10 lg:px-12 xl:px-16 py-8 lg:py-10 overflow-y-auto hide-scrollbar transition-[background] duration-300 ease-in-out ${theme === "dark"
        ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-950"
        : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/40"
        }`}
    >
      <div>
        {/* Theme Toggler */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-end mb-6"
        >
          <ThemeToggler theme={theme} onToggle={toggleTheme} />
        </motion.div>
      </div>


      {/* Form Container */}
      <div className="flex-1 flex flex-col lg:justify-center max-w-md mx-auto w-full pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className={`font-bold text-2xl sm:text-3xl ${theme === "dark" ? "text-white" : "text-slate-800"} mb-2`}>
            Welcome Back
          </h1>
          <p className={`${theme === "dark" ? "text-slate-400" : "text-slate-500"} text-sm sm:text-base`}>
            Enter your credentials to access your account
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className={`block font-medium text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}
            >
              Email
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                <i className="fa-regular fa-envelope"></i>
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={`w-full h-12 pl-11 pr-4 ${theme === "dark" ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400"} border rounded-xl text-sm focus:outline-none focus:ring-2 ${theme === "dark" ? "focus:ring-teal-400/30 focus:border-teal-400" : "focus:ring-teal-500/30 focus:border-teal-500"} transition-all duration-200`}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className={`block font-medium text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}
            >
              Password
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                <i className="fa-solid fa-lock"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={`w-full h-12 pl-11 pr-12 ${theme === "dark" ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400"} border rounded-xl text-sm focus:outline-none focus:ring-2 ${theme === "dark" ? "focus:ring-teal-400/30 focus:border-teal-400" : "focus:ring-teal-500/30 focus:border-teal-500"} transition-all duration-200`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme === "dark" ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"} transition-colors duration-200`}
              >
                <i
                  className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                ></i>
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            {/* Remember Me Toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-10 h-5 rounded-full transition-colors duration-300 ${rememberMe
                    ? "bg-teal-500"
                    : theme === "dark" ? "bg-slate-700" : "bg-slate-300"
                    }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${rememberMe ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </div>
              </div>
              <span className={`text-sm ${theme === "dark" ? "text-slate-400 group-hover:text-slate-200" : "text-slate-600 group-hover:text-slate-800"} transition-colors`}>
                Remember me
              </span>
            </label>

            {/* Forgot Password */}
            <Link
              to="/forgot-password"
              className={`text-sm font-medium ${theme === "dark" ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"} transition-colors duration-200`}
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <motion.button
            type="submit"
            //whileHover={{ scale: 1.01 }}
            disabled={loading}
            //whileTap={{ scale: 0.99 }}
            className={`group w-full h-11 ${theme === "dark" ? "bg-teal-600 hover:bg-teal-700" : "bg-teal-500 hover:bg-teal-600"} text-white font-semibold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer`}
          >
            {loading ? (
              <TailSpin
                height="20"
                width="20"
                color="#FFFFFF"
                ariaLabel="tail-spin-loading"
                radius="1" visible={true}
              />
            ) : (
              <>
                <span>Sign In</span>
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform duration-200"></i>
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className={`flex-1 h-px ${theme === "dark" ? "bg-slate-700" : "bg-slate-200"}`} />
            <span className={`text-xs ${theme === "dark" ? "text-slate-500" : "text-slate-400"} uppercase tracking-wider`}>
              Or continue with
            </span>
            <div className={`flex-1 h-px ${theme === "dark" ? "bg-slate-700" : "bg-slate-200"}`} />
          </div>

          {/* Social Login */}
          <div className="flex gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 h-11 ${theme === "dark" ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600" : "bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-300"} border rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer`}
            >
              <i className="fa-brands fa-google text-red-500"></i>
              <span className="">Google</span>
            </motion.button>
          </div>

          {/* Sign Up Link */}
          <p className={`text-center text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"} pt-2`}>
            Don't have an account?{" "}
            <Link
              to="/register"
              className={`font-semibold ${theme === "dark" ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"} transition-colors duration-200`}
            >
              Create One
            </Link>
          </p>
        </motion.form>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className={`pt-6 border-t ${theme === "dark" ? "border-slate-800" : "border-slate-200"} mt-6`}
      >
        <div className={`flex flex-col items-center justify-between gap-2 text-xs ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
          <p>© 2026 SwiftJonny POS. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className={`${theme === "dark" ? "hover:text-slate-300" : "hover:text-slate-600"} transition-colors`}>
              Privacy Policy
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link to="/terms" className={`${theme === "dark" ? "hover:text-slate-300" : "hover:text-slate-600"} transition-colors`}>
              Terms of Service
            </Link>
            <span className="hidden sm:inline">•</span>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`text-center text-xs ${theme === "dark" ? "text-slate-500" : "text-slate-500"
                }`}
            >
              <Link
                to="/help"
                className={`${theme === "dark" ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-700"
                  } transition-colors duration-200`}
              >
                Help & Support
              </Link>
            </motion.p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default LoginForm;