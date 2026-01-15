import express, { Router } from "express";
import { requireAdmin } from "../middlewares/role.middleware";
import { requireAuth } from "../middlewares/auth.middleware";
import { approveCashier, disableCashier, getAllCashiers, getCashierById } from "../controllers/adminControllers";
import { validateUUID } from "../middlewares/uuidValidation.middleware";

const router: Router = express.Router();

// router to get all cashiers (only executed by admins)
router.get("/cashiers", requireAuth, requireAdmin, getAllCashiers);

// router to get a cashier by id (only executed by admins)
router.get("/cashier/:id", requireAuth, requireAdmin, validateUUID, getCashierById);

// router to approve a cashier by id (only executed by admins)
router.patch("/cashier/:id/approve", requireAuth, requireAdmin, validateUUID, approveCashier);

// router to disable/dispprove a cashier by id (only executed by admins)
router.patch("/cashier/:id/disable", requireAuth, requireAdmin, validateUUID, disableCashier);


export default router;