import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { getGeneralAnalyticsSummary } from "../controllers/analytics.controllers";

const router: Router = express.Router();

// router to get analytics summary
router.get("/summary", requireAuth, requireAdmin, getGeneralAnalyticsSummary)

export default router;