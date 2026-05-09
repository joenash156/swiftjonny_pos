import { z } from "zod";
import { isUUID } from "../utils/checkID";

export const createSaleSchema = z.object({
  payment_method: z
    .enum(["cash", "card", "mobile"]),

  items: z
    .array(
      z.object({
        product_id: z
          .string()
          .refine((id) => isUUID(id), { message: "Invalid product ID" }),

        quantity: z
          .number()
          .positive("Quantity must be greater than 0"),
      })
    )
    .min(1, "At least one product is required"),
});

export const voidSaleSchema = z.object({
  void_reason: z
    .string()
    .trim()
    .min(3, "Reason must be at least 3 characters (eg. Wrong item scanned)")
})