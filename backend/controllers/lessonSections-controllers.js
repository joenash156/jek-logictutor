import db from "../config/database.js";
import { v4 as uuidv4 } from "uuid";

// controller to create section
export const createSection = async (req, res) => {
  const { lessonId } = req.params;
  const { title, content, orderIndex, isActive } = req.body;

  try {
    // Check if lesson exists
    const [lessonRows] = await db.query("SELECT id FROM lessons WHERE id = ?", [
      lessonId,
    ]);
    if (lessonRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found!",
      });
    }

    const id = uuidv4();

    await db.query(
      `INSERT INTO lesson_sections (id, lesson_id, title, content, order_index, is_active) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, lessonId, title, content, orderIndex, isActive]
    );

    return res.status(201).json({
      success: true,
      message: "Section created successfully! ✅",
      section: {
        id,
        lessonId,
        title,
        content,
        orderIndex,
        isActive,
      },
    });
  } catch (err) {
    console.error("Failed to create section:", err);
    return res.status(500).json({
      success: false,
      error: "Database error!",
    });
  }
};

// controller to get section by lesson
export const getSectionsByLesson = async (req, res) => {
  const { lessonId } = req.params;

  try {
    const [sections] = await db.query(
      "SELECT * FROM lesson_sections WHERE lesson_id = ? ORDER BY order_index ASC",
      [lessonId]
    );

    return res.status(200).json({
      success: true,
      sections,
    });
  } catch (err) {
    console.error("Failed to fetch sections:", err);
    return res.status(500).json({
      success: false,
      error: "Database error!",
    });
  }
};

// controller to get section by id
export const getSectionById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM lesson_sections WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Section not found!",
      });
    }

    return res.status(200).json({
      success: true,
      section: rows[0],
    });
  } catch (err) {
    console.error("Failed to fetch section:", err);
    return res.status(500).json({
      success: false,
      error: "Database error!",
    });
  }
};

// controller to update section
export const updateSection = async (req, res) => {
  const { id } = req.params;
  const { title, content, orderIndex, isActive } = req.body;

  try {
    const [exists] = await db.query(
      "SELECT id FROM lesson_sections WHERE id = ?",
      [id]
    );
    if (exists.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Section not found!",
      });
    }

    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push("title = ?");
      values.push(title);
    }
    if (content !== undefined) {
      fields.push("content = ?");
      values.push(content);
    }
    if (orderIndex !== undefined) {
      fields.push("order_index = ?");
      values.push(orderIndex);
    }
    if (isActive !== undefined) {
      fields.push("is_active = ?");
      values.push(isActive);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields provided to update!",
      });
    }

    values.push(id);

    await db.query(
      `UPDATE lesson_sections SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    const [updated] = await db.query(
      "SELECT * FROM lesson_sections WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Section updated successfully! ✅",
      section: updated[0],
    });
  } catch (err) {
    console.error("Failed to update section:", err);
    return res.status(500).json({
      success: false,
      error: "Database error!",
    });
  }
};

// controller to delete a section
export const deleteSection = async (req, res) => {
  const { id } = req.params;

  try {
    const [exists] = await db.query(
      "SELECT id FROM lesson_sections WHERE id = ?",
      [id]
    );
    if (exists.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Section not found!",
      });
    }

    await db.query("DELETE FROM lesson_sections WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully!✅",
      deleteId: id,
    });
  } catch (err) {
    console.error("Failed to delete section:", err);
    return res.status(500).json({
      success: false,
      error: "Database error!",
    });
  }
};
