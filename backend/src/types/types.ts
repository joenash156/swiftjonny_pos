export type SaleItemsType = {
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  price: number;
}[]

// export type SalesType = {
//   public_id: string;
//   total: number;
//   payment_method: "cash" | "card" | "mobile";
//   cashier: {
//     name: string;
//     phone: string | null;
//   };
//   items: SaleItemsType[];
//   created_at: Date;
// }[]