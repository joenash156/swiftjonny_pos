import express from "express";
import usersRouter from "./routes/usersRoutes";
import adminRouter from "./routes/adminRoutes";
import categoriesRouter from "./routes/categoriesRoutes";
import "./configs/database"; 
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "20mb" }))
app.use(cookieParser());

// API routes
app.use("/user", usersRouter);
app.use("/admin", adminRouter);
app.use("/category", categoriesRouter);


app.listen(PORT, () => {
  console.log(`The server is running on http://localhost:${PORT}`)
})