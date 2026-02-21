import api from "./api";

export interface POSSettings {
  tax_percent: number;
  discount_percent: number;
  receipt_header: string;
  receipt_footer: string;
}

export interface POSSettingsResponse {
  success: boolean;
  is_set: boolean;
  message?: string;
  error?: string;
  settings?: POSSettings;
}

export interface CreatePOSSettingsPayload {
  tax_percent: number;
  discount_percent: number;
  receipt_header: string;
  receipt_footer: string;
}

export interface UpdatePOSSettingsPayload {
  tax_percent?: number;
  discount_percent?: number;
  receipt_header?: string;
  receipt_footer?: string;
}

export const posSettingsService = {
  /** GET /api/pos_settings — all roles */
  getSettings: async (): Promise<POSSettingsResponse> => {
    const { data } = await api.get<POSSettingsResponse>("/api/pos_settings");
    return data;
  },

  /** POST /api/pos_settings/create — admin only */
  createSettings: async (payload: CreatePOSSettingsPayload): Promise<POSSettingsResponse> => {
    const { data } = await api.post<POSSettingsResponse>("/api/pos_settings/create", payload);
    return data;
  },

  /** PATCH /api/pos_settings/update — admin only */
  updateSettings: async (payload: UpdatePOSSettingsPayload): Promise<POSSettingsResponse> => {
    const { data } = await api.patch<POSSettingsResponse>("/api/pos_settings/update", payload);
    return data;
  },
};
