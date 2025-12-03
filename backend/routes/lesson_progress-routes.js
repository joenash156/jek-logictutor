import express from "express";
import { getLessonProgress, updateLessonProgress } from "../controllers/lesson_progress-controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET lesson progress for a specific lesson
router.get("/:lessonId", requireAuth, getLessonProgress);
router.post("/update", requireAuth, updateLessonProgress);


export default router;
