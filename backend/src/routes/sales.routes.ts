import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { createSale, getAllSales, getSaleDetails, reprintReceipt, reverseSale } from "../controllers/sales.controllers";
import { posLimiter } from "../configs/rateLimiter";

const router: Router = express.Router();

// router to create a sale
router.post("/create", requireAuth, posLimiter, createSale)

// router to get and reprint receipt
router.get("/:public_id/receipt", requireAuth, posLimiter, reprintReceipt)

// router to get sale details
router.get("/:public_id/details", requireAuth, posLimiter, getSaleDetails)

// router to get all sales
router.get("/get_all", requireAuth, posLimiter, getAllSales)

// router to reverse/void sale
router.patch("/:public_id/void", requireAuth, posLimiter, reverseSale)


export default router;