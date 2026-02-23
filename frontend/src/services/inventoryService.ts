import api from "./api";

export interface StockProduct {
  id: string;
  name: string;
  stock: number;
  unit_price: number;
  total_value: number;
}

export interface StockReport {
  date: string;
  total_products: number;
  total_stock_quantity: number;
  grand_total_stock_value: number;
  products: StockProduct[];
}

export interface StockReportResponse {
  success: boolean;
  message: string;
  report: StockReport;
}

export interface AdjustStockRequest {
  type: "add" | "remove";
  quantity: number;
  reason?: string;
}

export interface AdjustStockAdjustment {
  product_id: string;
  product_name: string;
  type: "add" | "remove";
  quantity: number;
  reason: string | null;
  previous_stock: number;
  new_stock: number;
  unit_price: number;
  new_total_value: number;
}

export interface AdjustStockResponse {
  success: boolean;
  message: string;
  adjustment: AdjustStockAdjustment;
}

export const inventoryService = {
  /** GET /api/inventory/stock_report — returns current stock snapshot */
  getStockReport: async (): Promise<StockReportResponse> => {
    const { data } = await api.get<StockReportResponse>("/api/inventory/stock_report");
    return data;
  },

  /** PATCH /api/inventory/:id/adjust — manually add or remove stock units */
  adjustStock: async (productId: string, payload: AdjustStockRequest): Promise<AdjustStockResponse> => {
    const { data } = await api.patch<AdjustStockResponse>(`/api/inventory/${productId}/adjust`, payload);
    return data;
  },
};
