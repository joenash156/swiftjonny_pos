import db from "../configs/database";
import { Request, Response } from "express"
import { RowDataPacket } from "mysql2";

// controller to get general analytics (only done by admin)
export const getGeneralAnalyticsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    // get date range from request query params
    const { from, to } = req.query;

    let startDate: Date;
    let endDate: Date;

    // validate dates
    const isValidFrom = typeof from === "string" && !isNaN(Date.parse(from));
    const isValidTo = typeof to === "string" && !isNaN(Date.parse(to));

    if(isValidFrom && isValidTo) {
      startDate = new Date(from as string);
      endDate = new Date(to as string);

    } else {
        // default to today if no valid date is provided
        startDate = new Date();
        endDate = new Date();
    }

    // enforce start and end day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999)

    // get total sales and transactions
    const [totalSalesAndTransactions] = await db.query<RowDataPacket[]>("SELECT COALESCE(SUM(total), 0) AS total_sales, COUNT(*) AS total_transactions FROM sales WHERE status = 'completed' AND created_at BETWEEN ? AND ?", [startDate, endDate]);

    // get total items sold
    const [totalItemsSoldRow] = await db.query<RowDataPacket[]>("SELECT COALESCE(SUM(quantity), 0) AS total_items_sold FROM sale_items si JOIN sales s ON s.id = si.sale_id WHERE s.status = 'completed' AND s.created_at BETWEEN ? AND ?", [startDate, endDate]);

    const totalItemsSold = Number(totalItemsSoldRow[0]?.total_items_sold);

    // calculate average sale value
    const totalTransactions = Number(totalSalesAndTransactions[0]?.total_transactions);
    const totalSales = Number(totalSalesAndTransactions[0]?.total_sales);

    const averageSaleValue = totalTransactions > 0 ? Number((totalSales / totalTransactions).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      message: "General analytics summary fetched successfully!✅",
      period: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      },
      summary: {
        total_sales: totalSales,
        total_transactions: totalTransactions,
        total_items_sold: totalItemsSold,
        average_sale_value: averageSaleValue
      }
    })


  } catch(err: unknown) {
      console.error("Failed to fetch general analytics summary:", err);
      res.status(500).json({
        success: false,
        error: "Internal server error fetching general analytics summary"
      });
      return;
  }
}