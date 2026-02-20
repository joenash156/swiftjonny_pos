import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

function ApprovalPending() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center ${theme === "dark" ? "bg-slate-900" : "bg-slate-50"
        } px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300`}
    >
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${theme === "dark" ? "bg-slate-800/20" : "bg-gray-100/50"
            } rounded p-6 sm:p-8`}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-20 h-20 rounded-full ${theme === "dark" ? "bg-slate-700" : "bg-slate-100"
                } flex items-center justify-center`}
            >
              <i
                className={`fa-solid fa-hourglass-half text-4xl ${theme === "dark" ? "text-amber-400" : "text-amber-500"
                  }`}
              ></i>
            </div>
          </div>

          {/* Title */}
          <h1
            className={`font-bold text-2xl sm:text-3xl text-center ${theme === "dark" ? "text-white" : "text-slate-800"
              } mb-3`}
          >
            Account Pending Approval
          </h1>

          {/* Description */}
          <p
            className={`text-center ${theme === "dark" ? "text-slate-400" : "text-slate-600"
              } text-sm sm:text-base mb-6 leading-relaxed`}
          >
            Your account has been created successfully, but it requires
            administrator approval before you can access it.
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
                  className={`text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-700"
                    } leading-relaxed mb-3`}
                >
                  Please contact your system administrator to approve your
                  account. Once approved, you'll be able to log in to get started.
                </p>
                <div
                  className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}
                >
                  <p className="mb-1">
                    <i className="fa-solid fa-user-shield mr-2 text-teal-500"></i>
                    <span className="font-semibold">What to do:</span>
                  </p>
                  <ul className="ml-6 space-y-1 list-disc">
                    <li>Contact your administrator</li>
                    <li>Wait for account approval notification</li>
                    <li>Return to login once approved</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* OK Button */}
          <button
            onClick={handleBackToLogin}
            className={`mx-auto w-full max-w-xs h-11 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 ${theme === "dark"
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "bg-teal-500 text-white hover:bg-teal-600"
              }`}
          >
            <i className="fa-solid fa-check"></i>
            <span>OK, Got It</span>
          </button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`text-center mt-6 text-xs sm:text-sm ${theme === "dark" ? "text-slate-500" : "text-slate-500"
            }`}
        >
          Need help?{" "}
          <a
            href="mailto:support@swiftjonny.com"
            className={`${theme === "dark"
                ? "text-teal-400 hover:text-teal-300"
                : "text-teal-600 hover:text-teal-700"
              } transition-colors duration-200`}
          >
            Contact Support
          </a>
        </motion.p>
      </div>
    </div>
  );
}

export default ApprovalPending;
