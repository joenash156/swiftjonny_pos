import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { createSale, reprintReceipt } from "../controllers/salesControllers";

const router: Router = express.Router();

// router to create a sale
router.post("/create", requireAuth, createSale)

// router to get and reprint receipt
router.get("/:public_id/receipt", requireAuth, reprintReceipt)


export default router;