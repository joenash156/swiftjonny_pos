import db from "../configs/database";
import { RowDataPacket } from "mysql2";
import { AnalyticsParams } from "../types/types";

type RevenueComparisonParams = {
  userId?: string; // optional, for per-cashier view
};

// function to get analytic summary
export async function getAnalyticsSummary({ startDate, endDate, userId }: AnalyticsParams) {
  // enforce start and end of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  let query = "SELECT COALESCE(SUM(total), 0) AS total_sales, COUNT(*) AS total_transactions FROM sales WHERE status = 'completed' AND created_at BETWEEN ? AND ?";
  
  const params:(Date | string)[] = [startDate, endDate];

  if(userId) {
    query += " AND user_id = ?";
    params.push(userId);
  }

  const [totalSalesAndTransactions] = await db.query<RowDataPacket[]>(query, params);

  let itemsQuery = "SELECT COALESCE(SUM(quantity), 0) AS total_items_sold FROM sale_items si JOIN sales s ON s.id = si.sale_id WHERE s.status = 'completed' AND s.created_at BETWEEN ? AND ?";

  const itemsParams:(Date | string)[] = [startDate, endDate];

  if(userId) {
    query += " AND s.user_id = ?";
    itemsParams.push(userId);
  }

  const [totalItemsSoldRow] = await db.query<RowDataPacket[]>(itemsQuery, itemsParams);

  const totalItemsSold = Number(totalItemsSoldRow[0]?.total_items_sold);

  // calculate average sale value
  const totalTransactions = Number(totalSalesAndTransactions[0]?.total_transactions);
  const totalSales = Number(totalSalesAndTransactions[0]?.total_sales);

  const averageSaleValue = totalTransactions > 0 ? Number((totalSales / totalTransactions).toFixed(2)) : 0;

  return {
    total_sales: totalSales,
    total_transactions: totalTransactions,
    total_items_sold: totalItemsSold,
    average_sale_value: averageSaleValue
  }

}

// function to get sales trend
export async function getSalesTrend({ startDate, endDate, userId }: AnalyticsParams) {
  // enforce start and end of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  let query = "SELECT DATE(created_at) AS date, COALESCE(SUM(total), 0) AS total_sales FROM sales WHERE status = 'completed' AND created_at BETWEEN ? AND ?";

  const params:(Date | string)[] = [startDate, endDate];

  if(userId) {
    query += " AND user_id = ?";
    params.push(userId);
  }

  query += " GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC";

  const [salesTrendRows] = await db.query<RowDataPacket[]>(query, params);

  const salesTrend = salesTrendRows.map((salesTrendRow) => ({
    date: salesTrendRow.date,
    total_sales: Number(salesTrendRow.total_sales)  
  }))

  return salesTrend;

}

// function to get top selling products
export async function getTopSellingProducts({ startDate, endDate, userId }: AnalyticsParams) {
  // enforce start and end of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  let query = "SELECT p.id, p.name, COALESCE(SUM(si.quantity), 0) AS total_quantity_sold, COALESCE(SUM(si.quantity * si.price), 0) AS total_revenue FROM sale_items si JOIN sales s ON s.id = si.sale_id JOIN products p ON p.id = si.product_id WHERE s.status = 'completed' AND s.created_at BETWEEN ? AND ?";

  const params:(Date | string)[] = [startDate, endDate];

  if(userId) {
    query += " AND s.user_id = ?";
    params.push(userId);
  }

  query += " GROUP BY p.id, p.name ORDER BY total_quantity_sold DESC LIMIT 5";

  const [rows] = await db.query<RowDataPacket[]>(query, params);

  return rows.map((row) => ({
    product_id: row.id,
    name: row.name,
    total_quantity_sold: Number(row.total_quantity_sold),
    total_revenue: Number(row.total_revenue)
  }));

}

// function to get cashier performance
export async function getCashierPerformance({ startDate, endDate }: AnalyticsParams) {
  // enforce start and end of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const [rows] = await db.query<RowDataPacket[]>("SELECT u.id, u.firstname AS cashier_firstname, u.lastname AS cashier_lastname, COALESCE(SUM(s.total), 0) AS total_sales, COUNT(s.id) AS total_transactions, COALESCE(SUM(si.quantity), 0) AS total_items_sold FROM users u LEFT JOIN sales s ON u.id = s.user_id AND s.status = 'completed' AND s.created_at BETWEEN ? AND ? LEFT JOIN sale_items si ON s.id = si.sale_id WHERE u.role = 'cashier' GROUP BY u.id, u.firstname, u.lastname ORDER BY total_sales DESC, u.firstname ASC", [startDate, endDate]);

  return rows.map((row) => {
    // calculate average sale value
    const totalSales = Number(row.total_sales);
    const totalTransactions = Number(row.total_transactions);

    const averageSaleValue = totalTransactions > 0 ? Number((totalSales / totalTransactions).toFixed(2)) : 0;

    return {
      id: row.id,
      name: `${row.cashier_firstname} ${row.cashier_lastname}`,
      total_sales: totalSales,
      total_transactions: totalTransactions,
      total_items_sold: Number(row.total_items_sold),
      average_sale_value: averageSaleValue
    };
  });
}

// function to get revenue comparison
export async function getRevenueComparison({ userId }: RevenueComparisonParams) {
  
  // get today's date range
  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  // get yesterday's date range
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const startOfYesterday = new Date(yesterday);
  startOfYesterday.setHours(0, 0, 0, 0);
  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  // base SQL query
  let query = `SELECT COALESCE(SUM(total), 0) AS total_sales FROM sales WHERE status = 'completed' AND created_at BETWEEN ? AND ?`;

  const paramsToday: (Date | string)[] = [startOfToday, endOfToday];
  const paramsYesterday: (Date | string)[] = [startOfYesterday, endOfYesterday];

  // add user filter if userId exists
  if (userId) {
    query += " AND user_id = ?";
    paramsToday.push(userId);
    paramsYesterday.push(userId);
  }

  // fetch today's total sales
  const [todayRows] = await db.query<RowDataPacket[]>(query, paramsToday);
  const todayTotal = Number(todayRows[0]?.total_sales ?? 0);

  // fetch yesterday's total sales
  const [yesterdayRows] = await db.query<RowDataPacket[]>(query, paramsYesterday);
  const yesterdayTotal = Number(yesterdayRows[0]?.total_sales ?? 0);

  // calculate difference and percent change
  const difference = todayTotal - yesterdayTotal;
  const percentChange = yesterdayTotal > 0 ? Number(((difference / yesterdayTotal) * 100).toFixed(2)) : 0;

  return {
    today: todayTotal,
    yesterday: yesterdayTotal,
    difference,
    percent_change: percentChange
  };
}
