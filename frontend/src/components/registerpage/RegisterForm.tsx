import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import ThemeToggler from "../ThemeToggler";
import type { FormData, PasswordRequirement } from "../../types/types";
import { useAuth } from "../../contexts/AuthContext";
import { TailSpin } from "react-loader-spinner";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function RegisterForm() {
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    firstname: "",
    lastname: "",
    othername: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { loading, register } = useAuth();
  const navigate = useNavigate();

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
      const response = await register(formData);
      // console.log("Registration response:", response);

      // Pick the right message from the API response
      const msg = response.success ? response.message : response.error;

      await Swal.fire({
        icon: response.success ? "success" : "error",
        title: response.success ? "Registration Successful!" : "Registration Failed!",
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
          firstname: "",
          lastname: "",
          othername: "",
          email: "",
          password: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          navigate("/login");
        }, 1600);
      }
    } catch (error: unknown) {
      console.error("Unexpected error in form submit:", error);
    }
    // finally {
    //   setFormData({
    //     firstname: "",
    //     lastname: "",
    //     othername: "",
    //     email: "",
    //     password: "",
    //     confirmPassword: "",
    //   });
    // }
  };


  // Password validation requirements
  const passwordRequirements: PasswordRequirement[] = useMemo(() => {
    const password = formData.password;
    return [
      {
        label: "At least one uppercase letter",
        met: /[A-Z]/.test(password),
      },
      {
        label: "At least one lowercase letter",
        met: /[a-z]/.test(password),
      },
      {
        label: "At least one number",
        met: /[0-9]/.test(password),
      },
      {
        label: "At least 8 characters",
        met: password.length >= 8,
      },
      {
        label: "At least one special character",
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      }
    ];
  }, [formData.password]);

  return (
    <div
      className={`w-full h-screen lg:h-full flex flex-col px-6 sm:px-10 lg:px-12 xl:px-16 py-8 lg:py-10 overflow-y-auto hide-scrollbar transition-[background] duration-300 ease-in-out ${theme === "dark"
        ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-950"
        : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/40"
        }`}
    >
      {/* Theme Toggler */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-end mb-6"
      >
        <ThemeToggler theme={theme} onToggle={toggleTheme} />
      </motion.div>

      {/* Mobile Logo - Only visible on mobile */}
      {/* <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:hidden flex items-center gap-3 mb-8"
      >
        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg">
          <i className="fa-solid fa-bolt text-white text-lg"></i>
        </div>
        <span className={`${theme === "dark" ? "text-white" : "text-slate-800"} font-bold text-xl tracking-wide`}>
          SwiftJonny
        </span>
      </motion.div> */}

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
            Create Account
          </h1>
          <p className={`${theme === "dark" ? "text-slate-400" : "text-slate-500"} text-sm sm:text-base`}>
            Fill in your details to get started
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Name Fields - Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <label
                htmlFor="firstname"
                className={`block font-medium text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}
              >
                First Name
              </label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
                placeholder="John"
                className={`w-full h-11 px-4 ${theme === "dark" ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400"} border rounded-xl text-sm focus:outline-none focus:ring-2 ${theme === "dark" ? "focus:ring-teal-400/30 focus:border-teal-400" : "focus:ring-teal-500/30 focus:border-teal-500"} transition-all duration-200`}
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label
                htmlFor="lastname"
                className={`block font-medium text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                placeholder="Doe"
                className={`w-full h-11 px-4 ${theme === "dark" ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400"} border rounded-xl text-sm focus:outline-none focus:ring-2 ${theme === "dark" ? "focus:ring-teal-400/30 focus:border-teal-400" : "focus:ring-teal-500/30 focus:border-teal-500"} transition-all duration-200`}
                required
              />
            </div>
          </div>

          {/* Other Name (Optional) */}
          <div className="space-y-2">
            <label
              htmlFor="othername"
              className={`block font-medium text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}
            >
              Other Name <span className={`${theme === "dark" ? "text-slate-500" : "text-slate-400"} font-normal text-xs`}>(Optional)</span>
            </label>
            <input
              type="text"
              id="othername"
              name="othername"
              value={formData.othername || ""}
              onChange={handleInputChange}
              placeholder="Other name / Middle name"
              className={`w-full h-11 px-4 ${theme === "dark" ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400"} border rounded-xl text-sm focus:outline-none focus:ring-2 ${theme === "dark" ? "focus:ring-teal-400/30 focus:border-teal-400" : "focus:ring-teal-500/30 focus:border-teal-500"} transition-all duration-200`}
            />
          </div>

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
                className={`w-full h-11 pl-11 pr-4 ${theme === "dark" ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400"} border rounded-xl text-sm focus:outline-none focus:ring-2 ${theme === "dark" ? "focus:ring-teal-400/30 focus:border-teal-400" : "focus:ring-teal-500/30 focus:border-teal-500"} transition-all duration-200`}
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
                placeholder="Create a password"
                className={`w-full h-11 pl-11 pr-12 ${theme === "dark" ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400"} border rounded-xl text-sm focus:outline-none focus:ring-2 ${theme === "dark" ? "focus:ring-teal-400/30 focus:border-teal-400" : "focus:ring-teal-500/30 focus:border-teal-500"} transition-all duration-200`}
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

            {/* Password Requirements */}
            <div className={`mt-3 p-3 rounded-lg ${theme === "dark" ? "bg-slate-800/50" : "bg-slate-100/50"} space-y-1.5`}>
              {passwordRequirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className={`text-xs ${requirement.met ? "text-teal-500" : theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                    {requirement.met ? (
                      <i className="fa-solid fa-check"></i>
                    ) : (
                      <i className="fa-solid fa-xmark"></i>
                    )}
                  </span>
                  <span className={`text-xs ${requirement.met ? "text-teal-500" : theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    {requirement.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className={`block font-medium text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}
            >
              Confirm Password
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                <i className="fa-solid fa-lock"></i>
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter your password"
                className={`w-full h-11 pl-11 pr-12 ${theme === "dark" ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400"} border rounded-xl text-sm focus:outline-none focus:ring-2 ${theme === "dark" ? "focus:ring-teal-400/30 focus:border-teal-400" : "focus:ring-teal-500/30 focus:border-teal-500"} transition-all duration-200`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme === "dark" ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"} transition-colors duration-200`}
              >
                <i
                  className={`fa-regular ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                ></i>
              </button>
            </div>
          </div>

          {/* Create Account Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full h-11 ${theme === "dark" ? "bg-teal-600 hover:bg-teal-700" : "bg-teal-500 hover:bg-teal-600"} text-white font-semibold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-6`}
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
                <span>Create Account</span>
                <i className="fa-solid fa-user-plus transition-transform duration-200"></i>
              </>
            )}
          </motion.button>

          {/* Sign In Link */}
          <p className={`text-center text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"} pt-2`}>
            Already have an account?{" "}
            <Link
              to="/login"
              className={`font-semibold ${theme === "dark" ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"} transition-colors duration-200`}
            >
              Sign In
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

export default RegisterForm;