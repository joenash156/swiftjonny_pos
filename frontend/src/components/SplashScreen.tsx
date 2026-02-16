import { motion } from "framer-motion"
import Logo from "../assets/logo.png"; 
import { useTheme } from "../contexts/ThemeContext";

export default function SplashScreen() {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      className={`fixed inset-0 flex items-center justify-center ${theme === "dark" ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-900" : "bg-linear-to-br from-lime-50/80 via-slate-50 to-purple-100/80"} z-50`}
    >
      <motion.img
        src={Logo}
        alt="Logo"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-72"
      />
    </motion.div>
  )
}
