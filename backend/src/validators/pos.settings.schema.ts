import { z } from "zod";

export const createPOSSettingsSchema = z.object({
  tax_percent: z
    .coerce
    .number("Tax percent must be a number")
    .min(0, "Tax percent must be 0 or greater")
    .max(100, "Tax percent must not exceed 100")
    .default(0),

  discount_percent: z
    .coerce
    .number("Discount percent must be a number")
    .min(0, "Discount percent must be 0 or greater")
    .max(100, "Discount percent must not exceed 100")
    .default(0),

  receipt_header: z
    .string()
    .trim()
    .min(2, "Receipt header must be at least 2 characters")
    .max(50, "Receipt header must not exceed 50 characters"),
    
  receipt_footer: z
    .string()
    .trim()
    .min(3, "Receipt footer must be at least 3 characters")
    .max(100, "Receipt footer must not exceed 100 characters")
})

export const updatePOSSettingsSchema = z.object({
  tax_percent: z
    .coerce
    .number("Tax percent must be a number")
    .min(0, "Tax percent must be 0 or greater")
    .max(100, "Tax percent must not exceed 100")
    .optional(),


  discount_percent: z
    .coerce
    .number("Discount percent must be a number")
    .min(0, "Discount percent must be 0 or greater")
    .max(100, "Discount percent must not exceed 100")
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
    .max(100, "Receipt footer must not exceed 100 characters")
    .optional()
})