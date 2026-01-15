import express, { Router } from "express";
import { requireAdmin } from "../middlewares/role.middleware";
import { requireAuth } from "../middlewares/auth.middleware";
import { approveCashier, deleteCashier, disableCashier, getAllCashiers, getCashierById, updateUserRole } from "../controllers/adminControllers";
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

// router to disable/dispprove a cashier by id (only executed by admins)
router.delete("/cashier/:id/delete", requireAuth, requireAdmin, validateUUID, deleteCashier);

// router to update a user's role (only executed by admins)
router.patch("/user/:id/update_role", requireAuth, requireAdmin, validateUUID, updateUserRole);



export default router;