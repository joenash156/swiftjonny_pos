import { motion } from "framer-motion";
import LoginHeroBgImg from "../assets/auth-page-img.jpg";
import HeroImg from "../assets/authpage-dashboard-img.png";

function AuthHero() {
  return (
    <div className="flex relative w-full h-full overflow-hidden rounded-bl-4xl rounded-br-4xl lg:rounded-bl-none lg:rounded-tr-4xl lg:rounded-br-4xl">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${LoginHeroBgImg})` }}
      />

      {/* Dark Overlay with Backdrop Blur */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col justify-between h-full w-full p-6 lg:p-8 xl:p-10">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-bolt text-white text-sm"></i>
          </div>
          <span className="text-white font-poppins font-bold text-lg tracking-wide">
            SwiftJonny
          </span>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center py-4">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-center mb-4"
          >
            <h1 className="text-white font-poppins font-bold text-2xl lg:text-3xl leading-tight mb-3">
              Elevate Your Business
              <span className="block text-lime-400">with SwiftJonny POS</span>
            </h1>
            <p className="text-slate-200 font-poppins text-xs lg:text-sm max-w-md mx-auto leading-relaxed">
              The modern point-of-sale solution built for speed, reliability,
              and seamless business management. Experience the future of retail today.
            </p>
          </motion.div>

          {/* Hero Image - only show from md and up */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative w-full max-w-md hidden md:block"
          >
            <div className="absolute -inset-3 bg-lime-500/20 rounded-xl blur-xl" />
            <img
              src={HeroImg}
              alt="SwiftJonny POS Dashboard"
              className="relative w-full h-auto rounded-lg shadow-2xl border border-white/10 "
            />
          </motion.div>
        </div>

        {/* Bottom Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center justify-center gap-6 lg:gap-8"
        >
          <div className="flex items-center gap-1.5 text-slate-300">
            <i className="fa-solid fa-shield-halved text-lime-400 text-xs"></i>
            <span className="font-poppins text-[10px] lg:text-xs">Secure</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <i className="fa-solid fa-rocket text-lime-400 text-xs"></i>
            <span className="font-poppins text-[10px] lg:text-xs">Lightning Fast</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <i className="fa-solid fa-chart-line text-lime-400 text-xs"></i>
            <span className="font-poppins text-[10px] lg:text-xs">Real-time Analytics</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthHero;