import api from "./api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/** Build a fully-qualified URL for a stored avatar filename */
export function getAvatarUrl(avatarFilename: string | null | undefined): string | null {
  if (!avatarFilename) return null;
  return `${API_URL}/uploads/avatars/${avatarFilename}`;
}

export interface UpdateProfilePayload {
  firstname?: string;
  lastname?: string;
  othername?: string;
  phone?: string;
  other_phone?: string;
}

export const userService = {
  /** GET /api/user/profile */
  getProfile: async () => {
    const { data } = await api.get("/api/user/profile");
    return data;
  },

  /** PATCH /api/user/update_profile */
  updateProfile: async (payload: UpdateProfilePayload) => {
    const { data } = await api.patch("/api/user/update_profile", payload);
    return data;
  },

  /** PATCH /api/user/change_password */
  changePassword: async (payload: { current_password: string; new_password: string }) => {
    const { data } = await api.patch("/api/user/change_password", payload);
    return data;
  },

  /** PATCH /api/user/avatar/update — multipart/form-data */
  updateAvatar: async (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    const { data } = await api.patch("/api/user/avatar/update", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /** PATCH /api/user/avatar/remove */
  removeAvatar: async () => {
    const { data } = await api.patch("/api/user/avatar/remove", {});
    return data;
  },

  /** DELETE /api/user/delete — requires password */
  deleteAccount: async (password: string) => {
    const { data } = await api.delete("/api/user/delete", {
      data: { password },
    });
    return data;
  },
};
