import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/productsControllers";
import { validateUUID } from "../middlewares/uuidValidation.middleware";

const router: Router = express.Router();

// router to create/insert a product (only executed by admins)
router.post("/create", requireAuth, requireAdmin, createProduct);

// router to get all products
router.get("/get_all", requireAuth, getAllProducts);

// router to get a product by id
router.get("/:id", requireAuth, validateUUID, getProductById);

// router to update a product (only executed by admins)
router.patch("/:id/update", requireAuth, requireAdmin, validateUUID, updateProduct)

// router to delete a product (only executed by admins)
router.delete("/:id/delete", requireAuth, requireAdmin, validateUUID, deleteProduct)

export default router;