import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import { TailSpin } from "react-loader-spinner";
import api from "../../services/api";
import Swal from "sweetalert2";
import type { SweetAlertIcon } from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";

function VerifyEmail() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);

  // Get email from navigation state or localStorage (for page reloads)
  const email = location.state?.email || localStorage.getItem("pending_verification_email") || null;

  // Start with a 45-second countdown on component mount
  useEffect(() => {
    setCountdown(45);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Redirect to login if no email provided
  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  // Cleanup localStorage when component unmounts (user leaves the page)
  useEffect(() => {
    return () => {
      // Only clear if navigating away from verify-email page
      if (!window.location.pathname.includes("/verify-email")) {
        localStorage.removeItem("pending_verification_email");
      }
    };
  }, []);

  // Don't render if no email (will redirect)
  if (!email) {
    return null;
  }

  const handleResendVerification = async () => {
    if (countdown > 0 || isSending) return;

    setIsSending(true);

    try {
      const response = await api.post("/api/user/resend-verification", { email });

      let title = "Email Sent!";
      let icon: SweetAlertIcon = "success";
      let message = response.data.message || "Verification email has been sent to your inbox.";

      if (!response.data.success) {
        title = "Failed";
        icon = "error";
        message = response.data.error || "Failed to send verification email.";
      }

      await Swal.fire({
        icon,
        title,
        html: `<p class="font-poppins text-[14px]">${message}</p>`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        background: theme === "dark" ? "#1f2937" : "#ffffff",
        color: theme === "dark" ? "#f9fafb" : "#111827",
        customClass: {
          popup: "rounded-2xl shadow-2xl",
          title: "font-semibold font-poppins",
          htmlContainer: "font-poppins text-[14px]",
        },
      });

      if (response.data.success) {
        setCountdown(45);
      }
    } catch (error) {
      console.error("Error resending verification:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        html: `<p class="font-poppins text-[14px]">An error occurred. Please try again later.</p>`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        background: theme === "dark" ? "#1f2937" : "#ffffff",
        color: theme === "dark" ? "#f9fafb" : "#111827",
        customClass: {
          popup: "rounded-2xl shadow-2xl",
          title: "font-semibold font-poppins",
          htmlContainer: "font-poppins text-[14px]",
        },
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleBackToLogin = () => {
    // Clear localStorage when going back to login
    localStorage.removeItem("pending_verification_email");
    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center ${theme === "dark" ? "bg-slate-900" : "bg-slate-50"
        } px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300`}
    >
      <div className="w-full max-w-2xl">
        {/* Logo */}
        {/* <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="w-12 h-12 bg-lime-500 rounded-xl flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-bolt text-white text-xl"></i>
          </div>
          <span
            className={`${theme === "dark" ? "text-white" : "text-slate-800"
              } font-poppins font-bold text-2xl tracking-wide`}
          >
            SwiftJonny
          </span>
        </motion.div> */}

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${theme === "dark"
            ? "bg-slate-800/20"
            : "bg-gray-100/50"
            } rounded p-6 sm:p-8`}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-20 h-20 rounded-full ${theme === "dark" ? "bg-slate-700" : "bg-slate-100"
                } flex items-center justify-center`}
            >
              <i
                className={`fa-regular fa-envelope text-4xl ${theme === "dark" ? "text-lime-400" : "text-lime-500"
                  }`}
              ></i>
            </div>
          </div>

          {/* Title */}
          <h1
            className={`font-poppins font-bold text-2xl sm:text-3xl text-center ${theme === "dark" ? "text-white" : "text-slate-800"
              } mb-3`}
          >
            Verify Your Email
          </h1>

          {/* Description */}
          <p
            className={`font-poppins text-center ${theme === "dark" ? "text-slate-400" : "text-slate-600"
              } text-sm sm:text-base mb-6 leading-relaxed`}
          >
            We've sent a verification link to{" "}
            <span className="font-semibold text-lime-500">{email}</span>. Please
            check your inbox and click the link to verify your account.
          </p>

          {/* Info Box */}
          <div
            className={`${theme === "dark"
              ? "bg-slate-700/20 border-slate-600"
              : "bg-slate-50 border-slate-200"
              } border rounded-xl p-4 mb-6 backdrop-blur-2xl`}
          >
            <div className="flex items-start gap-3">
              <i
                className={`fa-solid fa-circle-info text-lg mt-0.5 ${theme === "dark" ? "text-blue-400" : "text-blue-500"
                  }`}
              ></i>
              <div className="flex-1">
                <p
                  className={`font-poppins text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-700"
                    } leading-relaxed`}
                >
                  Didn't receive the email? Check your spam folder or click the button
                  below to resend the verification link.
                </p>
              </div>
            </div>
          </div>

          {/* Resend Button */}
          <button
            onClick={handleResendVerification}
            disabled={countdown > 0 || isSending}
            className={`mx-auto w-full max-w-xs h-12 rounded-md font-poppins font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 ${countdown > 0 || isSending
              ? theme === "dark"
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
              : theme === "dark"
                ? "bg-lime-600 text-white hover:bg-lime-700"
                : "bg-lime-500 text-white hover:bg-lime-600 "
              }`}
          >
            {isSending ? (
              <>
                <TailSpin height="20" width="20" color="#ffffff" />
                <span>Sending...</span>
              </>
            ) : countdown > 0 ? (
              <>
                <i className="fa-solid fa-clock"></i>
                <span>Resend in {formatTime(countdown)}</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane"></i>
                <span>Resend Verification Email</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div
              className={`absolute inset-0 flex items-center ${theme === "dark" ? "text-slate-600" : "text-slate-300"
                }`}
            >
              <div className="w-full border-t border-current"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className={`px-4 font-poppins rounded-xl ${theme === "dark"
                  ? "bg-slate-800 text-slate-500"
                  : "bg-white text-slate-500"
                  }`}
              >
                or
              </span>
            </div>
          </div>

          {/* Back to Login Link */}
          <div className="text-center">
            <button
              onClick={handleBackToLogin}
              className={`font-poppins text-sm sm:text-base ${theme === "dark"
                ? "text-lime-400 hover:text-lime-300"
                : "text-lime-600 hover:text-lime-700"
                } transition-colors duration-200 inline-flex items-center gap-2 bg-transparent border-none cursor-pointer`}
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Back to Login</span>
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`text-center mt-6 font-poppins text-xs sm:text-sm ${theme === "dark" ? "text-slate-500" : "text-slate-500"
            }`}
        >
          Need help?{" "}
          <a
            href="mailto:support@swiftjonny.com"
            className={`${theme === "dark" ? "text-lime-400 hover:text-lime-300" : "text-lime-600 hover:text-lime-700"
              } transition-colors duration-200`}
          >
            Contact Support
          </a>
        </motion.p>
      </div>
    </div>
  );
}

export default VerifyEmail;
