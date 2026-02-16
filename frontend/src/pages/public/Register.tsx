import AuthHero from "../../components/AuthHero";
import RegisterForm from "../../components/registerpage/RegisterForm";

function Register() {
  return (
    <div className="flex h-screen font-poppins overflow-hidden">
      {/* Left Side - Hero Section (Hidden on mobile, Fixed) */}
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%] h-full">
        <AuthHero />
      </div>

      {/* Right Side - Register Form (Scrollable) */}
      <div className="w-full lg:w-1/2 xl:w-[45%] h-full overflow-hidden">
        <RegisterForm />
      </div>
    </div>
  );
}

export default Register;