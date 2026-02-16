import LoginHero from "../../components/loginpage/LoginHero";
import LoginForm from "../../components/loginpage/LoginForm";

function Login() {
  return (
    <div className="flex h-screen font-poppins overflow-hidden">
      {/* Left Side - Hero Section (Hidden on mobile, Fixed) */}
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%] h-full">
        <LoginHero />
      </div>

      {/* Right Side - Login Form (Scrollable) */}
      <div className="w-full lg:w-1/2 xl:w-[45%] h-full overflow-hidden">
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;