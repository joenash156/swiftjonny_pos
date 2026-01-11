import { hashItem } from "../utils/hashing"
import db from "../configs/database";
import { Request, Response } from "express"
import { ResultSetHeader, RowDataPacket } from "mysql2";
//import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { createUserSchema } from "../validators/user.schema";
import { ZodError } from "zod";

// controller to create/insert/signup new user
export const createUser = async (req: Request, res:Response): Promise<void> => {

  try {

    // get user inputs from the request body
    const validatedUserData = createUserSchema.parse(req.body);
    
    const { firstname, lastname, othername, email, password } = validatedUserData;

    // check if there is a user with this email
    const [existingUsers] = await db.query<RowDataPacket[]>("SELECT email from users WHERE email = ?", [email]);

    // fail if email is used
    if(existingUsers.length > 0) {
      res.status(409).json({
        success: false,
        error: "A user with this email already exists!"
      });
      return;
    }

    // get user id and hashed password
    const hashedPassword = await hashItem(password);
    
    // insert user into the database
    await db.query<ResultSetHeader>("INSERT INTO users (firstname, lastname, othername, email, password_hash) VALUES (?, ?, ?, ?, ?)", [firstname, lastname, othername ?? null, email, hashedPassword]);

    // return user initial user info
    res.status(201).json({
      success: true,
      message: "User created successfully!✅", 
      user: {
        firstname,
        lastname,
        othername,
        email,
        role: "cashier"
      }
    });
    return;

  } catch(err: unknown) {
      // check if the error comes from zod
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Invalid request data",
          issues: err.issues,
        });
        return;
      } 

      console.error("Failed to create user: ", err);
      res.status(500).json({
        success: false,
        error: "Failed to create user. Internal server error!"
      });
      return
  }
  
}

// controller to login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  
}
