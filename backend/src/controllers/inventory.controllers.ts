import db from "../configs/database";
import { Request, Response } from "express"
import { RowDataPacket } from "mysql2"; 


// controller to get end of day/current stock
export const getEndOfDayStock = async (req: Request, res: Response): Promise<void> => {
  try {
    // query database to get all products
    const [productsRows] = await db.query<RowDataPacket[]>("SELECT id, name, price, stock FROM products ORDER BY name ASC");

    if(productsRows.length === 0) {
      res.status(404).json({
        success: false,
        error: "No product found"
      });
      return;
    }

    let totalStockQuantity = 0;
    let grandTotalStockValue = 0;
    const products = [];

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

    res.status(200).json({
      success: true,
      message: "End of day stock fetch successfully!✅",
      report: {
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
