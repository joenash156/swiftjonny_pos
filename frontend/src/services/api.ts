import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// request timeout (30 seconds)
const REQUEST_TIMEOUT = 30000;


// main Axios instance for API calls
const api = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


// separate Axios instance for refresh token calls
export const refreshApi = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// in-memory access token storage
let accessToken: string | null = null;

// Refresh token promise to prevent race conditions
let refreshTokenPromise: Promise<string> | null = null;

/**
 * Set or clear the access token
 * @param token - The JWT access token or null to clear
 */
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

/**
 * Get the current access token
 * @returns The current access token or null
 */
export const getAccessToken = (): string | null => {
  return accessToken;
};

// Clear authentication state and redirect to login
const handleAuthFailure = (): void => {
  setAccessToken(null);
  localStorage.removeItem("user");
  
  // Redirect to login only if not already there
  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
};

/**
 * Refresh the access token
 * Implements a lock mechanism to prevent concurrent refresh attempts
 */
const refreshAccessToken = async (): Promise<string> => {
  // If a refresh is already in progress, return that promise
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  // Create a new refresh promise
  refreshTokenPromise = (async () => {
    try {
      const { data } = await refreshApi.post("/api/user/refresh");

      if (!data?.accessToken) {
        throw new Error("No access token received from refresh endpoint");
      }

      const newAccessToken = data.accessToken;
      setAccessToken(newAccessToken);
      
      return newAccessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      handleAuthFailure();
      throw error;
    } finally {
      // Clear the promise after completion (success or failure)
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

/**
 * Request Interceptor
 * Attaches the access token to every request if available
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles 401 errors by attempting to refresh the access token
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if this is a 401 error that should trigger a refresh
    const shouldRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/login") &&
      !originalRequest.url?.includes("/register") &&
      !originalRequest.url?.includes("/refresh");

    if (shouldRefresh) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token (with race condition protection)
        const newAccessToken = await refreshAccessToken();

        // Retry the original request with the new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, authentication failure already handled
        return Promise.reject(refreshError);
      }
    }

    // For all other errors, reject as-is
    return Promise.reject(error);
  }
);

export default api;