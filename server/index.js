import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
dotenv.config();
const app = express();
//connection to client and server using cors  
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
connectDB();
app.use(express.json())
app.use(cookieParser())
// 
app.get("/test", (req, res) => {
  res.send("Server working 🔥");
});
app.use("/api/auth",authRouter);
app.use("/api/user",userRouter);


app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})