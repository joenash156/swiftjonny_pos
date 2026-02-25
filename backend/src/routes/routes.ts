import express, { Router, Request, Response } from "express";
import usersRouter from "./users.routes";
import adminRouter from "./admin.routes";
import categoriesRouter from "./categories.routes";
import productsRouter from "./products.routes";
import salesRouter from "./sales.routes";
import posSettingsRouter from "./pos.settings.routes";
import analyticsRouter from "./analytics.routes";
import dashboardRouter from "./dashboard.routes";
import inventoryRouter from "./inventory.routes";


const router: Router = express.Router();

// testing route
router.get("/", testRoute);

function testRoute(_req: Request, res: Response) {
  res.json({ message: "SwiftJonny POS server is working!" });
}

// main routes
router.use("/user", usersRouter);
router.use("/admin", adminRouter);
router.use("/category", categoriesRouter);
router.use("/product", productsRouter)
router.use("/sale", salesRouter)
router.use("/pos_settings", posSettingsRouter)
router.use("/analytics", analyticsRouter)
router.use("/dashboard", dashboardRouter)
router.use("/inventory", inventoryRouter)

export default router;