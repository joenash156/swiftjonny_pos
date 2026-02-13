import { Request, Response } from "express"
import { getAnalyticsSummary, getSalesTrend, getTopSellingProducts } from "../services/analytics.service";

// controller to get dashboard summary
export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    // get user id from request user
    const user = req.user;

    // get from and to date from request query params
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

    const userId = user.role === "admin" ? undefined : user.id;

    const [summary, salesTrend, topSellingProducts] = await Promise.all([
      getAnalyticsSummary({ startDate, endDate, userId }),
      getSalesTrend({ startDate, endDate, userId }),
      getTopSellingProducts({ startDate, endDate, userId })
    ]);

    res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully!✅",
      period: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
      summary,
      charts: {
        sales_trend: salesTrend,
        top_selling_products: topSellingProducts
      }
    });

  } catch(err: unknown) {
      console.error("Failed to fetch dashboard summary:", err);
      res.status(500).json({
        success: false,
        error: "Internal server error fetching dashboard summary"
      });
      return;
  }
}

// controller to get revenue comparison
export const getAnalyticRevenueComparison = async (req: Request, res: Response): Promise<void> => {
  try {
    

  } catch(err: unknown) {
      console.error("Failed to fetch revenue comparison:", err);
      res.status(500).json({
        success: false,
        error: "Internal server error fetching revenue comparison"
      });
      return;
  }
}