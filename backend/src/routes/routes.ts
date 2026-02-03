import express, { Router } from "express";
import usersRouter from "./users.routes";
import adminRouter from "./admin.routes";
import categoriesRouter from "./categories.routes";
import productsRouter from "./products.routes";
import salesRouter from "./sales.routes";


const router: Router = express.Router();

router.use("/user", usersRouter);
router.use("/admin", adminRouter);
router.use("/category", categoriesRouter);
router.use("/product", productsRouter)
router.use("/sale", salesRouter)

export default router;