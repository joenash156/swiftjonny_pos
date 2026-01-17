import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  corsOrigins: process.env.CORS_ORIGIN || "",
  rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW) || 15,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,
};
