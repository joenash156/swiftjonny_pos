import { Outlet } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

function AuthPagesLayout() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`font-kumbh overflow-y-auto h-screen ${isDark ? "bg-slate-950" : "bg-white"}`}>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AuthPagesLayout