import api from "./api";

export interface SaleItem {
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  price: number;
}

export interface SaleCashier {
  id: string;
  name: string;
  phone: string;
}

export interface Sale {
  public_id: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  payment_method: string;
  status: string;
  voided_at: string | null;
  voided_by: string | null;
  void_reason: string | null;
  cashier: SaleCashier;
  items: SaleItem[];
  created_at: string;
}

export interface SalesStats {
  completed_count: number;
  voided_count: number;
  total_revenue: number;
  total_items_sold: number;
}

export interface GetAllSalesResponse {
  success: boolean;
  counts: number;
  total: number;
  stats: SalesStats;
  message: string;
  sales: Sale[];
}

export interface GetSaleDetailsResponse {
  success: boolean;
  message: string;
  sale: Sale;
}

export interface CreateSaleItem {
  product_id: string;
  quantity: number;
}

export interface CreatedSale {
  public_id: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  payment_method: string;
  status: string;
  cashier: SaleCashier;
  items: SaleItem[];
  receipt_header: string;
  receipt_footer: string;
  created_at: string;
}

export interface CreateSaleResponse {
  success: boolean;
  message: string;
  sale: CreatedSale;
}

export const salesService = {
  getAllSales: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: "ASC" | "DESC";
  }): Promise<GetAllSalesResponse> => {
    const { data } = await api.get<GetAllSalesResponse>("/api/sale/get_all", { params });
    return data;
  },

  getSaleDetails: async (publicId: string): Promise<GetSaleDetailsResponse> => {
    const { data } = await api.get<GetSaleDetailsResponse>(`/api/sale/${publicId}/details`);
    return data;
  },

  createSale: async (payload: {
    payment_method: "cash" | "card" | "mobile";
    items: CreateSaleItem[];
  }): Promise<CreateSaleResponse> => {
    const { data } = await api.post<CreateSaleResponse>("/api/sale/create", payload);
    return data;
  },
};
