import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { getEndOfDayStock } from "../controllers/inventory.controllers";

const router: Router = express.Router();

// router to get end of day/current stock
router.get("/stock_report", requireAuth, requireAdmin, getEndOfDayStock);

export default router;