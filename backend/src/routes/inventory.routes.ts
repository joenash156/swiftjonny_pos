import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { getEndOfDayStock, adjustStock } from "../controllers/inventory.controllers";

const router: Router = express.Router();

// router to get end of day/current stock
router.get("/stock_report", requireAuth, requireAdmin, getEndOfDayStock);

// router to manually adjust stock for a product (admin only)
router.patch("/:id/adjust", requireAuth, requireAdmin, adjustStock);

export default router;