import db from "../configs/database";
import { Request, Response } from "express"
import { ResultSetHeader, RowDataPacket } from "mysql2";


// controller to get all cashiers
export const getAllCashiers = async (req: Request, res: Response): Promise<void> => {
  try {
    // make sure only admins can access the controller/endpoint/route
    const userRole = req.user.role;

    // check if role exists
    if(!userRole || userRole !== "admin") {
      res.status(403).json({
        success: false,
        error: "Unauthorized users and/or cashiers cannot view all cashiers"
      });
      return;
    }

    const { is_approved } = req.query;

    const [cashiers] = await db.query<RowDataPacket[]>("SELECT firstname, lastname, othername, email, phone, other_phone, is_approved, role, last_login_at, is_profile_complete, created_at FROM users WHERE role = cashier");

    if(cashiers.length === 0) {
      res.status(200).json({
        success: true,
        counts: cashiers.length,
        message: "No cashier found!✅"
      });
      return;
    }

    res.status(200).json({
      success: true,
      counts: cashiers.length,
      message: "All cashiers found!✅",
      cashiers
    });
    return;

  } catch(err: unknown) {
      console.error("Failed fetching all cashiers: ", err);
      res.status(500).json({
        success: false,
        error: "Failed fetching all cashiers. Internal server error!"
      })
  }
}