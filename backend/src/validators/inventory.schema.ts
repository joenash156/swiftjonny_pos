import { z } from "zod";

export const adjustStockSchema = z.object({
  type: z.enum(["add", "remove"], {
     message: "Adjustment type must be 'add' or 'remove'" 
    }),

  quantity: z
    .coerce
    .number()
    .positive("Quantity must be greater than 0"),

  reason: z
    .string()
    .trim()
    .max(255, "Reason cannot exceed 255 characters")
    .optional(),
});
