import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { SidebarProvider } from "../contexts/SidebarContext";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";

function AppLayout() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();

  const isDark = theme === "dark";

  // While checking auth state, avoid flashing the login page
  if (loading) {
    return (
      <div
        className={`w-full h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-white"
          }`}
      >
        <ThreeDots
          height="60"
          width="60"
          radius="9"
          color="#0d9488"
          ariaLabel="three-dots-loading"
          visible
        />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated users can see the app layout and its nested routes
  return (
    <SidebarProvider>
      <div className={`font-kumbh flex h-screen overflow-hidden ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <Header />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="min-h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;