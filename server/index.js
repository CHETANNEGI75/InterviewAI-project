import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";

dotenv.config();

const app = express();


// ================== 🔥 MIDDLEWARE ==================
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());


// ================== 🔥 DB ==================
connectDB();


// ================== 🔥 TEST ROUTE ==================
app.get("/test", (req, res) => {
  res.send("Server working 🔥");
});


// ================== 🔥 ROUTES ==================
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);


// ================== 🔥 GLOBAL ERROR HANDLER ==================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  res.status(500).json({
    message: "Something went wrong",
  });
});


// ================== 🔥 SERVER ==================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});