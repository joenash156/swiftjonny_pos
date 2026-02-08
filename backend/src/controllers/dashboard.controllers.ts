import { Request, Response } from "express"
import { getAnalyticsSummary } from "../services/analytics.service";

// controller to get dashboard summary
export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    // get user id from request user
    const user = req.user;

    // get from and to date from request query paramss
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

    const summary = await getAnalyticsSummary({ startDate, endDate, userId: user.role === "admin" ? undefined : user.id });

    res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully!✅",
      period: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
      summary,
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