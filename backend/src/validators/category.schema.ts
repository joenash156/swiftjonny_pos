import { z } from "zod";
import { capitalizeName } from "../utils/normalize";


export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(200, "Category name cannot exceed 20 characters")
    .transform(capitalizeName),
  
  description: z
    .string()
    .trim()
    .min(2, "Category description must be at least 2 characters")
    .max(300, "Category description cannot exceed 300 characters")
    .optional()
});

export const updateCategorySchema = z.object({
   name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(200, "Category name cannot exceed 200 characters")
    .transform(capitalizeName)
    .optional(),
  
  description: z
    .string()
    .trim()
    .min(2, "Category description must be at least 2 characters")
    .max(300, "Category description cannot exceed 300 characters")
    .optional()
})

