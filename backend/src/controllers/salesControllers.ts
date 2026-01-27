import db from "../configs/database";
import { Request, Response } from "express"
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ZodError } from "zod";
import { generatePublicId } from "../utils/publicID";
import { createSaleSchema } from "../validators/sales.schema";
import { v4 as uuid } from "uuid";
import { SaleItemsType } from "../types/types";


// controller to create sales
export const createSale = async (req: Request, res: Response): Promise<void> => {

  const connection = await db.getConnection();

  try {
    // get authenticated user id from
    const userId = req.user.id;

    // validate data/inputs from request body
    const validatedSaleData = createSaleSchema.parse(req.body);
    const { payment_method, items } = validatedSaleData;

    // start database transaction
    await connection.beginTransaction();

    // extract product IDs from items
    const productIDs: string[] = [];
    
    for (const item of items) {
      productIDs.push(item.product_id)
    }

    // fetch products from database
    const [products] = await connection.query<RowDataPacket[]>("SELECT id, name, price, stock FROM products WHERE id IN (?)", [productIDs]);

    // check if products exist
    if(products.length === 0) {
      res.status(404).json({
        success: false,
        error: "No product exists to create sale"
      });
      return;
    }

    // create a map: product_id -> quantity
    const itemQuantityMap = new Map<string, number>();

    for (const item of items) {
      itemQuantityMap.set(item.product_id, item.quantity);
    }

    // ensure all requested products exist
    if (products.length !== itemQuantityMap.size) {
      res.status(400).json({
        success: false,
        error: "One or more products do not exist",
      });
      return;
    }

    let saleTotal = 0;

    const saleItems: SaleItemsType = [];

    // validate stock & calculate totals
    for (const product of products) {
      const quantity = itemQuantityMap.get(product.id)!;

      if (product.stock < quantity) {
        res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}`,
        });
        return;
      }

      const itemTotalPrice = Number(product.price) * quantity;

      saleTotal += itemTotalPrice;

      saleItems.push({
        product_id: product.id,
        product_name: product.name,
        product_price: Number(product.price),
        quantity,
        price: itemTotalPrice,
      });
    }

    // get sales id and generate a public id for the sale
    const publicId = await generatePublicId();
    const saleId = uuid();

    // insert sales into database
    await connection.query<ResultSetHeader>("INSERT INTO sales (id, user_id, public_id, total, payment_method) VALUES (?, ?, ?, ?, ?)", [saleId, userId, publicId, saleTotal, payment_method]);

    // prepare bulk insert for sale_items
    const saleItemsValues = saleItems.map((item) => [saleId, item.product_id, item.product_name, item.product_price, item.quantity, item.price]);

    // bulk insert sale items
    await connection.query<ResultSetHeader>("INSERT INTO sale_items (sale_id, product_id, product_name, product_price, quantity, price) VALUES ?", [saleItemsValues]);
    

    // deduct the product stock
    for(const saleItem of saleItems) {
      await connection.query<ResultSetHeader>("UPDATE products SET stock = stock - ? WHERE id = ?", [saleItem.quantity, saleItem.product_id]);   
    }

    const [saleRows] = await connection.query<RowDataPacket[]>("SELECT s.created_at, u.firstname AS cashier_firstname, u.lastname AS cashier_lastname, u.phone AS cashier_phone FROM sales s JOIN users u ON u.id = s.user_id WHERE s.id = ?", [saleId]);

    // commit everything to database if successful
    await connection.commit();

    // return success response
    res.status(201).json({
      success: true,
      message: "Sale created successfully!✅",
      sale: {
        id: saleId,
        public_id: publicId,
        total: Number(saleTotal),
        payment_method,
        cashier: {
          name: `${saleRows[0]!.cashier_firstname} ${saleRows[0]!.cashier_lastname}`,
          phone: saleRows[0]!.cashier_phone,
        },
        items: saleItems,
        created_at: saleRows[0]?.created_at || new Date()
      }
    });
    return;

  } catch(err: unknown) {
      // rollback transaction if it was started
      await connection.rollback();

      // check if the error comes from zod
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          issues: err.issues,
        });
        return;
      } 

      console.error("Failed to create sale: ", err);
      res.status(500).json({
        success: false,
        error: "Internal server error whiles creating sale!"
      });
      return
  } finally {
    connection.release();
  }
}

// controller to reprint receipt
export const reprintReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: userId, role } = req.user;
    const { public_id } = req.params;

    if (!public_id || typeof public_id !== "string") {
      res.status(400).json({
        success: false,
        error: "Valid public id is required!",
      });
      return;
    }

    
    // admins can fetch any sale, cashiers can fetch only their own sale
    const saleQuery =
      role === "admin"
        ? `SELECT s.id, s.public_id, s.total, s.payment_method, s.created_at, u.firstname AS cashier_firstname, u.lastname AS cashier_lastname, u.phone AS cashier_phone FROM sales s JOIN users u ON u.id = s.user_id WHERE s.public_id = ?`

        : `SELECT s.id, s.public_id, s.total, s.payment_method, s.created_at, u.firstname AS cashier_firstname, u.lastname AS cashier_lastname, u.phone AS cashier_phone FROM sales s JOIN users u ON u.id = s.user_id WHERE s.public_id = ? AND s.user_id = ?`;

    const saleParams = role === "admin" ? [public_id] : [public_id, userId];

    const [saleRows] = await db.query<RowDataPacket[]>(saleQuery, saleParams);

    if (saleRows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Sale not found!",
      });
      return;
    }

    // fetch sale items
    const [saleItems] = await db.query<RowDataPacket[]>(`SELECT product_name, product_price, quantity, price FROM sale_items WHERE sale_id = ?`, [saleRows[0]!.id]);

    if (saleItems.length === 0) {
      res.status(404).json({
        success: false,
        error: "No items found with this sale!",
      });
      return;
    }

    // return receipt-ready data
    res.status(200).json({
      success: true,
      message: "Receipt ready for printing!✅",
      sale: {
        public_id: saleRows[0]!.public_id,
        total: Number(saleRows[0]!.total),
        payment_method: saleRows[0]!.payment_method,
        cashier: {
          name: `${saleRows[0]!.cashier_firstname} ${saleRows[0]!.cashier_lastname}`,
          phone: saleRows[0]!.cashier_phone,
        },
        items: saleItems,
        created_at: saleRows[0]!.created_at,
      }
    });
    return;

  } catch (err: unknown) {
    console.error("Failed to reprint receipt:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching receipt!",
    });
    return;
  }
};
