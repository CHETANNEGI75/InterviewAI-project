import express from "express";

import { GoogleAuth, logOut } from "../controllers/auth.controller.js";
  
// auth route
const authRouter = express.Router()
// Google authentication route
    authRouter.post("/google",GoogleAuth)
    authRouter.post("/logout",logOut)

    export default authRouter;