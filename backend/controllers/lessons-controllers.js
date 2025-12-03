import db from "../config/database.js";
import { v4 as uuidv4 } from "uuid";

// controller to insert lesson
export const insertLesson = async (req, res) => {
  const { title, content, orderIndex, isActive } = req.body;

  // check if admin provided the required data
  if (
    !title ||
    !content ||
    orderIndex === undefined ||
    isActive === undefined
  ) {
    return res.status(400).json({
      success: false,
      error: "All fields are required!",
    });
  }

  const id = uuidv4();

  try {
    // insert lesson into database
    await db.query(
      "INSERT INTO lessons (id, title, content, order_index, is_active) VALUES (?, ?, ?, ?, ?)",
      [id, title, content, orderIndex, isActive]
    );
    return res.status(201).json({
      success: true,
      message: "Lesson inserted successfully!✅",
      lesson: {
        id,
        title,
        content,
        orderIndex,
        isActive,
      },
    });
  } catch (err) {
    console.error("Failed to insert lesson: ", err);
    return res.status(500).json({
      success: false,
      error: "Database error!",
    });
  }
};

// controller to get all lessons
export const getAllLessons = async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT id, title, content, order_index, is_active FROM lessons ORDER BY order_index ASC"
    );

    return res.status(200).json({
      success: true,
      message:
        result.length === 0
          ? "No lessons available yet"
          : "All lesson fetched successfully!✅",
      counts: result.length,
      lessons: result,
    });
  } catch (err) {
    console.error("Failed to fetch lessons: ", err);
    return res.status(500).json({
      success: false,
      error: "Database failed!",
    });
  }
};

// controller to get a lesson by id
export const getLessonById = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      "SELECT id, title, content, order_index, is_active FROM lessons WHERE id = ?",
      [id]
    );
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Lesson is unavailable!",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lesson fetched successfully!✅",
      counts: result.length,
      lesson: result[0],
    });
  } catch (err) {
    console.error("Failed to fetch lesson: ", err);
    return res.status(500).json({
      success: false,
      error: "Database error!",
    });
  }
};

// contoller to update database fields dynamically
export const updateLesson = async (req, res) => {
  const { id } = req.params;
  const { title, content, orderIndex, isActive } = req.body;

  try {
    const [rows] = await db.query("SELECT id FROM lessons WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found!",
      });
    }
    // make update dynamic
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
        error: "No fields provided to update",
      });
    }

    values.push(id);

    await db.query(
      `UPDATE lessons SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    const [result] = await db.query(
      "SELECT id, title, content, order_index, is_active FROM lessons WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Lesson updated successfully!✅",
      updatedLesson: result[0],
    });
  } catch (err) {
    console.error("Failed to update lesson:", err);
    return res.status(500).json({
      success: false,
      error: "Database error!",
    });
  }
};

// controller to delete lessons
export const deleteLesson = async (req, res) => {
  const { id } = req.params;

  try {
    // check if the lesson exists
    const [rows] = await db.query("SELECT id from lessons WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Lesson do not exist",
      });
    }
    // remove lesson from the database
    await db.query("DELETE FROM lessons WHERE id = ?", [id]);
    return res.status(200).json({
      success: true,
      message: "Lesson deleted successfully!✅",
    });
  } catch (err) {
    console.error("Failed to delete lesson:", err);
    return res.status(500).json({
      success: false,
      error: "Database error!",
    });
  }
};
