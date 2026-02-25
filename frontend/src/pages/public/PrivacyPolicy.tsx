import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import ThemeToggler from "../../components/ThemeToggler";

const LAST_UPDATED = "February 25, 2026";
const SUPPORT_EMAIL = "joenash156@gmail.com";

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
  icon: string;
  iconColor: string;
  iconBg: string;
}

function Section({ title, children, isDark, icon, iconColor, iconBg }: SectionProps) {
  return (
    <section className={`rounded-2xl border p-6 ${isDark ? "bg-slate-800/40 border-slate-700/60" : "bg-white border-slate-200"}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <i className={`${icon} text-sm ${iconColor}`} />
        </div>
        <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h2>
      </div>
      <div className={`text-sm leading-relaxed space-y-3 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }: { items: string[]; isDark?: boolean }) {
  return (
    <ul className="space-y-2 mt-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <i className="fa-solid fa-circle-dot text-teal-500 text-[9px] mt-1.5 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicy() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const isLoggedIn = !!user;

  useEffect(() => {
    document.title = "Privacy Policy | SwiftJonny POS";
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div
      className={`overflow-y-auto h-screen font-kumbh min-h-screen transition-colors duration-300 ${isDark
          ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-900 text-white"
          : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/80 text-slate-900"
        }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-md px-5 h-14 flex items-center justify-between ${isDark ? "bg-slate-950/85 border-slate-800" : "bg-white/85 border-slate-200"
          }`}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
            <i className="fa-solid fa-cash-register text-white text-xs" />
          </div>
          <span className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            SwiftJonny POS
          </span>
        </Link>
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
        className="max-w-3xl mx-auto px-5 py-12 space-y-6"
      >
        {/* Hero */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 ${isDark ? "bg-purple-500/10" : "bg-purple-50"}`}>
            <i className="fa-solid fa-shield-halved text-purple-500 text-2xl" />
          </div>
          <h1 className={`text-3xl font-bold tracking-tight mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
            Privacy Policy
          </h1>
          <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Last updated: {LAST_UPDATED}
          </p>
          <p className={`text-base max-w-lg mx-auto leading-relaxed mt-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            At SwiftJonny POS, your privacy matters. This policy explains what data we collect, how we use it, and your rights regarding that data.
          </p>
        </div>

        {/* Overview */}
        <Section
          title="Overview"
          isDark={isDark}
          icon="fa-solid fa-circle-info"
          iconColor="text-teal-500"
          iconBg={isDark ? "bg-teal-500/10" : "bg-teal-50"}
        >
          <p>
            SwiftJonny POS is a point-of-sale management system designed for businesses to manage sales, inventory, products, categories, and staff accounts. This Privacy Policy applies to all users of the platform, including administrators and cashiers.
          </p>
          <p>
            By using SwiftJonny POS, you agree to the collection and use of information as described in this policy. We are committed to handling your personal information responsibly and transparently.
          </p>
        </Section>

        {/* Information We Collect */}
        <Section
          title="Information We Collect"
          isDark={isDark}
          icon="fa-solid fa-database"
          iconColor="text-blue-500"
          iconBg={isDark ? "bg-blue-500/10" : "bg-blue-50"}
        >
          <p><strong className={isDark ? "text-white" : "text-slate-800"}>Account Information</strong></p>
          <BulletList
            isDark={isDark}
            items={[
              "Full name (first name, last name, and optional other name)",
              "Email address used for account registration and verification",
              "Encrypted password (we never store plain-text passwords)",
              "Profile avatar / photo (optional)",
              "User role (admin or cashier)",
              "Account status (email verification, admin approval state)",
            ]}
          />
          <p className="mt-2"><strong className={isDark ? "text-white" : "text-slate-800"}>Business & Transaction Data</strong></p>
          <BulletList
            isDark={isDark}
            items={[
              "Sales records including items sold, quantities, prices, and totals",
              "Payment methods used in transactions",
              "Void records including reason and the user who voided",
              "Product catalog information (names, prices, descriptions, images, stock levels)",
              "Category data used to organize products",
              "Inventory adjustments and history",
            ]}
          />
          <p className="mt-2"><strong className={isDark ? "text-white" : "text-slate-800"}>System & Usage Data</strong></p>
          <BulletList
            isDark={isDark}
            items={[
              "Login timestamps and session activity",
              "POS terminal settings and configurations",
              "Device and browser information for security purposes",
            ]}
          />
        </Section>

        {/* How We Use Your Information */}
        <Section
          title="How We Use Your Information"
          isDark={isDark}
          icon="fa-solid fa-gears"
          iconColor="text-amber-500"
          iconBg={isDark ? "bg-amber-500/10" : "bg-amber-50"}
        >
          <p>We use the information we collect to:</p>
          <BulletList
            isDark={isDark}
            items={[
              "Authenticate your identity and maintain session security",
              "Operate core POS features including sales processing and inventory management",
              "Send account-related emails such as email verification and password reset links",
              "Allow administrators to manage cashier accounts and permissions",
              "Generate business analytics and sales reports for administrators",
              "Enforce role-based access control (admin vs. cashier permissions)",
              "Investigate and respond to support requests",
              "Improve platform reliability and fix bugs",
            ]}
          />
        </Section>

        {/* Data Storage & Security */}
        <Section
          title="Data Storage & Security"
          isDark={isDark}
          icon="fa-solid fa-lock"
          iconColor="text-green-500"
          iconBg={isDark ? "bg-green-500/10" : "bg-green-50"}
        >
          <p>
            Your data is stored in a secured database. We implement industry-standard security practices to protect your information:
          </p>
          <BulletList
            isDark={isDark}
            items={[
              "Passwords are hashed, we cannot read your password",
              "File uploads (profile pictures, product images) are stored server-side with sanitized filenames",
              "Access to sensitive routes is protected by authentication and role-based middleware",
            ]}
          />
          <p className={`mt-2 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            While we take reasonable precautions, no system is 100% secure. If you believe your account has been compromised, contact support immediately.
          </p>
        </Section>

        {/* Data Sharing */}
        <Section
          title="Data Sharing & Third Parties"
          isDark={isDark}
          icon="fa-solid fa-share-nodes"
          iconColor="text-purple-500"
          iconBg={isDark ? "bg-purple-500/10" : "bg-purple-50"}
        >
          <p>
            We do <strong className={isDark ? "text-white" : "text-slate-800"}>NOT</strong> sell, rent, or trade your personal data to any third party. Data is only shared in the following limited circumstances:
          </p>
          <BulletList
            isDark={isDark}
            items={[
              "With your organization's administrator, who manages the account under which you operate",
              "With email delivery services solely for transactional emails (e.g. verification, password reset)",
              "When required by law or to comply with a valid legal process",
              "To protect the rights or safety of SwiftJonny POS users",
            ]}
          />
        </Section>

        {/* Cookies */}
        <Section
          title="Cookies & Local Storage"
          isDark={isDark}
          icon="fa-solid fa-cookie-bite"
          iconColor="text-orange-500"
          iconBg={isDark ? "bg-orange-500/10" : "bg-orange-50"}
        >
          <p>SwiftJonny POS uses browser storage to enhance your experience:</p>
          <BulletList
            isDark={isDark}
            items={[
              "Theme preference (light/dark mode) is saved in localStorage",
              "Pending email verification session data is temporarily stored",
            ]}
          />
          <p>We do not use tracking cookies or third-party advertising cookies.</p>
        </Section>

        {/* User Rights */}
        <Section
          title="Your Rights"
          isDark={isDark}
          icon="fa-solid fa-user-shield"
          iconColor="text-teal-500"
          iconBg={isDark ? "bg-teal-500/10" : "bg-teal-50"}
        >
          <p>As a user of SwiftJonny POS, you have the right to:</p>
          <BulletList
            isDark={isDark}
            items={[
              "Access the personal data we hold about you",
              "Request correction of inaccurate or outdated information",
              "Request deletion of your account data (subject to your administrator's discretion)",
              "Change your password or update your profile at any time via Settings",
              "Contact support regarding any privacy concern",
            ]}
          />
          <p>
            To exercise these rights, contact your system administrator or email us directly at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-teal-500 hover:underline font-medium">{SUPPORT_EMAIL}</a>.
          </p>
        </Section>

        {/* Data Retention */}
        <Section
          title="Data Retention"
          isDark={isDark}
          icon="fa-solid fa-calendar-days"
          iconColor="text-red-400"
          iconBg={isDark ? "bg-red-500/10" : "bg-red-50"}
        >
          <p>
            Account and transaction data is retained for as long as your account is active. If an account is deleted, associated personal data is removed from the active database. Transaction and sales records may be retained in logs for business continuity and audit purposes.
          </p>
          <p>
            System administrators have the ability to delete cashier accounts. Deletion requests for admin accounts should be directed to support.
          </p>
        </Section>

        {/* Policy Updates */}
        <Section
          title="Changes to This Policy"
          isDark={isDark}
          icon="fa-solid fa-pen-to-square"
          iconColor="text-slate-400"
          iconBg={isDark ? "bg-slate-700/60" : "bg-slate-100"}
        >
          <p>
            We may update this Privacy Policy from time to time. When we do, the "Last updated" date at the top of this page will be revised. Continued use of SwiftJonny POS after changes are posted constitutes your acceptance of the updated policy.
          </p>
          <p>
            For significant changes, we will make reasonable efforts to notify administrators via email.
          </p>
        </Section>

        {/* Contact */}
        <section className={`rounded-2xl border p-6 ${isDark ? "bg-teal-500/5 border-teal-500/20" : "bg-teal-50/60 border-teal-200"}`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-teal-500/10" : "bg-teal-100"}`}>
              <i className="fa-solid fa-envelope text-teal-500 text-sm" />
            </div>
            <div>
              <h3 className={`text-sm font-semibold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Questions about this policy?</h3>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                If you have any questions, concerns, or requests regarding your privacy, reach out to us:
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Privacy%20Policy%20Enquiry`}
                className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-teal-500 hover:text-teal-400 transition-colors"
              >
                <i className="fa-solid fa-envelope text-xs" />
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className={`text-center pb-4 pt-2 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <p className={`text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            © 2026 SwiftJonny POS · All rights reserved
          </p>
          <div className={`flex items-center justify-center gap-4 mt-3 text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            <Link to="/terms" className="hover:text-teal-500 transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link to="/help" className="hover:text-teal-500 transition-colors">Help & Support</Link>
            {!isLoggedIn && (
              <>
                <span>·</span>
                <Link to="/login" className="hover:text-teal-500 transition-colors">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </motion.main>
    </div>
  );
}
