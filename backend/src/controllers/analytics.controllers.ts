import { Request, Response } from "express"
import { getAnalyticsSummary } from "../services/analytics.service";

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

    const summary = await getAnalyticsSummary({ startDate, endDate })

    res.status(200).json({
      success: true,
      message: "General analytics summary fetched successfully!✅",
      period: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      },
      summary
    });
    return;

  } catch(err: unknown) {
      console.error("Failed to fetch general analytics summary:", err);
      res.status(500).json({
        success: false,
        error: "Internal server error fetching general analytics summary"
      });
      return;
  }
}

// controller to get analytics of specific cashier
export const getAnalyticsSummaryOfCashier = async (req: Request, res: Response): Promise<void> => {
  try {
    // get user id from request user
    const userId = req.user.id;

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

    const summary = await getAnalyticsSummary({ startDate, endDate, userId })

    res.status(200).json({
      success: true,
      message: "Analytics summary fetched successfully!✅",
      period: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      },
      summary
    });
    return;

  } catch(err: unknown) {
      console.error("Failed to fetch analytics summary of cashier:", err);
      res.status(500).json({
        success: false,
        error: "Internal server error fetching analytics summary of cashier"
      });
      return;
  }
}