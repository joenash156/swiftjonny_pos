import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { getAnalyticsSummaryOfCashier, getCashiersPerformance, getGeneralAnalyticsSummary } from "../controllers/analytics.controllers";

const router: Router = express.Router();

// router to get analytics summary
router.get("/summary", requireAuth, requireAdmin, getGeneralAnalyticsSummary)

// router to get analytics summary of specific cashier
router.get("/my_summary", requireAuth, getAnalyticsSummaryOfCashier);

// router to get cashiers performance
router.get("/cashiers_performance", requireAuth, requireAdmin, getCashiersPerformance);

export default router;