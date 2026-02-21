import api from "./api";

export interface Cashier {
  id: string;
  firstname: string;
  lastname: string;
  othername?: string;
  email: string;
  phone?: string | null;
  other_phone?: string | null;
  is_approved: number | boolean;
  role: string;
  last_login_at?: string | null;
  is_profile_complete?: number | boolean;
  created_at?: string;
}

export interface CashiersResponse {
  success: boolean;
  counts: number;
  error: string;
  message: string;
  cashiers?: Cashier[];
}

export interface CashierResponse {
  success: boolean;
  message?: string;
  error?: string;
  cashier?: Cashier;
}

export interface GetCashiersParams {
  is_approved?: boolean;
  search?: string;
  sortBy?: "lastname" | "created_at";
}

export const adminService = {
  // GET /api/admin/cashiers
  getCashiers: async (params?: GetCashiersParams): Promise<CashiersResponse> => {
    const query = new URLSearchParams();
    if (params?.is_approved !== undefined)
      query.set("is_approved", String(params.is_approved));
    if (params?.search) query.set("search", params.search);
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    const { data } = await api.get<CashiersResponse>(
      `/api/admin/cashiers${query.toString() ? `?${query}` : ""}`
    );
    return data;
  },

  // GET /api/admin/cashier/:id
  getCashierById: async (id: string): Promise<CashierResponse> => {
    const { data } = await api.get<CashierResponse>(`/api/admin/cashier/${id}`);
    return data;
  },

  // PATCH /api/admin/cashier/:id/approve
  approveCashier: async (id: string): Promise<CashierResponse> => {
    const { data } = await api.patch<CashierResponse>(
      `/api/admin/cashier/${id}/approve`
    );
    return data;
  },

  // PATCH /api/admin/cashier/:id/disable
  disableCashier: async (id: string): Promise<CashierResponse> => {
    const { data } = await api.patch<CashierResponse>(
      `/api/admin/cashier/${id}/disable`
    );
    return data;
  },

  // DELETE /api/admin/cashier/:id/delete
  deleteCashier: async (id: string): Promise<CashierResponse> => {
    const { data } = await api.delete<CashierResponse>(
      `/api/admin/cashier/${id}/delete`
    );
    return data;
  },

  // PATCH /api/admin/user/:id/update_role
  updateUserRole: async (
    id: string,
    role: "admin" | "cashier"
  ): Promise<CashierResponse> => {
    const { data } = await api.patch<CashierResponse>(
      `/api/admin/user/${id}/update_role`,
      { role }
    );
    return data;
  },
};
