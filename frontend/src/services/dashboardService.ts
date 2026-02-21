import api from "./api";

export type PeriodPreset = "today" | "week" | "month" | "all";

export interface DashboardSummary {
  total_sales: number;
  total_transactions: number;
  total_items_sold: number;
  average_sale_value: number;
}

export interface SalesTrendPoint {
  date: string;
  total_sales: number;
}

export interface TopProduct {
  product_id: string;
  name: string;
  total_quantity_sold: number;
  total_revenue: number;
}

export interface DashboardResponse {
  success: boolean;
  period: { start_date: string; end_date: string };
  summary: DashboardSummary;
  charts: {
    sales_trend: SalesTrendPoint[];
    top_selling_products: TopProduct[];
  };
}

export interface RevenueComparison {
  today: number;
  yesterday: number;
  difference: number;
  percent_change: number;
}

export interface RevenueComparisonResponse {
  success: boolean;
  revenue_comparison: RevenueComparison;
}

function isoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function getDateRangeForPeriod(period: PeriodPreset): { from: string; to: string } {
  const now = new Date();

  if (period === "today") {
    const d = isoDate(now);
    return { from: d, to: d };
  }

  if (period === "week") {
    const day = now.getDay(); // 0=Sunday
    const diff = day === 0 ? -6 : 1 - day; // Monday is start
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    return { from: isoDate(monday), to: isoDate(now) };
  }

  if (period === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: isoDate(from), to: isoDate(now) };
  }

  // all — from a far-past date to today
  return { from: "2000-01-01", to: isoDate(now) };
}

export const dashboardService = {
  getSummary: async (period: PeriodPreset): Promise<DashboardResponse> => {
    const { from, to } = getDateRangeForPeriod(period);
    const { data } = await api.get<DashboardResponse>("/api/dashboard", {
      params: { from, to },
    });
    return data;
  },

  getRevenueComparison: async (): Promise<RevenueComparisonResponse> => {
    const { data } = await api.get<RevenueComparisonResponse>(
      "/api/dashboard/revenue_comparison"
    );
    return data;
  },
};
