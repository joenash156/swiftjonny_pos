import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { createCategory } from "../controllers/categoriesControllers";


const router: Router = express.Router();

// router to create/insert a category (only executed by admins)
router.post("/create", requireAuth, requireAdmin, createCategory);


export default router;