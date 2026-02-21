import { motion } from "framer-motion";

interface ToastProps {
  msg: string;
  ok: boolean;
  isDark: boolean;
}

export function Toast({ msg, ok, isDark }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`fixed top-5 right-5 z-70 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg ${ok
          ? isDark
            ? "bg-teal-900 text-teal-300 border border-teal-700"
            : "bg-teal-50 text-teal-700 border border-teal-200"
          : isDark
            ? "bg-red-900/50 text-red-300 border border-red-700"
            : "bg-red-50 text-red-600 border border-red-200"
        }`}
    >
      <i className={`fa-solid ${ok ? "fa-check" : "fa-xmark"} text-xs`} />
      {msg}
    </motion.div>
  );
}
