import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";

const router: Router = express.Router();

// router to get analytics summary
router.get("/summary", requireAuth)

export default router;