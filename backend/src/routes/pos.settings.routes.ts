import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { createPOSSettings, getActivePOSSettings, updatePOSSettings } from "../controllers/pos.settings.controllers";

const router: Router = express.Router();

// router to create POS settings (done at once)
router.post("/create", requireAuth, requireAdmin, createPOSSettings);

// router to change/update POS settings
router.patch("/update", requireAuth, requireAdmin, updatePOSSettings)

// get active POS settings
router.get("/", requireAuth, getActivePOSSettings);

export default router;