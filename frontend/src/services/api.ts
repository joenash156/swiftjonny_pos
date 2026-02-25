import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const REQUEST_TIMEOUT = 30000;


  // AXIOS INSTANCES

const api = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const refreshApi = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


  // ACCESS TOKEN (IN MEMORY)

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;

  // set default header immediately
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const getAccessToken = () => accessToken;


  // AUTH FAILURE HANDLER
const handleAuthFailure = () => {
  setAccessToken(null);
  localStorage.removeItem("user");

  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
};


  // REFRESH TOKEN LOGIC
let refreshTokenPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  if (refreshTokenPromise) return refreshTokenPromise;

  refreshTokenPromise = (async () => {
    try {
      const { data } = await refreshApi.post("/api/user/refresh");

      if (!data?.accessToken) {
        throw new Error("No access token from refresh endpoint");
      }

      const newAccessToken = data.accessToken;

      // Store token + set header
      setAccessToken(newAccessToken);

      return newAccessToken;
    } catch (error) {
      console.error("Refresh failed:", error);
      handleAuthFailure();
      throw error;
    } finally {
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);


   // RESPONSE INTERCEPTOR

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

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
        const newAccessToken = await refreshAccessToken();

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
