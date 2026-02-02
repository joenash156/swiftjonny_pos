import db from "../configs/database";
import { Request, Response } from "express"
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ZodError } from "zod";
import { generatePublicId } from "../utils/publicID";
import { createSaleSchema, voidSaleSchema } from "../validators/sales.schema";
import { v4 as uuid } from "uuid";
import { SaleItemsType } from "../types/types";
import { getSaleReceiptData } from "../services/sales.service";

interface User {
  id: string;
  role: "admin" | "cashier";
}

// controller to create sales
export const createSale = async (req: Request, res: Response): Promise<void> => {

  const connection = await db.getConnection();

  try {
    // get authenticated user id from
    const userId: string = req.user.id;

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
      await connection.rollback();

      res.status(404).json({
        success: false,
        error: ""
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
      await connection.rollback();

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
        await connection.rollback();

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

    const [saleRows] = await connection.query<RowDataPacket[]>("SELECT s.created_at, s.status, u.firstname AS cashier_firstname, u.lastname AS cashier_lastname, u.phone AS cashier_phone FROM sales s JOIN users u ON u.id = s.user_id WHERE s.id = ?", [saleId]);

    // commit everything to database if successful
    await connection.commit();

    // sanitize sales items (eg. to get the price not in string but number)
    const sanitizedSaleItems = saleItems.map((saleItem) => ({
      ...saleItem,
      product_price: Number(saleItem.product_price),
      price: Number(saleItem.price)
    }))

    // return success response
    res.status(201).json({
      success: true,
      message: "Sale created successfully!✅",
      sale: {
        id: saleId,
        public_id: publicId,
        total: Number(saleTotal),
        payment_method,
        status: saleRows[0]?.status,
        cashier: {
          name: `${saleRows[0]!.cashier_firstname} ${saleRows[0]!.cashier_lastname}`,
          phone: saleRows[0]!.cashier_phone,
        },
        items: sanitizedSaleItems,
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
    // get public id of sale
    const { public_id } = req.params;

    if (!public_id || typeof public_id !== "string") {
      res.status(400).json({
        success: false,
        error: "Valid public id is required!",
      });
      return;
    }

    const sale = await getSaleReceiptData(db, public_id, req.user)
    
    res.status(200).json({
      success: true,
      message: "Receipt ready for printing! ✅",
      sale,
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

// controller to get sale details by public id
export const getSaleDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    // get the public of sale
    const { public_id } = req.params;
    const { id: userId, role }: User = req.user;

    if (!public_id || typeof public_id !== "string") {
      res.status(400).json({
        success: false,
        error: "Valid public id is required!",
      });
      return;
    }

    const sale = await getSaleReceiptData(db, public_id, {id: userId, role});

    res.status(200).json({
      success: true,
      message: "Sale details fetched successfully!✅",
      sale,
    });
    return;

  } catch(err: unknown) {
      console.error("Failed to get sale details:", err);
      res.status(500).json({
        success: false,
        error: "Internal server error while fetching sale details!",
      });
      return;
  }
}

// controller to get all sales
export const getAllSales = async (req: Request, res: Response): Promise<void> => {
  try {
    // get user id and role
    const { id: userId, role }: User = req.user;
     // get request query params
    const { search, sortBy, order, page, limit } = req.query;

    let query =
      role === "admin"
      ? `SELECT s.id, s.public_id, s.total, s.payment_method, s.status, s.voided_at, s.voided_by, s.void_reason, s.created_at, u.firstname AS cashier_firstname, u.lastname AS cashier_lastname, u.phone AS cashier_phone
         FROM sales s
         JOIN users u ON u.id = s.user_id`
      : `SELECT s.id, s.public_id, s.total, s.payment_method, s.status, s.voided_at, s.voided_by, s.void_reason, s.created_at, u.firstname AS cashier_firstname, u.lastname AS cashier_lastname, u.phone AS cashier_phone
         FROM sales s
         JOIN users u ON u.id = s.user_id
         WHERE s.user_id = ?`;

    const params: (string | number)[] = [];

    if(role !== "admin") {
      params.push(userId)
    }

    // search by cashier firstname (case-insensitive)
    if (search && typeof search === "string") {
      query += " LOWER(u.firstname) LIKE ?";
      params.push(`%${search.toLowerCase()}%`);
    }

    // whitelist sorting columns
    let sortColumn = "s.created_at";

    if (sortBy === "cashier_firstname") sortColumn = "u.firstname";
    if (sortBy === "cashier_lastname") sortColumn = "u.lastname";
    if (sortBy === "total") sortColumn = "s.total";

    // sorting order (ASC or DESC)
    const sortOrder =
      typeof order === "string" && order.toUpperCase() === "DESC"
        ? "DESC"
        : "ASC";

    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    // pagination (page-based)
    const pageNumber = typeof page === "string" && Number(page) > 0 ? Number(page) : 1;
    const pageLimit = typeof limit === "string" && Number(limit) > 0 && Number(limit) <= 100 ? Number(limit) : 20;
    const offset = (pageNumber - 1) * pageLimit;

    query += " LIMIT ? OFFSET ?";
    params.push(pageLimit, offset);

    const [saleRows] = await db.query<RowDataPacket[]>(query, params)

    if(saleRows.length === 0) {
      res.status(200).json({
        success: true,
        counts: 0,
        message: "No sales found!",
        sales: []
      });
      return;
    }

    // get all sale ids into one array
    const saleIds: string[] = saleRows.map((sale) => sale.id);

    // fetch all associated sale items of the sales
    const [saleItemsRows] = await db.query<RowDataPacket[]>("SELECT sale_id, product_name, product_price, quantity, price FROM sale_items WHERE sale_id IN (?)", [saleIds]);

    if(saleItemsRows.length === 0) {
      res.status(404).json({
        success: true,
        message: "No items found with this sale!",
      });
      return;
    }

    const saleItemsMap: Record<string, SaleItemsType> = {};

    // initialize
    saleIds.forEach((id) => saleItemsMap[id] = []);

    // push items into map
    saleItemsRows.forEach((saleItem) => {
      saleItemsMap[saleItem.sale_id]!.push({
        product_id: saleItem.product_id,
        product_name: saleItem.product_name,
        product_price: Number(saleItem.product_price),
        quantity: saleItem.quantity,
        price: Number(saleItem.price)
      });
    });

    const sales = saleRows.map(sale => ({
      public_id: sale.public_id as string,
      total: Number(sale.total),
      payment_method: sale.payment_method,
      status: sale.status,
      voided_at: sale.voided_at,
      voided_by: sale.voided_by,
      void_reason: sale.void_reason,
      cashier: {
        name: `${sale.cashier_firstname} ${sale.cashier_lastname}`,
        phone: sale.cashier_phone,
      },
      items: saleItemsMap[sale.id] || [],
      created_at: sale.created_at
    }));

    res.status(200).json({
      success: true,
      counts: saleRows.length,
      message: "Sales fetched successfully!✅",
      sales: sales
    });
    return;

  } catch(err: unknown) {
      console.error("Failed to get all sales:", err);
      res.status(500).json({
        success: false,
        error: "Internal server error while fetching all sales!",
      });
      return;
  }
}

// controller to reverse/void sale
export const reverseSale = async (req: Request, res: Response): Promise<void> => {

   const connection = await db.getConnection();

  try {
    // get the public id of sale
    const { public_id } = req.params;

    // get validated request body if any
    const validatedSaleData = voidSaleSchema.parse(req.body);
    const { void_reason } = validatedSaleData;

    if (!public_id || typeof public_id !== "string") {
      res.status(400).json({
        success: false,
        error: "Valid public id is required!",
      });
      return;
    }

    // start initiate db transaction
    await connection.beginTransaction()

    const sale = await getSaleReceiptData(connection, public_id, req.user);

    if(sale.status === "voided") {
      await connection.rollback();
      
      res.status(409).json({
        success: false,
        error: "Sale is already voided!"
      });
      return;
    }

    // update  stock by adding quantity in sale back to stock
    for(const item of sale.items) {
      await connection.query<ResultSetHeader>("UPDATE products SET stock = stock + ? WHERE id = ?", [item.quantity, item.product_id]);
    }

    const voided_at = new Date()

    // update sale status
    const [result] = await connection.query<ResultSetHeader>("UPDATE sales SET status = ?, voided_at = ?, voided_by = ?, void_reason = ? WHERE public_id = ?", ["voided", voided_at, req.user.id, void_reason || null, public_id]);

    if(result.affectedRows === 0) {
      throw new Error("Failed to void sale!")
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Voided sale successfully✅. You can create a new sale!",
      sale: {
        public_id,
        status: "voided",
        voided_by: req.user.id,
        void_reason,
        voided_at,
      }
    });
    return;

  } catch(err: unknown) {

      await connection.rollback()

      // check if the error comes from zod
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          issues: err.issues,
        });
        return;
      } 

      console.error("Failed to reverse sale:", err);
      res.status(500).json({
        success: false,
        error: "Internal server error reversing sale"
      })
  } finally {
    connection.release();
  }
}