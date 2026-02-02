import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { createSale, getAllSales, getSaleDetails, reprintReceipt, reverseSale } from "../controllers/salesControllers";

const router: Router = express.Router();

// router to create a sale
router.post("/create", requireAuth, createSale)

// router to get and reprint receipt
router.get("/:public_id/receipt", requireAuth, reprintReceipt)

// router to get sale details
router.get("/:public_id/details", requireAuth, getSaleDetails)

// router to get all sales
router.get("/get_all", requireAuth, getAllSales)

// router to reverse/void sale
router.patch("/:public_id/void", requireAuth, reverseSale)


export default router;