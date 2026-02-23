import { RowDataPacket } from "mysql2";
import { SaleItem, SaleReceipt, Executor } from "../types/types";

interface User {
  id: string;
  role: "admin" | "cashier";
}


// function to get sale receipt data
export async function getSaleReceiptData(executor: Executor, public_id: string, reqUser: User): Promise<SaleReceipt> {

  const { id: userId, role } = reqUser;

  // fetch the sale
  const saleQuery =
    role === "admin"
      ? `SELECT s.id, s.public_id, s.subtotal, s.tax_amount, s.discount_amount, s.total, s.payment_method, s.status, s.voided_at, s.voided_by, s.void_reason, s.created_at,
              u.id AS cashier_id, u.firstname AS cashier_firstname, u.lastname AS cashier_lastname, u.phone AS cashier_phone,
              vu.firstname AS voided_by_firstname, vu.lastname AS voided_by_lastname
         FROM sales s
         JOIN users u ON u.id = s.user_id
         LEFT JOIN users vu ON vu.id = s.voided_by
         WHERE s.public_id = ?`
      : `SELECT s.id, s.public_id, s.subtotal, s.tax_amount, s.discount_amount, s.total, s.payment_method, s.status, s.voided_at, s.voided_by, s.void_reason, s.created_at,
              u.id AS cashier_id, u.firstname AS cashier_firstname, u.lastname AS cashier_lastname, u.phone AS cashier_phone,
              vu.firstname AS voided_by_firstname, vu.lastname AS voided_by_lastname
         FROM sales s
         JOIN users u ON u.id = s.user_id
         LEFT JOIN users vu ON vu.id = s.voided_by
         WHERE s.public_id = ? AND s.user_id = ?`;

  const saleParams = role === "admin" ? [public_id] : [public_id, userId];

  const [saleRows] = await executor.query<RowDataPacket[]>(saleQuery, saleParams);

  if (saleRows.length === 0) {
    throw new Error("Sale not found or access denied");
  }

  const saleRow = saleRows[0]!;

  // fetch the sale items
  const [saleItemsRows] = await executor.query<RowDataPacket[]>(
    "SELECT product_id, product_name, product_price, quantity, price FROM sale_items WHERE sale_id = ?",
    [saleRow.id]
  );

  if (saleItemsRows.length === 0) {
    throw new Error("No items found for this sale");
  }

  // sanitize prices
  const saleItems: SaleItem[] = saleItemsRows.map((item) => ({
    product_id: item.product_id,
    product_name: item.product_name,
    product_price: Number(item.product_price),
    quantity: item.quantity,
    price: Number(item.price),
  }));

  return {
    public_id: saleRow.public_id,
    subtotal: Number(saleRow.subtotal),
    tax_amount: Number(saleRow.tax_amount),
    discount_amount: Number(saleRow.discount_amount),
    total: Number(saleRow.total),
    payment_method: saleRow.payment_method,
    status: saleRow.status,
    voided_at: saleRow.voided_at ?? null,
    voided_by: saleRow.voided_by ?? null,
    voided_by_name: saleRow.voided_by
      ? `${saleRow.voided_by_firstname ?? ""} ${saleRow.voided_by_lastname ?? ""}`.trim() || null
      : null,
    void_reason: saleRow.void_reason ?? null,
    cashier: {
      id: saleRow.cashier_id,
      name: `${saleRow.cashier_firstname} ${saleRow.cashier_lastname}`,
      phone: saleRow.cashier_phone,
    },
    items: saleItems,
    created_at: new Date(saleRow.created_at),
  };
}
