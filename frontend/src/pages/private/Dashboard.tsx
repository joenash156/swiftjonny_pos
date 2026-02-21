import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

interface StatCard {
  label: string;
  value: string;
  icon: string;
  iconColor: string;
  change: string;
  changeUp: boolean;
}

const stats: StatCard[] = [
  { label: "Total Sales Today", value: "GH₵ 0.00", icon: "fa-solid fa-chart-line", iconColor: "text-teal-500", change: "+0%", changeUp: true },
  { label: "Transactions", value: "0", icon: "fa-solid fa-receipt", iconColor: "text-blue-500", change: "+0", changeUp: true },
  { label: "Products", value: "0", icon: "fa-solid fa-box", iconColor: "text-purple-500", change: "0 low", changeUp: true },
  { label: "Customers", value: "0", icon: "fa-solid fa-users", iconColor: "text-amber-500", change: "+0", changeUp: true },
];

function Dashboard() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const isDark = theme === "dark";

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div
      className={`min-h-full p-5 md:p-7 transition-colors duration-300 ${isDark
          ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-900"
          : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/80"
        }`}
    >
      {/* ── Greeting ───────────────────────────────────────── */}
      <div className="mb-7">
        <h1
          className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"
            }`}
        >
          {greeting()}, {user?.firstname}!
        </h1>
        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Here's an overview of your store today.
        </p>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl p-5 border transition-colors duration-300 ${isDark
                ? "bg-slate-900/70 border-slate-800 hover:bg-slate-800/80"
                : "bg-white/80 border-slate-200/80 hover:bg-white"
              }`}
          >
            <div className="flex items-start justify-between mb-4">
              <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {s.label}
              </p>
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-100"
                  }`}
              >
                <i className={`${s.icon} text-sm ${s.iconColor}`} />
              </span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {s.value}
            </p>
            <p
              className={`text-xs mt-1.5 font-medium ${s.changeUp
                  ? isDark ? "text-teal-400" : "text-teal-600"
                  : "text-red-400"
                }`}
            >
              <i
                className={`fa-solid ${s.changeUp ? "fa-arrow-trend-up" : "fa-arrow-trend-down"
                  } mr-1 text-[10px]`}
              />
              {s.change} from yesterday
            </p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="mb-8">
        <h2 className={`text-sm font-semibold uppercase tracking-widest mb-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "New Sale", icon: "fa-solid fa-cash-register", color: "bg-teal-600 hover:bg-teal-700" },
            { label: "Add Product", icon: "fa-solid fa-plus", color: "bg-blue-600 hover:bg-blue-700" },
            { label: "View Reports", icon: "fa-solid fa-chart-bar", color: "bg-purple-600 hover:bg-purple-700" },
          ].map((a) => (
            <button
              key={a.label}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-sm ${a.color}`}
            >
              <i className={`${a.icon} text-xs`} />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Placeholder Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {["Sales Overview", "Top Products"].map((title) => (
          <div
            key={title}
            className={`rounded-2xl p-5 border min-h-55 flex flex-col transition-colors duration-300 ${isDark
                ? "bg-slate-900/70 border-slate-800"
                : "bg-white/80 border-slate-200/80"
              }`}
          >
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {title}
            </h3>
            <div className="flex-1 flex items-center justify-center">
              <p className={`text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                No data yet
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;