import db from "../configs/database";
import { Request, Response } from "express"
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { ZodError } from "zod";
import { StockProduct } from "../types/types";
import { adjustStockSchema } from "../validators/inventory.schema";


// controller to get end of day/current stock
export const getEndOfDayStock = async (_req: Request, res: Response): Promise<void> => {
  try {
    // query database to get all products
    const [productsRows] = await db.query<RowDataPacket[]>("SELECT id, name, price, stock FROM products ORDER BY name ASC");

    let totalStockQuantity = 0;
    let grandTotalStockValue = 0;
    const products: StockProduct[] = [];

    for(const product of productsRows) {
      const totalValue = Number(product.price) * Number(product.stock);
      totalStockQuantity += Number(product.stock);
      grandTotalStockValue += totalValue;

      products.push({
        id: product.id,
        name: product.name,
        stock: Number(product.stock),
        unit_price: Number(product.price),
        total_value: Number(totalValue.toFixed(2))
      });
    }

    const reportTime = new Date();

    res.status(200).json({
      success: true,
      message: "End of day stock fetched successfully!✅",
      report: {
        date: reportTime.toISOString(),
        total_products: products.length,
        total_stock_quantity: totalStockQuantity,
        grand_total_stock_value: Number(grandTotalStockValue.toFixed(2)),
        products
      }
    });
    return;

  } catch(err: unknown) {
      console.error("Failed to fetch get current stock:", err);
      res.status(500).json({
        success: false,
        error: "Internal server error fetching current stock"
      });
      return;
  }
}

// controller to manually adjust stock for a product (add or remove units)
export const adjustStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // validate request body
    const { type, quantity, reason } = adjustStockSchema.parse(req.body);

    // fetch current product to check it exists and get current stock
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, name, price, stock FROM products WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Product not found",
      });
      return;
    }

    const product = rows[0]!;
    const currentStock = Number(product.stock);
    let newStock: number;

    if (type === "add") {
      newStock = currentStock + quantity;
    } else {
      // removing — prevent going below zero
      if (quantity > currentStock) {
        res.status(400).json({
          success: false,
          error: `Cannot remove ${quantity} unit(s). Current stock is only ${currentStock}.`,
        });
        return;
      }
      newStock = currentStock - quantity;
    }

    // update stock in database
    await db.query<ResultSetHeader>(
      "UPDATE products SET stock = ? WHERE id = ?",
      [newStock, id]
    );

    res.status(200).json({
      success: true,
      message: `Stock ${type === "add" ? "increased" : "decreased"} successfully.✅`,
      adjustment: {
        product_id: product.id,
        product_name: product.name,
        type,
        quantity,
        reason: reason ?? null,
        previous_stock: currentStock,
        new_stock: newStock,
        unit_price: Number(product.price),
        new_total_value: Number((newStock * Number(product.price)).toFixed(2)),
      },
    });
    return;

  } catch (err: unknown) {
    if (err instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Invalid request data",
        issues: err.issues,
      });
      return;
    }

    console.error("Failed to adjust stock:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error while adjusting stock",
    });
    return;
  }
};