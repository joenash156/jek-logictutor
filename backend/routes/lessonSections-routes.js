import express from "express";
import db from "../config/database.js";
import {
  createSection,
  getSectionsByLesson,
  getSectionById,
  updateSection,
  deleteSection,
} from "../controllers/lessonSections-controllers.js";

const router = express.Router();

// CREATE SECTION under a lesson
router.post("/insert_section/:lessonId", createSection);

// GET ALL SECTIONS under a lesson
router.get("/:lessonId", getSectionsByLesson);

// GET SINGLE SECTION
router.get("/section/:id", getSectionById);

// UPDATE SECTION
router.patch("/section/update/:id", updateSection);

// DELETE SECTION
router.delete("/section/delete/:id", deleteSection);

// GET ALL SECTIONS (for mapping)
router.get("/all", async (req, res) => {
  try {
    const [sections] = await db.query(
      "SELECT id, lesson_id, title FROM lesson_sections"
    );
    return res.status(200).json({
      success: true,
      sections,
    });
  } catch (err) {
    console.error("Failed to fetch all sections:", err);
    return res.status(500).json({
      success: false,
      error: "Database error!",
    });
  }
});

export default router;
