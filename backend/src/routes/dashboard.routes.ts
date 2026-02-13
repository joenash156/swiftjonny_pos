import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { getDashboardRevenueComparison, getDashboardSummary } from "../controllers/dashboard.controllers";

const router: Router = express.Router();

// router to get analytics summary
router.get("/", requireAuth, getDashboardSummary);

// router to get analytic revenue comparison
router.get("/revenue_comparison", requireAuth, getDashboardRevenueComparison)

export default router;