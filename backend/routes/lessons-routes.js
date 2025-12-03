import express from "express"
import { deleteLesson, getAllLessons, getLessonById, insertLesson, updateLesson } from "../controllers/lessons-controllers.js"

const router = express.Router();

// router to insert lessons
router.post("/insert_lesson", insertLesson)

// router to get all lessons
router.get("/", getAllLessons);

// router to get lesson by id
router.get("/lesson/:id", getLessonById);

// router to update lesson by id
router.patch("/lesson/update/:id", updateLesson)

// router to delete lesson by id
router.delete("/lesson/delete/:id", deleteLesson)

export default router