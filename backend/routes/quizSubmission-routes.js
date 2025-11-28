import express from "express";
import {
  createQuizSubmission,
  getUserSubmissions,
} from "../controllers/quizSubmission-controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// router to submit quiz
router.post("/submit_quiz", requireAuth, createQuizSubmission);

// router to get all user submissions
router.get("/user_submissions", requireAuth, getUserSubmissions);

export default router;