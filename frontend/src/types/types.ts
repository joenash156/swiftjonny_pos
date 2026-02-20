export type FormData = {
  firstname: string;
  lastname: string;
  othername?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type PasswordRequirement = {
  label: string;
  met: boolean;
}

/**
 * User interface representing authenticated user data from backend
 */
export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  othername?: string | null;
  role?: string;
  is_email_verified?: number | boolean;
  phone?: string | null;
  other_phone?: string | null;
  avatar_url?: string | null;
  is_approved?: number | boolean;
  is_profile_complete?: number | boolean;
  last_login_at?: string;
  theme_preference?: "light" | "dark";
  theme?: "light" | "dark"; // Client-side normalized field
  created_at?: string;
  createdAt?: string;
}

/**
 * API Success Response structure
 */
export interface ApiSuccessResponse {
  success: true;
  message?: string;
  accessToken: string;
  is_email_verified?: number | boolean;
  is_approved?: number | boolean;
  user: User;
}

/**
 * API Error Response structure
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  is_email_verified?: number | boolean;
  is_approved?: number | boolean;
  message?: string;
}

/**
 * Combined API Response type
 */
export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration data interface
 */
export interface RegisterData {
  firstname: string;
  lastname: string;
  othername?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Authentication context value interface
 */
export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<ApiResponse>;
  register: (data: RegisterData) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateThemePreference: (theme: "light" | "dark") => Promise<void>;
  resendVerification: (email: string) => Promise<ApiResponse>;
  verifyYourEmail: (token: string) => Promise<ApiResponse>;
}