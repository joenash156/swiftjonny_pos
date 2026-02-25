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

export default function TermsOfService() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const isLoggedIn = !!user;

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
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
            <i className="fa-solid fa-file-contract text-blue-500 text-2xl" />
          </div>
          <h1 className={`text-3xl font-bold tracking-tight mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
            Terms of Service
          </h1>
          <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Last updated: {LAST_UPDATED}
          </p>
          <p className={`text-base max-w-lg mx-auto leading-relaxed mt-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Please read these terms carefully before using SwiftJonny POS. By accessing or using the platform, you agree to be bound by these terms.
          </p>
        </div>

        {/* Acceptance */}
        <Section
          title="Acceptance of Terms"
          isDark={isDark}
          icon="fa-solid fa-handshake"
          iconColor="text-teal-500"
          iconBg={isDark ? "bg-teal-500/10" : "bg-teal-50"}
        >
          <p>
            By registering for, accessing, or using SwiftJonny POS ("the Service"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must not use the Service.
          </p>
          <p>
            These terms apply to all users, including administrators and cashiers. Your use of the Service on behalf of an organisation means that organisation also agrees to these terms.
          </p>
        </Section>

        {/* Description of Service */}
        <Section
          title="Description of Service"
          isDark={isDark}
          icon="fa-solid fa-cash-register"
          iconColor="text-purple-500"
          iconBg={isDark ? "bg-purple-500/10" : "bg-purple-50"}
        >
          <p>SwiftJonny POS is a web-based point-of-sale management platform that provides:</p>
          <BulletList
            isDark={isDark}
            items={[
              "Sales recording and transaction management at the POS terminal",
              "Product and category catalogue management",
              "Inventory tracking and stock level management",
              "Cashier account management and role-based access control",
              "Business analytics, sales reports, and performance dashboards",
              "POS terminal configuration and settings management",
              "Account management including profile and password updates",
            ]}
          />
        </Section>

        {/* User Accounts */}
        <Section
          title="User Accounts & Registration"
          isDark={isDark}
          icon="fa-solid fa-user-circle"
          iconColor="text-blue-500"
          iconBg={isDark ? "bg-blue-500/10" : "bg-blue-50"}
        >
          <p>
            To use SwiftJonny POS, you must create an account. By registering, you agree that:
          </p>
          <BulletList
            isDark={isDark}
            items={[
              "All information you provide during registration is accurate and complete",
              "You will verify your email address as required before accessing the platform",
              "Your account must be approved by an administrator before full access is granted",
              "You are responsible for maintaining the confidentiality of your password",
              "You will notify support immediately if you suspect unauthorised access to your account",
              "One user may not share account credentials with another person",
            ]}
          />
          <p>
            Administrators are responsible for managing the cashier accounts under their organisation. Admins must ensure only authorised personnel are granted access.
          </p>
        </Section>

        {/* Acceptable Use */}
        <Section
          title="Acceptable Use"
          isDark={isDark}
          icon="fa-solid fa-circle-check"
          iconColor="text-green-500"
          iconBg={isDark ? "bg-green-500/10" : "bg-green-50"}
        >
          <p>You agree to use SwiftJonny POS only for lawful business purposes. The following are <strong className={isDark ? "text-white" : "text-slate-800"}>prohibited</strong>:</p>
          <BulletList
            isDark={isDark}
            items={[
              "Using the platform to process fraudulent, illegal, or unauthorized transactions",
              "Attempting to gain unauthorized access to other accounts, the admin panel, or backend systems",
              "Reverse-engineering, decompiling, or scraping any part of the platform",
              "Uploading malicious content such as viruses, scripts, or harmful files",
              "Using the platform to harass, impersonate, or deceive other users",
              "Circumventing rate limits, authentication, or security controls",
              "Reselling or sublicensing access to the Service without written permission",
            ]}
          />
          <p>
            Violation of these terms may result in immediate account suspension or termination.
          </p>
        </Section>

        {/* Roles & Permissions */}
        <Section
          title="Roles & Permissions"
          isDark={isDark}
          icon="fa-solid fa-user-gear"
          iconColor="text-amber-500"
          iconBg={isDark ? "bg-amber-500/10" : "bg-amber-50"}
        >
          <p>SwiftJonny POS operates a two-tier role system:</p>
          <p><strong className={isDark ? "text-white" : "text-slate-800"}>Administrators</strong> have full access to:</p>
          <BulletList
            isDark={isDark}
            items={[
              "Manage products, categories, and inventory",
              "View and manage all sales transactions, including void operations",
              "Edit role, activeness, and delete cashier accounts",
              "Access business analytics and reporting dashboards",
              "Configure POS terminal settings",
            ]}
          />
          <p><strong className={isDark ? "text-white" : "text-slate-800"}>Cashiers</strong> have limited access to:</p>
          <BulletList
            isDark={isDark}
            items={[
              "Process sales transactions at the POS terminal",
              "View their own transaction history",
              "Update their own profile and account password",
            ]}
          />
          <p>
            Attempting to perform actions outside your assigned role is a violation of these terms.
          </p>
        </Section>

        {/* Data & Content */}
        <Section
          title="Your Data & Content"
          isDark={isDark}
          icon="fa-solid fa-server"
          iconColor="text-teal-500"
          iconBg={isDark ? "bg-teal-500/10" : "bg-teal-50"}
        >
          <p>
            You retain ownership of all business data you input into the platform (products, sales records, etc.). By using the Service, you grant SwiftJonny POS a limited license to store and process that data solely for the purpose of providing the Service.
          </p>
          <p>
            You are responsible for the accuracy of data you enter. SwiftJonny POS is not liable for losses resulting from incorrect data entry or misconfiguration by users.
          </p>
          <p>
            You are responsible for ensuring that any product images or other content you upload do not infringe on third-party copyright, trademarks, or other intellectual property rights.
          </p>
        </Section>

        {/* Transactions & Voiding */}
        <Section
          title="Transactions & Void Policy"
          isDark={isDark}
          icon="fa-solid fa-receipt"
          iconColor="text-orange-500"
          iconBg={isDark ? "bg-orange-500/10" : "bg-orange-50"}
        >
          <p>
            All completed sales transactions are recorded permanently in the system. Administrators may void a transaction, but the void record, including the reason and the identity of the user who voided is also permanently stored for audit purposes.
          </p>
          <BulletList
            isDark={isDark}
            items={[
              "Cashiers can only void their own transactions; only administrators may void all transactions",
              "Void reasons must be provided and are logged for accountability",
              "Transaction records are maintained for business compliance and reporting purposes",
            ]}
          />
        </Section>

        {/* Termination */}
        <Section
          title="Termination of Access"
          isDark={isDark}
          icon="fa-solid fa-ban"
          iconColor="text-red-400"
          iconBg={isDark ? "bg-red-500/10" : "bg-red-50"}
        >
          <p>
            SwiftJonny POS reserves the right to suspend or terminate any account that violates these Terms of Service, without prior notice.
          </p>
          <p>Accounts may also be deactivated by:</p>
          <BulletList
            isDark={isDark}
            items={[
              "The user themselves, by requesting account deletion through Settings or support",
              "An administrator, who may delete cashier accounts under their organization",
              "The SwiftJonny POS team, in cases of policy violations or security concerns",
            ]}
          />
          <p>
            Upon termination, your right to access the Service ceases immediately. Data retention after termination is governed by our{" "}
            <Link to="/privacy" className="text-teal-500 hover:underline">Privacy Policy</Link>.
          </p>
        </Section>

        {/* Disclaimers */}
        <Section
          title="Disclaimers & Limitation of Liability"
          isDark={isDark}
          icon="fa-solid fa-triangle-exclamation"
          iconColor="text-amber-400"
          iconBg={isDark ? "bg-amber-500/10" : "bg-amber-50"}
        >
          <p>
            SwiftJonny POS is provided <strong className={isDark ? "text-white" : "text-slate-800"}>"as is"</strong> without warranties of any kind, express or implied. We do not guarantee uninterrupted or error-free operation of the Service.
          </p>
          <p>To the fullest extent permitted by law, SwiftJonny POS shall not be liable for:</p>
          <BulletList
            isDark={isDark}
            items={[
              "Loss of business, revenue, or data resulting from use or inability to use the Service",
              "Errors or inaccuracies in sales reports or analytics",
              "Unauthorised access to your account resulting from your failure to protect credentials",
              "Downtime, maintenance windows, or service interruptions",
            ]}
          />
        </Section>

        {/* Changes to Terms */}
        <Section
          title="Changes to These Terms"
          isDark={isDark}
          icon="fa-solid fa-pen-to-square"
          iconColor="text-slate-400"
          iconBg={isDark ? "bg-slate-700/60" : "bg-slate-100"}
        >
          <p>
            We reserve the right to update these Terms of Service at any time. The "Last updated" date will be revised accordingly. Continued use of the Service after changes are posted constitutes acceptance of the new terms.
          </p>
          <p>
            For major changes, we will make reasonable efforts to notify account holders via email before the changes take effect.
          </p>
        </Section>

        {/* Contact */}
        <section className={`rounded-2xl border p-6 ${isDark ? "bg-blue-500/5 border-blue-500/20" : "bg-blue-50/60 border-blue-200"}`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-blue-500/10" : "bg-blue-100"}`}>
              <i className="fa-solid fa-envelope text-blue-500 text-sm" />
            </div>
            <div>
              <h3 className={`text-sm font-semibold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Questions about these terms?</h3>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                If you have any questions or concerns about these Terms of Service, please contact us:
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Terms%20of%20Service%20Enquiry`}
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
            <Link to="/privacy" className="hover:text-teal-500 transition-colors">Privacy Policy</Link>
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
