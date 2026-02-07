import { Pool, PoolConnection } from "mysql2/promise";

export type SaleItemsType = {
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  price: number;
}[]

export type SaleItem = {
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  price: number;
}

export type SaleReceipt = {
  public_id: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  payment_method: string;
  status: string;
  voided_at: Date;
  voided_by: string;
  void_reason: string;
  cashier: {
    id: string;
    name: string;
    phone: string;
  };
  items: SaleItem[];
  created_at: Date;
}

export type Executor = Pool | PoolConnection;

export type POSSettings = {
  id: string;
  tax_percent: number,
  discount_percent: number,
  receipt_header: string | null,
  receipt_footer: string | null
}

export type AnalyticsParams = {
  startDate: Date;
  endDate: Date;
  userId?: string;
}