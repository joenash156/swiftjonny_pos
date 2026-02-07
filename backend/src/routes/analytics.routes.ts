import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { getAnalyticsSummaryOfCashier, getGeneralAnalyticsSummary } from "../controllers/analytics.controllers";

const router: Router = express.Router();

// router to get analytics summary
router.get("/summary", requireAuth, requireAdmin, getGeneralAnalyticsSummary)

// router to get analytics summary of specific cashier
router.get("/my_summary", requireAuth, getAnalyticsSummaryOfCashier);

export default router;