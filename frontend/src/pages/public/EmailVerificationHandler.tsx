import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TailSpin, ThreeDots } from "react-loader-spinner";
import { AxiosError } from "axios";
import { useAuth } from "../../contexts/AuthContext";
import type { ApiErrorResponse, ApiSuccessResponse } from "../../types/types";

function EmailVerificationHandler() {
  const { theme } = useTheme();
  const { verifyYourEmail } = useAuth()!;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");
  const hasSucceededRef = useRef(false);

  // We deliberately exclude verifyYourEmail from deps to avoid double-calling
  // when the auth context re-renders.
  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        const response = await verifyYourEmail(token);

        console.log(response)

        // Simulate a short "verifying" state for nicer UX
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const normalizedMessage = (response as ApiSuccessResponse).message as string | undefined;
        const normalizedError = (response as ApiErrorResponse).error as string | undefined;
        const combinedText = `${normalizedMessage || ""} ${normalizedError || ""}`.toLowerCase();

        const isVerifiedText =
          combinedText.includes("email verified") ||
          combinedText.includes("verified successfully") ||
          combinedText.includes("already verified");

        if (response.success || isVerifiedText) {
          hasSucceededRef.current = true;
          setStatus("success");
          setMessage(
            normalizedMessage ||
            normalizedError ||
            "Email verified successfully! You can now login into your account."
          );

          // Clear any pending verification email from localStorage
          localStorage.removeItem("pending_verification_email");

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 3000);
        } else {
          if (hasSucceededRef.current) return;
          setStatus("error");
          setMessage(
            normalizedError ||
            normalizedMessage ||
            "Failed to verify email."
          );
        }
      } catch (error) {
        console.error("Email verification error:", error);
        if (error instanceof AxiosError) {
          const errorData = error.response?.data;
          const rawError = (errorData as ApiErrorResponse)?.error as string | undefined;
          const rawMessage = (errorData as ApiErrorResponse)?.message as string | undefined;
          const errorText = (rawError || rawMessage || "").toLowerCase();

          const isAlreadyVerified =
            errorText.includes("already verified") ||
            errorText.includes("email verified");

          if (isAlreadyVerified) {
            hasSucceededRef.current = true;
            setStatus("success");
            setMessage(
              rawMessage ||
              rawError ||
              "Your email is already verified. You can now login into your account."
            );

            localStorage.removeItem("pending_verification_email");

            setTimeout(() => {
              navigate("/login", { replace: true });
            }, 3000);
          } else {
            if (hasSucceededRef.current) return;
            setStatus("error");
            setMessage(
              rawError ||
              rawMessage ||
              "An error occurred while verifying your email. The link may have expired."
            );
          }
        } else {
          setStatus("error");
          setMessage("An unexpected error occurred. Please try again.");
        }
      }
    };

    verifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate]);

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center ${theme === "dark" ? "bg-slate-900" : "bg-slate-50"
        } px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300`}
    >
      <div className="w-full max-w-md">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${theme === "dark" ? "bg-slate-800/20" : "bg-gray-100/50"
            } rounded p-6 sm:p-8`}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-20 h-20 rounded-full ${status === "verifying"
                ? theme === "dark"
                  ? "bg-slate-700"
                  : "bg-slate-100"
                : status === "success"
                  ? "bg-green-100"
                  : "bg-red-100"
                } flex items-center justify-center`}
            >
              {status === "verifying" && (
                <TailSpin height="40" width="40" color={theme === "dark" ? "#84cc16" : "#65a30d"} />
              )}
              {status === "success" && (
                <i className="fa-solid fa-circle-check text-4xl text-green-600"></i>
              )}
              {status === "error" && (
                <i className="fa-solid fa-circle-xmark text-4xl text-red-600"></i>
              )}
            </div>
          </div>

          {/* Title */}
          <h1
            className={`font-poppins font-bold text-2xl sm:text-3xl text-center ${theme === "dark" ? "text-white" : "text-slate-800"
              } mb-3`}
          >
            {status === "verifying" && "Verifying Your Email"}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </h1>

          {/* Message */}
          <p
            className={`font-poppins text-center ${theme === "dark" ? "text-slate-400" : "text-slate-600"
              } text-sm sm:text-base mb-6 leading-relaxed`}
          >
            {status === "verifying" && "Please wait while we verify your email address..."}
            {status === "success" && (
              <>
                {message}
                <br />
                <div className="flex flex-col items-center justify-center mt-4 gap-2">
                  <ThreeDots
                    height="40"
                    width="40"
                    radius="8"
                    color="#4F46E5"
                    ariaLabel="three-dots-loading"
                    wrapperStyle={{ margin: '5px' }}
                    wrapperClass="custom-loader"
                    visible={true}
                  />
                  <span className="text-lime-500 font-semibold">
                    Redirecting to login page...
                  </span>
                </div>
              </>
            )}
            {status === "error" && (
              <>
                {message}
                <br />
                <span className="text-xs mt-2 block text-slate-500">
                  Try logging in to request a new verification link.
                </span>
              </>
            )}
          </p>

          {/* Action Buttons */}
          {status === "error" && (
            <button
              onClick={() => navigate("/login", { replace: true })}
              className={`w-full h-11 rounded-xl font-poppins font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 ${theme === "dark"
                ? "bg-lime-600 text-white hover:bg-lime-700"
                : "bg-lime-500 text-white hover:bg-lime-600"
                }`}
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Back to Login</span>
            </button>
          )}

          {status === "success" && (
            <button
              onClick={() => navigate("/login", { replace: true })}
              className={`w-full h-12 rounded-md font-poppins font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 ${theme === "dark"
                ? "bg-lime-600 text-white hover:bg-lime-700"
                : "bg-lime-500 text-white hover:bg-lime-600"
                }`}
            >
              <i className="fa-solid fa-arrow-right"></i>
              <span>Go to Login</span>
            </button>
          )}
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
            className={`${theme === "dark"
              ? "text-lime-400 hover:text-lime-300"
              : "text-lime-600 hover:text-lime-700"
              } transition-colors duration-200`}
          >
            Contact Support
          </a>
        </motion.p>
      </div>
    </div>
  );
}

export default EmailVerificationHandler;
