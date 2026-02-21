import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken, refreshApi } from "../services/api";
import type {
  AuthContextValue,
  LoginCredentials,
  RegisterData,
  User,
  ApiResponse,
} from "../types/types";
import { useTheme } from "./ThemeContext";
import { AxiosError } from "axios";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Seed user immediately from localStorage so components always have data
  // while the async refresh/validation check completes in the background
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();


  // Validate session with server: get fresh access token + latest profile.
  // If validation fails the session is truly invalid, so we clear state.
  useEffect(() => {
    async function checkAuth() {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await refreshApi.post("/api/user/refresh");
        setAccessToken(data.accessToken);

        // call profile
        const profile = await api.get("/api/user/profile");

        const freshUser = profile.data.user;
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));

        if (data.user?.theme) {
          setTheme(data.user.theme);
        }

      } catch (error) {
        console.error("Session restoration failed:", error);
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [setTheme]);

  /**
   * Login user with credentials
   * @param credentials - User login credentials
   * @returns ApiResponse with success/message/error from backend
   */
  const login = async (credentials: LoginCredentials): Promise<ApiResponse> => {
    try {
      setLoading(true);
      const response = await api.post<ApiResponse>("/api/user/login", credentials);

      const data = response.data;

      // If backend signals success === false
      if (!data.success) {
        const message = data.error || data.message || "Login failed. Please try again.";
        return { ...data, error: message, message };
      }

      // Success branch – ensure required fields exist
      if (!data.accessToken || !data.user) {
        const message = "Invalid login response from server.";
        return { success: false, error: message, message };
      }

      // Store user and access token
      setAccessToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Apply user's theme preference if available
      if (data.user.theme_preference) setTheme(data.user.theme_preference);
      return data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {

        // Return backend error object if available
        return error.response?.data || { success: false, error: "Login failed. Please try again." };
      }

      // Fallback for unexpected errors
      return { success: false, error: "Unexpected error occurred during login." };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   * @param data - User registration data
   * @returns ApiResponse with success/message/error from backend
   */
  const register = async (data: RegisterData): Promise<ApiResponse> => {
    try {
      setLoading(true);

      // Client-side password check
      if (data.password !== data.confirmPassword) {
        return { success: false, error: "Passwords do not match" };
      }

      // Call the API
      const response = await api.post<ApiResponse>("/api/user/signup", {
        firstname: data.firstname,
        lastname: data.lastname,
        othername: data.othername,
        email: data.email,
        password: data.password,
      });

      // If success, set user info
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        if (response.data.user.theme) setTheme(response.data.user.theme);
      }

      // return the API response
      return response.data;
    } catch (error: unknown) {
      // Axios error type
      if (error instanceof AxiosError) {
        // Return backend error object if available
        return error.response?.data || { success: false, error: "Unknown error occurred" };
      }

      // Fallback for unexpected errors
      return { success: false, error: "Unexpected error occurred" };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend verification email for a new user
   * @param email - The email address to resend verification to
   * @returns ApiResponse with success/message/error from backend
   */
  const resendVerification = async (email: string): Promise<ApiResponse> => {
    try {
      setLoading(true);
      const response = await api.post<ApiResponse>("/api/user/resend_verification_email", { email });
      return response.data;

    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return error.response?.data || { success: false, error: "Failed to resend verification email" };
      }
      return { success: false, error: "Unexpected error occurred while resending verification email" };
    } finally {
      setLoading(false);
    }
  };

  /**
 * verify email
 * @param token - The verification token from the email link
 * @returns ApiResponse with success/message/error from backend
 */
  const verifyYourEmail = async (token: string): Promise<ApiResponse> => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse>(`/api/user/verify_email?token=${token}`);
      // console.log(response.data)
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return error.response?.data || { success: false, error: "Failed to verify email" };
      }
      return { success: false, error: "Unexpected error occurred while verifying email" };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout current user
   * Clears tokens and user data both client-side and server-side
   */
  const logout = async (): Promise<void> => {
    try {
      // Attempt server logout (invalidate cookie/session/token)
      await api.post("/api/user/logout");
    } catch (error: unknown) {

      if (error instanceof AxiosError) {
        console.warn("Server logout failed:", error.response?.data || error.message);
      } else {
        console.warn("Unexpected logout error:", error);
      }
    } finally {
      // clear client-side state
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("user");
    }
  };


  /**
   * Refresh current user data from server
   * Useful after profile updates
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const { data } = await api.get("/api/user/profile");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      throw error;
    }
  };

  /**
   * Update user's theme preference on the server
   * @param theme - The theme to set ("light" or "dark")
   */
  const updateThemePreference = async (theme: "light" | "dark"): Promise<void> => {
    try {
      // Only update if user is logged in
      if (!user) {
        return;
      }

      await api.patch("/api/user/theme", { theme });

      // Update local user state
      const updatedUser = { ...user, theme };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to update theme preference:", error);
      // Don't throw - theme change should work even if server update fails
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateThemePreference,
        resendVerification,
        verifyYourEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access authentication context
 * @throws Error if used outside AuthProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};