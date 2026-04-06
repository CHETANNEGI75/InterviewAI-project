import express from "express";
import isAuth from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";

import {
  analyzeResume,
  generateQuestion,
  submitAnswer,
  finishInterview,
  getMyInterviews,
  getInterviewReport
} from "../controllers/interview.controller.js";

const interviewRouter = express.Router();
console.log("✅ Interview routes loaded");


// ================== GENERATE QUESTIONS ==================
interviewRouter.post("/generate",isAuth,generateQuestion);

// ================== RESUME ==================
interviewRouter.post(
  "/resume",
  isAuth,
  upload.single("resume"),
  analyzeResume
);


// ================== SUBMIT ANSWER ==================
interviewRouter.post(
  "/submit",
  isAuth,
  submitAnswer
);


// ================== FINISH INTERVIEW ==================
interviewRouter.post(
  "/finish",
  isAuth,
  finishInterview
);


// ================== GET USER INTERVIEWS ==================
interviewRouter.get(
  "/my",
  isAuth,
  getMyInterviews
);


// ================== GET REPORT ==================
interviewRouter.get(
  "/report/:id",
  isAuth,
  getInterviewReport
);


export default interviewRouter;