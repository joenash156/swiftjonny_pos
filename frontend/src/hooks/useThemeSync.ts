import { useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

/**
 * Custom hook that syncs theme changes with the server
 * Combines local theme toggling with server-side preference updates
 */
export function useThemeSync() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const { updateThemePreference, user } = useAuth();

  /**
   * Toggle theme and sync with server if user is logged in
   */
  const toggleThemeWithSync = useCallback(async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    
    // Update local theme immediately for instant feedback
    toggleTheme();
    
    // Sync with server if user is logged in (don't wait for it)
    if (user) {
      updateThemePreference(newTheme).catch((error) => {
        console.error("Theme sync failed:", error);
      });
    }
  }, [theme, toggleTheme, user, updateThemePreference]);

  /**
   * Set specific theme and sync with server if user is logged in
   * @param newTheme - The theme to set
   */
  const setThemeWithSync = useCallback(async (newTheme: "light" | "dark") => {
    // Update local theme immediately
    setTheme(newTheme);
    
    // Sync with server if user is logged in (don't wait for it)
    if (user) {
      updateThemePreference(newTheme).catch((error) => {
        console.error("Theme sync failed:", error);
      });
    }
  }, [setTheme, user, updateThemePreference]);

  return {
    theme,
    toggleTheme: toggleThemeWithSync,
    setTheme: setThemeWithSync,
  };
}
