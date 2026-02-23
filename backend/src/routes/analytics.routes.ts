import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import {
  getAnalyticsSummaryOfCashier,
  getCashiersPerformance,
  getGeneralAnalyticsSummary,
  getSalesTrendSummary,
  getMySalesTrend,
  getTopProductsSummary,
  getMyTopProducts,
  getRevenueComparisonSummary,
  getMyRevenueComparison,
} from "../controllers/analytics.controllers";

const router: Router = express.Router();

// ─── Admin routes (requireAdmin) ─────────────────────────────────────────────

// general analytics summary
router.get("/summary", requireAuth, requireAdmin, getGeneralAnalyticsSummary);

// sales trend (date range)
router.get("/sales_trend", requireAuth, requireAdmin, getSalesTrendSummary);

// top-selling products (date range)
router.get("/top_products", requireAuth, requireAdmin, getTopProductsSummary);

// revenue comparison — today vs yesterday
router.get("/revenue_comparison", requireAuth, requireAdmin, getRevenueComparisonSummary);

// cashiers performance (date range)
router.get("/cashiers_performance", requireAuth, requireAdmin, getCashiersPerformance);

// ─── Cashier routes (own data only) ──────────────────────────────────────────

// personal analytics summary
router.get("/my_summary", requireAuth, getAnalyticsSummaryOfCashier);

// personal sales trend
router.get("/my_sales_trend", requireAuth, getMySalesTrend);

// personal top-selling products
router.get("/my_top_products", requireAuth, getMyTopProducts);

// personal revenue comparison — today vs yesterday
router.get("/my_revenue_comparison", requireAuth, getMyRevenueComparison);

export default router;