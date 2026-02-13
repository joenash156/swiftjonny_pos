import express, { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/products.controllers";
import { validateUUID } from "../middlewares/uuidValidation.middleware";
import { requireUploadType } from "../middlewares/requireUploadType.middleware";
import upload from "../middlewares/uploads.middleware";

const router: Router = express.Router();

// router to create/insert a product (only executed by admins)
router.post("/create", requireAuth, requireAdmin, requireUploadType("product"), upload.single("product"), createProduct);

// router to get all products
router.get("/get_all", requireAuth, getAllProducts);

// router to get a product by id
router.get("/:id", requireAuth, validateUUID, getProductById);

// router to update a product (only executed by admins) Todo: [Make changes]
router.patch("/:id/update", requireAuth, requireAdmin, validateUUID, requireUploadType("product"), upload.single("product"), updateProduct)

// router to delete a product (only executed by admins)
router.delete("/:id/delete", requireAuth, requireAdmin, validateUUID, deleteProduct)

export default router;