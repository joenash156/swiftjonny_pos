import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { createSale, getSaleDetails, reprintReceipt } from "../controllers/salesControllers";

const router: Router = express.Router();

// router to create a sale
router.post("/create", requireAuth, createSale)

// router to get and reprint receipt
router.get("/:public_id/receipt", requireAuth, reprintReceipt)

// router to get sale details
router.get("/:public_id", requireAuth, getSaleDetails)


export default router;