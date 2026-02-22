import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import ThemeToggler from "../../components/ThemeToggler";

const SUPPORT_PHONE = "+233257266272";
const SUPPORT_EMAIL = "joenash156@gmail.com";
const WHATSAPP_URL = `https://wa.me/${SUPPORT_PHONE.replace(/\D/g, "")}?text=Hello%2C%20I%20need%20help%20with%20SwiftJonny%20POS.`;

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "Who can I contact for urgent issues?",
    a: "For urgent issues, call or WhatsApp our support center directly. We aim to respond within 1 business hour during working hours (Mon–Fri, 8am–6pm GMT).",
  },
  {
    q: "How do I report a billing or transaction error?",
    a: "Email us at joenash156@gmail.com with your transaction ID, the date it occurred, and a brief description. We'll investigate and respond within 24 hours.",
  },
  {
    q: "I'm a cashier — who should I contact for help?",
    a: "Cashiers should first reach out to their store administrator. Your admin has elevated access to manage accounts and settings. If your admin cannot resolve the issue, they may escalate it to the support center.",
  },
  {
    q: "How do I reset my password?",
    a: "On the login page, click 'Forgot Password' and follow the instructions sent to your registered email address.",
  },
];

function FaqAccordion({ q, a, isDark }: FaqItem & { isDark: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border transition-colors ${isDark ? "border-slate-700/60 bg-slate-800/40" : "border-slate-200 bg-white"}`}>
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{q}</span>
        <i className={`fa-solid fa-chevron-down text-xs shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${isDark ? "text-slate-500" : "text-slate-400"}`} />
      </button>
      {open && (
        <div className={`px-5 pb-4 text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function HelpSupport() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const isLoggedIn = !!user;
  const isCashier = user?.role === "cashier";

  // Sync theme class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDark
        ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-900 text-white"
        : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/80 text-slate-900"
        }`}
    >
      {/* Minimal top bar */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md px-5 h-14 flex items-center justify-between ${isDark ? "bg-slate-950/85 border-slate-800" : "bg-white/85 border-slate-200"
        }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
            <i className="fa-solid fa-cash-register text-white text-xs" />
          </div>
          <span className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            SwiftJonny POS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggler theme={theme} onToggle={toggleTheme} />
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors"
            >
              <i className="fa-solid fa-gauge text-[10px]" />
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors"
            >
              <i className="fa-solid fa-arrow-right-to-bracket text-[10px]" />
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="max-w-3xl mx-auto px-5 py-12 space-y-10"
      >

        {/* Hero */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 ${isDark ? "bg-teal-500/10" : "bg-teal-50"}`}>
            <i className="fa-solid fa-headset text-teal-500 text-2xl" />
          </div>
          <h1 className={`text-3xl font-bold tracking-tight mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
            Help & Support
          </h1>
          <p className={`text-base max-w-lg mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Need help or want to report an issue? We're here for you. Reach out through any of the channels below and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Cashier notice */}
        {isCashier && (
          <div className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm ${isDark ? "bg-amber-500/5 border-amber-500/20 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800"
            }`}>
            <i className="fa-solid fa-circle-info text-amber-500 mt-0.5 shrink-0" />
            <p>
              <span className="font-semibold">For cashiers:</span> If you're experiencing an account issue or need help with the system, please contact your <span className="font-semibold">store administrator</span> first. They have the tools to resolve most issues directly. If the issue requires further escalation, your admin will reach out to the support team on your behalf.
            </p>
          </div>
        )}

        {/* Contact cards */}
        <section>
          <h2 className={`text-xs font-semibold uppercase tracking-widest mb-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Contact Support
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Phone */}
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-colors group ${isDark
                ? "bg-slate-800/60 border-slate-700 hover:border-teal-500/40 hover:bg-slate-800"
                : "bg-white border-slate-200 hover:border-teal-400 hover:shadow-sm"
                }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDark ? "bg-teal-500/10" : "bg-teal-50"}`}>
                <i className="fa-solid fa-phone text-teal-500 text-base" />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Call Us</p>
                <p className={`text-sm font-semibold group-hover:text-teal-500 transition-colors ${isDark ? "text-white" : "text-slate-900"}`}>
                  {SUPPORT_PHONE}
                </p>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>Mon–Fri, 8am–6pm GMT</p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-colors group ${isDark
                ? "bg-slate-800/60 border-slate-700 hover:border-green-500/40 hover:bg-slate-800"
                : "bg-white border-slate-200 hover:border-green-400 hover:shadow-sm"
                }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDark ? "bg-green-500/10" : "bg-green-50"}`}>
                <i className="fa-brands fa-whatsapp text-green-500 text-xl" />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>WhatsApp</p>
                <p className={`text-sm font-semibold group-hover:text-green-500 transition-colors ${isDark ? "text-white" : "text-slate-900"}`}>
                  {SUPPORT_PHONE}
                </p>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>Chat with us directly</p>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=SwiftJonny%20POS%20Support%20Request`}
              className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-colors group ${isDark
                ? "bg-slate-800/60 border-slate-700 hover:border-blue-500/40 hover:bg-slate-800"
                : "bg-white border-slate-200 hover:border-blue-400 hover:shadow-sm"
                }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
                <i className="fa-solid fa-envelope text-blue-500 text-base" />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Email</p>
                <p className={`text-sm font-semibold group-hover:text-blue-500 transition-colors break-all ${isDark ? "text-white" : "text-slate-900"}`}>
                  {SUPPORT_EMAIL}
                </p>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>Response within 24 hours</p>
              </div>
            </a>
          </div>
        </section>

        {/* Response time info */}
        <section className={`rounded-2xl border p-5 ${isDark ? "bg-slate-800/40 border-slate-700/60" : "bg-white border-slate-200"}`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-purple-500/10" : "bg-purple-50"}`}>
              <i className="fa-solid fa-clock-rotate-left text-purple-500 text-sm" />
            </div>
            <div>
              <h3 className={`text-sm font-semibold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Support Hours & Response Times</h3>
              <ul className={`text-sm space-y-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                <li><i className="fa-solid fa-check text-teal-500 mr-2 text-xs" />Phone & WhatsApp: Weekdays 8am – 6pm GMT</li>
                <li><i className="fa-solid fa-check text-teal-500 mr-2 text-xs" />Email: Replies within 24 hours on business days</li>
                <li><i className="fa-solid fa-check text-teal-500 mr-2 text-xs" />For critical system issues, WhatsApp is the fastest channel</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className={`text-xs font-semibold uppercase tracking-widest mb-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq) => (
              <FaqAccordion key={faq.q} {...faq} isDark={isDark} />
            ))}
          </div>
        </section>

        {/* Footer note */}
        <div className="text-center pb-4">
          <p className={`text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            SwiftJonny POS · Support Center · All communications are kept confidential
          </p>
          {!isLoggedIn && (
            <p className={`text-xs mt-1.5 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
              Already have an account?{" "}
              <Link to="/login" className="text-teal-500 hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          )}
        </div>
      </motion.main>
    </div>
  );
}
