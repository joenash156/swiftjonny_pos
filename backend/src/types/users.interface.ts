// Base shared user fields
export interface UserBase {
  firstname: string;
  lastname: string;
  othername?: string;
  phone?: string;
  other_phone?: string;
  avatar_url?: string;
  theme_preference?: 'light' | 'dark';
}

// For creating a new user
export interface CreateUserRequestBody extends UserBase {
  email: string;
  password: string;
  role?: 'admin' | 'cashier';
}

// For updating a user profile
export interface UpdateUserProfileRequestBody extends Partial<UserBase> {}

// For changing password
export interface ChangePasswordRequestBody {
  oldPassword: string;
  newPassword: string;
}

// For admin actions
export interface ApproveUserRequestBody {
  is_approved: boolean;
}
