import { Request, Response } from "express"
import { getAnalyticsSummary, getCashierPerformance, getSalesTrend, getTopSellingProducts, getRevenueComparison } from "../services/analytics.service";

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

// ─── Sales Trend ──────────────────────────────────────────────────────────────

// controller to get general sales trend (admin)
export const getSalesTrendSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    let startDate = new Date();
    let endDate = new Date();
    const isValidFrom = typeof from === "string" && !isNaN(Date.parse(from));
    const isValidTo = typeof to === "string" && !isNaN(Date.parse(to));
    if (isValidFrom && isValidTo) {
      startDate = new Date(from as string);
      endDate = new Date(to as string);
    }
    const trend = await getSalesTrend({ startDate, endDate });
    res.status(200).json({
      success: true,
      message: "Sales trend fetched successfully!✅",
      period: { start_date: startDate.toISOString(), end_date: endDate.toISOString() },
      trend
    });
  } catch (err: unknown) {
    console.error("Failed to fetch sales trend:", err);
    res.status(500).json({ success: false, error: "Internal server error fetching sales trend" });
  }
};

// controller to get personal sales trend (cashier)
export const getMySalesTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;
    let startDate = new Date();
    let endDate = new Date();
    const isValidFrom = typeof from === "string" && !isNaN(Date.parse(from));
    const isValidTo = typeof to === "string" && !isNaN(Date.parse(to));
    if (isValidFrom && isValidTo) {
      startDate = new Date(from as string);
      endDate = new Date(to as string);
    }
    const trend = await getSalesTrend({ startDate, endDate, userId });
    res.status(200).json({
      success: true,
      message: "My sales trend fetched successfully!✅",
      period: { start_date: startDate.toISOString(), end_date: endDate.toISOString() },
      trend
    });
  } catch (err: unknown) {
    console.error("Failed to fetch cashier sales trend:", err);
    res.status(500).json({ success: false, error: "Internal server error fetching sales trend" });
  }
};

// ─── Top Products ──────────────────────────────────────────────────────────────

// controller to get top-selling products (admin)
export const getTopProductsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    let startDate = new Date();
    let endDate = new Date();
    const isValidFrom = typeof from === "string" && !isNaN(Date.parse(from));
    const isValidTo = typeof to === "string" && !isNaN(Date.parse(to));
    if (isValidFrom && isValidTo) {
      startDate = new Date(from as string);
      endDate = new Date(to as string);
    }
    const topProducts = await getTopSellingProducts({ startDate, endDate });
    res.status(200).json({
      success: true,
      message: "Top products fetched successfully!✅",
      period: { start_date: startDate.toISOString(), end_date: endDate.toISOString() },
      top_products: topProducts
    });
  } catch (err: unknown) {
    console.error("Failed to fetch top products:", err);
    res.status(500).json({ success: false, error: "Internal server error fetching top products" });
  }
};

// controller to get personal top-selling products (cashier)
export const getMyTopProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;
    let startDate = new Date();
    let endDate = new Date();
    const isValidFrom = typeof from === "string" && !isNaN(Date.parse(from));
    const isValidTo = typeof to === "string" && !isNaN(Date.parse(to));
    if (isValidFrom && isValidTo) {
      startDate = new Date(from as string);
      endDate = new Date(to as string);
    }
    const topProducts = await getTopSellingProducts({ startDate, endDate, userId });
    res.status(200).json({
      success: true,
      message: "My top products fetched successfully!✅",
      period: { start_date: startDate.toISOString(), end_date: endDate.toISOString() },
      top_products: topProducts
    });
  } catch (err: unknown) {
    console.error("Failed to fetch cashier top products:", err);
    res.status(500).json({ success: false, error: "Internal server error fetching top products" });
  }
};

// ─── Revenue Comparison ────────────────────────────────────────────────────────

// controller to get general revenue comparison today vs yesterday (admin)
export const getRevenueComparisonSummary = async (_req: Request, res: Response): Promise<void> => {
  try {
    const comparison = await getRevenueComparison({});
    res.status(200).json({
      success: true,
      message: "Revenue comparison fetched successfully!✅",
      comparison
    });
  } catch (err: unknown) {
    console.error("Failed to fetch revenue comparison:", err);
    res.status(500).json({ success: false, error: "Internal server error fetching revenue comparison" });
  }
};

// controller to get personal revenue comparison today vs yesterday (cashier)
export const getMyRevenueComparison = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const comparison = await getRevenueComparison({ userId });
    res.status(200).json({
      success: true,
      message: "My revenue comparison fetched successfully!✅",
      comparison
    });
  } catch (err: unknown) {
    console.error("Failed to fetch cashier revenue comparison:", err);
    res.status(500).json({ success: false, error: "Internal server error fetching revenue comparison" });
  }
};

// ─── Cashier Performance ───────────────────────────────────────────────────────

// controller to get cashier performance
export const getCashiersPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
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

    const cashiersPerformance = await getCashierPerformance({ startDate, endDate });

    res.status(200).json({
      success: true,
      message: "Cashiers performance fetched successfully!✅",
      period: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      },
      cashiers_performance: cashiersPerformance
    })

  } catch(err: unknown) {
      console.error("Failed to fetch cashiers performance:", err);
      res.status(500).json({
        success: false,
        error: "Internal server error fetching cashiers performance"
      });
      return;
  }
}