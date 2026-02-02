import express from "express";
import "./configs/database"; 
import cookieParser from "cookie-parser";
import routers from "./routes/routes";
import { corsConfig } from "./configs/cors";
import { helmetConfig } from "./configs/helmet";
import { rateLimiter } from "./configs/rateLimiter";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

app.disable("x-powered-by");

// security
app.use(helmetConfig);
app.use(corsConfig);
app.use(rateLimiter);

// body parsing
app.use(express.json({ limit: "10mb" }))
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")))

// API routes
app.use("/api", routers)

app.listen(PORT, () => {
  console.log(`The server is running on http://localhost:${PORT}`)
})