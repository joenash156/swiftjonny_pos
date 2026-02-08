import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { getDashboardSummary } from "../controllers/dashboard.controllers";

const router: Router = express.Router();

// router to get analytics summary
router.get("/", requireAuth, getDashboardSummary)

export default router;