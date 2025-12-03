import db from "../config/database.js";
import { v4 as uuid } from "uuid";

export const getLessonProgress = async (req, res) => {
  const userId = req.user.id;
  const { lessonId } = req.params;

  try {
    const [sectionRows] = await db.query(
      "SELECT id, title, order_index FROM lesson_sections WHERE lesson_id = ? ORDER BY order_index ASC",
      [lessonId]
    );

    if (sectionRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No sections found for this lesson!",
      });
    }

    // get the user's progress for these sections
    const sectionIds = sectionRows.map((s) => s.id);
    const [progressRows] = await db.query(
      "SELECT section_id, is_completed, last_score, attempts, completed_at FROM lesson_progress WHERE user_id = ? AND section_id IN (?)",
      [userId, sectionIds]
    );

    // merge sections with progress
    const progressMap = {};
    progressRows.forEach((p) => {
      progressMap[p.section_id] = p;
    });

    const result = sectionRows.map((s) => ({
      sectionId: s.id,
      title: s.title,
      orderIndex: s.order_index,
      isCompleted: progressMap[s.id]?.is_completed || false,
      lastScore: progressMap[s.id]?.last_score || null,
      attempts: progressMap[s.id]?.attempts || 0,
      completedAt: progressMap[s.id]?.completed_at || null,
    }));

    return res.status(200).json({
      success: true,
      message: "This was successfully!✅",
      lessonId,
      sections: result,
    });
  } catch (err) {
    console.error("Failed to fetch lesson progress:", err);
    return res.status(500).json({
      success: false,
      error: "Database error",
    });
  }
};

// controller to update lesson progress
export const updateLessonProgress = async (req, res) => {
  const userId = req.user.id;
  const { sectionId, isCompleted, lastScore } = req.body;

  try {
    // Check if section exists
    const [sectionRows] = await db.query(
      "SELECT lesson_id FROM lesson_sections WHERE id = ?",
      [sectionId]
    );

    if (sectionRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Section not found!",
      });
    }

    const lessonId = sectionRows[0].lesson_id;

    // Check if progress already exists
    const [existingProgress] = await db.query(
      "SELECT id, attempts FROM lesson_progress WHERE user_id = ? AND section_id = ?",
      [userId, sectionId]
    );

    if (existingProgress.length > 0) {
      // Update existing progress
      const attempts = existingProgress[0].attempts + 1;

      await db.query(
        "UPDATE lesson_progress SET is_completed = ?, completed_at = NOW(), last_score = ?, attempts = ?, updated_at = NOW() WHERE id = ?",
        [isCompleted ? 1 : 0, lastScore || null, attempts, existingProgress[0].id]
      );

      return res.status(200).json({
        success: true,
        message: "Lesson progress updated successfully! ✅",
      });
    } else {
      // Insert new progress
      await db.query(
        "INSERT INTO lesson_progress (id, user_id, lesson_id, section_id, is_completed, completed_at, last_score, attempts, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, NOW(), NOW())",
        [uuid(), userId, lessonId, sectionId, isCompleted ? 1 : 0, lastScore || null, 1]
      );

      return res.status(201).json({
        success: true,
        message: "Lesson progress recorded successfully! ✅",
      });
    }
  } catch (err) {
    console.error("Failed to update lesson progress:", err);
    return res.status(500).json({
      success: false,
      error: "Database error",
    });
  }
};
