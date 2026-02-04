import { z } from "zod";

export const updatePOSSettingsSchema = z.object({
  tax_percent: z
    .number("Tax percent must be a number")
    .positive("Tax percent must be greater than zero")
    .optional(),


  discount_percent: z
    .number("Discount percent must be a number")
    .positive("Discount percent must be greater than zero")
    .optional(),

  receipt_header: z
    .string()
    .trim()
    .min(2, "Receipt header must be at least 2 characters")
    .max(50, "Receipt header must not exceed 50 characters")
    .optional(),
    
  receipt_footer: z
    .string()
    .trim()
    .min(3, "Receipt footer must be at least 3 characters")
    .max(100, "Receipt header must not exceed 100 characters")
    .optional()
})