import cors from "cors";
import { env } from "./env";

const allowedOrigins = env.corsOrigins
  ? env.corsOrigins.split(",").map(origin => origin.trim())
  : [];

export const corsConfig = cors({
  origin: (origin, callback) => {
    
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PATCH", "DELETE"],
});
