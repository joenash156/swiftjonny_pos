import db from "../configs/database";
import { Request, Response } from "express"
import { ResultSetHeader, RowDataPacket } from "mysql2"; 
import { ZodError } from "zod";
import { createCategoryShema } from "../validators/category.schema";


// controller to create/insert a category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    // validate request body
    const validatedCategoryData = createCategoryShema.parse(req.body);
    
    const { name, description } = validatedCategoryData;

    // check if category already exists in database
    const [rows] = await db.query<RowDataPacket[]>("SELECT name FROM categories WHERE LOWER(name) = LOWER(?)", [name]);
    
    if(rows.length > 0) {
      res.status(409).json({
        success: false,
        error: "Category already exists"
      });
      return;
    }

    // insert category into database since it does not exist
    await db.query<ResultSetHeader>("INSERT INTO categories (name, description) VALUES (?, ?)", [name, description]);

    res.status(201).json({
      success: true,
      message: "Category created successfully!✅",
      category: {
        name,
        description
      }
    });
    return;

  } catch(err: unknown) {
      if (err instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Invalid request data",
        issues: err.issues,
      });
      return;
    }

    console.error("Failed to create category: ", err);
    res.status(500).json({
      success: false,
      error: "Internal server error while creating category"
    });
    return;
  }
}