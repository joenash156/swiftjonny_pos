import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { updatePOSSettings } from "../controllers/pos.settings.controllers";

const router: Router = express.Router();

// router to change/update pos settings
router.patch("/update", requireAuth, requireAdmin, updatePOSSettings)

export default router;