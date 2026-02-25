import { useEffect } from "react";
import AuthHero from "../../components/AuthHero";
import LoginForm from "../../components/loginpage/LoginForm";
import { useTheme } from "../../contexts/ThemeContext";

function Login() {
  const { theme } = useTheme();

  useEffect(() => {
    document.title = "Login | SwiftJonny POS";
  }, []);

  return (
    <div
      className={`flex flex-col lg:flex-row min-h-screen lg:h-screen .font-kumbh overflow-y-auto lg:overflow-hidden transition-[background] duration-300 ease-in-out ${
        theme === "dark"
          ? "bg-linear-to-r md:bg-linear-to-b from-slate-950 via-slate-900 to-slate-900"
          : "bg-linear-to-r md:bg-linear-to-b from-teal-100/40 via-slate-50 to-slate-50"
      }`}
    >
      {/* Hero Section - Top on mobile, Left on desktop */}
      <div className="w-full h-[35vh] lg:h-full lg:w-1/2 xl:w-[55%]">
        <AuthHero />
      </div>

      {/* Login Form - Bottom on mobile, Right on desktop */}
      <div className="w-full flex-1 lg:w-1/2 xl:w-[45%] h-auto lg:h-full">
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;