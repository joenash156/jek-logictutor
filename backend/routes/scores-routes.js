import express from "express";
import {
  computeLessonScore,
  getUserLessonScores,
} from "../controllers/scores-controllers.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Manually compute lesson score (backup endpoint)
router.post("/compute_score", requireAuth, computeLessonScore);

// Get all lesson scores for the user
router.get("/user_scores", requireAuth, getUserLessonScores);

export default router;
