import express from "express";
import {
  deleteQuiz,
  getQuizById,
  getQuizzesByLessons,
  insertQuiz,
  updateQuiz,
} from "../controllers/quizzes-controller.js";

const router = express.Router();

// router to insert a quiz
router.post("/quiz/insert_quiz", insertQuiz);

// router to get all quizzes based on lesson and sections(optionally)
router.get("/:lessonId", getQuizzesByLessons);

// router to fetch single quiz by id
router.get("/quiz/:id", getQuizById);

// router to update quiz
router.patch("/quiz/update/:id", updateQuiz);

// router to delete a quiz
router.delete("/quiz/delete/:id", deleteQuiz)

export default router;
