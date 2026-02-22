import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  corsOrigins: process.env.CORS_ORIGIN || "",


  /** Legacy / unused — kept to avoid breaking any external references. */
  rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW) || 1,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 60,

  /** Auth endpoints (login, signup, forgot/reset password) — IP-keyed. */
  rateLimitAuthWindow: Number(process.env.RATE_LIMIT_AUTH_WINDOW) || 1,
  rateLimitAuthMax: Number(process.env.RATE_LIMIT_AUTH_MAX) || 10,

  /** POS action endpoints (sale create, void, receipt) — per-user. */
  rateLimitPosWindow: Number(process.env.RATE_LIMIT_POS_WINDOW) || 1,
  rateLimitPosMax: Number(process.env.RATE_LIMIT_POS_MAX) || 120,

  /** Product search endpoint — per-user (products search, high to support barcode scanning). */
  rateLimitSearchWindow: Number(process.env.RATE_LIMIT_SEARCH_WINDOW) || 1,
  rateLimitSearchMax: Number(process.env.RATE_LIMIT_SEARCH_MAX) || 200,

  /** Global public / fallback baseline — IP-keyed. */
  rateLimitPublicWindow: Number(process.env.RATE_LIMIT_PUBLIC_WINDOW) || 1,
  rateLimitPublicMax: Number(process.env.RATE_LIMIT_PUBLIC_MAX) || 60,

  // database config envs
  dbHOST: process.env.DB_HOST as string,
  dbUSER: process.env.DB_USER as string,
  dbPASSWORD: process.env.DB_PASSWORD as string,
  dbNAME: process.env.DB_NAME as string,
  dbPORT: Number(process.env.DB_PORT),
};
