import api from "./api";

// ─── Shared param helper ──────────────────────────────────────────────────────

export interface DateRangeParams {
  from: string; // ISO date string "YYYY-MM-DD"
  to: string;
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  total_sales: number;
  total_transactions: number;
  total_items_sold: number;
  average_sale_value: number;
}

export interface SummaryResponse {
  success: boolean;
  message: string;
  period: { start_date: string; end_date: string };
  summary: AnalyticsSummary;
}

// ─── Sales Trend ──────────────────────────────────────────────────────────────

export interface TrendPoint {
  date: string;
  total_sales: number;
}

export interface TrendResponse {
  success: boolean;
  message: string;
  period: { start_date: string; end_date: string };
  trend: TrendPoint[];
}

// ─── Top Products ─────────────────────────────────────────────────────────────

export interface TopProduct {
  product_id: string;
  name: string;
  total_quantity_sold: number;
  total_revenue: number;
}

export interface TopProductsResponse {
  success: boolean;
  message: string;
  period: { start_date: string; end_date: string };
  top_products: TopProduct[];
}

// ─── Revenue Comparison ───────────────────────────────────────────────────────

export interface RevenueComparison {
  today: number;
  yesterday: number;
  difference: number;
  percent_change: number;
}

export interface RevenueComparisonResponse {
  success: boolean;
  message: string;
  comparison: RevenueComparison;
}

// ─── Cashier Performance ──────────────────────────────────────────────────────

export interface CashierPerf {
  id: string;
  name: string;
  total_sales: number;
  total_transactions: number;
  total_items_sold: number;
  average_sale_value: number;
}

export interface CashiersPerformanceResponse {
  success: boolean;
  message: string;
  period: { start_date: string; end_date: string };
  cashiers_performance: CashierPerf[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

const qs = ({ from, to }: DateRangeParams) => `?from=${from}&to=${to}`;

export const analyticsService = {
  // Admin endpoints
  getSummary: async (p: DateRangeParams): Promise<SummaryResponse> => {
    const { data } = await api.get<SummaryResponse>(`/api/analytics/summary${qs(p)}`);
    return data;
  },

  getSalesTrend: async (p: DateRangeParams): Promise<TrendResponse> => {
    const { data } = await api.get<TrendResponse>(`/api/analytics/sales_trend${qs(p)}`);
    return data;
  },

  getTopProducts: async (p: DateRangeParams): Promise<TopProductsResponse> => {
    const { data } = await api.get<TopProductsResponse>(`/api/analytics/top_products${qs(p)}`);
    return data;
  },

  getRevenueComparison: async (): Promise<RevenueComparisonResponse> => {
    const { data } = await api.get<RevenueComparisonResponse>("/api/analytics/revenue_comparison");
    return data;
  },

  getCashiersPerformance: async (p: DateRangeParams): Promise<CashiersPerformanceResponse> => {
    const { data } = await api.get<CashiersPerformanceResponse>(`/api/analytics/cashiers_performance${qs(p)}`);
    return data;
  },

  // Cashier (own data) endpoints
  getMySummary: async (p: DateRangeParams): Promise<SummaryResponse> => {
    const { data } = await api.get<SummaryResponse>(`/api/analytics/my_summary${qs(p)}`);
    return data;
  },

  getMySalesTrend: async (p: DateRangeParams): Promise<TrendResponse> => {
    const { data } = await api.get<TrendResponse>(`/api/analytics/my_sales_trend${qs(p)}`);
    return data;
  },

  getMyTopProducts: async (p: DateRangeParams): Promise<TopProductsResponse> => {
    const { data } = await api.get<TopProductsResponse>(`/api/analytics/my_top_products${qs(p)}`);
    return data;
  },

  getMyRevenueComparison: async (): Promise<RevenueComparisonResponse> => {
    const { data } = await api.get<RevenueComparisonResponse>("/api/analytics/my_revenue_comparison");
    return data;
  },
};
