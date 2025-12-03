import { json } from "express";
import db from "../config/database.js";
import { v4 as uuidv4 } from "uuid";

// controller to insert a quiz
export const insertQuiz = async (req, res) => {
  const {
    lessonId,
    sectionId,
    orderIndex,
    question,
    options,
    correctAnswer,
    hint,
  } = req.body;

  if (
    !lessonId ||
    !question ||
    !options ||
    !correctAnswer ||
    orderIndex === undefined
  ) {
    return res.status(400).json({
      success: false,
      error: "Input all the required fields",
    });
  }

  // validate options
  if (typeof options !== "object" || Array.isArray(options)) {
    return res.status(400).json({
      success: false,
      error: "Options must be an object with keys like A, B, C, D",
    });
  }

  // check if correct answer is in options
  if (!options.hasOwnProperty(correctAnswer)) {
    return res.status(400).json({
      success: false,
      error: "Correct answer must be one of the option keys (e.g., A, B, C, D)",
    });
  }

  try {
    const [rows] = await db.query("SELECT id FROM lessons WHERE id = ?", [
      lessonId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Lesson do not exist",
      });
    }

    const id = uuidv4();

    await db.query(
      "INSERT INTO quizzes (id, lesson_id, section_id, order_index, question, options, correct_answer, hint) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        lessonId,
        sectionId || null,
        orderIndex,
        question,
        JSON.stringify(options),
        correctAnswer,
        hint || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Quiz inserted successfully!✅",
      quiz: {
        id,
        lessonId,
        sectionId,
        orderIndex,
        question,
        options,
        correctAnswer,
        hint,
      },
    });
  } catch (err) {
    console.error("Failed to insert quiz:", err);
    return res.status(500).json({
      success: false,
      error: "Database error!",
    });
  }
};

// controller to get quizzes based on lessons id
export const getQuizzesByLessons = async (req, res) => {
  const { lessonId } = req.params;
  const { sectionId } = req.query;
  // check if lesson exits
  try {
    const [rows] = await db.query("SELECT id FROM lessons WHERE id = ?", [
      lessonId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Lesson does not exist",
      });
    }
    // base select query
    let selectQuery = "SELECT * FROM quizzes WHERE lesson_id = ?";
    const values = [lessonId];

    if (sectionId) {
      selectQuery += " AND section_id = ?";
      values.push(sectionId);
    }
    selectQuery += " ORDER BY order_index ASC";
    const [result] = await db.query(selectQuery, values);
    // spread each quiz and parse the options
    const quizzes = result.map((quiz) => ({
      ...quiz,
      options: JSON.parse(quiz.options),
    }));
    return res.status(200).json({
      success: true,
      counts: quizzes.length,
      quizzes,
    });
  } catch (err) {
    console.error("Failed to fetch quizzes!", err);
    return res.status(500).json({
      success: false,
      error: "Database error!",
    });
  }
};

// controller to get one quiz based on its id
export const getQuizById = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("SELECT * FROM quizzes WHERE id = ?", [id]);
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found!",
      });
    }

    const quiz = {
      ...result[0],
      options: JSON.parse(result[0].options),
    };
    return res.status(200).json({
      success: true,
      message: "Quiz fetched successfully!✅",
      quiz,
    });
  } catch (err) {
    console.error("Failed to fetch quiz!");
    return res.status(500).json({
      success: false,
      error: "Database error",
    });
  }
};

// controller to update a quiz
export const updateQuiz = async (req, res) => {
  const { id } = req.params;
  const { sectionId, orderIndex, question, options, correctAnswer, hint } = req.body;

  try {
    const [rows] = await db.query("SELECT id FROM quizzes WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Quiz is not found!",
      });
    }

    if (options && (typeof options !== "object" || Array.isArray(options))) {
      return res.status(400).json({
        success: false,
        error: "Options must be an object with keys like A, B, C, D",
      });
    }

    if (options && correctAnswer && !options.hasOwnProperty(correctAnswer)) {
      return res.status(400).json({
        success: false,
        error: "Correct answer must be one of the option keys",
      });
    }

    const fields = [];
    const values = [];

    // make a dynamic check to see if required fields provided
    if(sectionId !== undefined) {
      fields.push("section_id = ?");
      values.push(sectionId);
    }
    if(orderIndex !== undefined) {
      fields.push("order_index = ?");
      values.push(orderIndex);
    }
    if(question !== undefined) {
      fields.push("question = ?");
      values.push(question);
    }
    if(options !== undefined) {
      fields.push("options = ?");
      values.push(JSON.stringify(options))
    }
    if(correctAnswer !== undefined) {
      fields.push("correct_answer = ?");
      values.push(correctAnswer)
    }
    if(hint !== undefined) {
      fields.push("hint = ?");
      values.push(hint)
    }

    if(fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields provided to update!"
      })
    }

    values.push(id)
    await db.query(`UPDATE quizzes SET ${fields.join(", ")} WHERE id = ?`, values)

    const [result] = await db.query("SELECT * FROM quizzes WHERE id = ?", [id])

    const quiz = {
      ...result[0],
      options: JSON.parse(result[0].options)
    }

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully!✅",
      quiz
    })

  } catch (err) {
    console.error("Failed to update quiz!", err)
    return res.status(500).json({
      success: false,
      error: "Database error!"
    })
  }
};

// controller to delete a quiz
export const deleteQuiz = async (req, res) => {
  const { id } = req.params;

  try{
    const [rows] = await db.query("SELECT id FROM quizzes WHERE id = ?", [id]);
    if(rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Quiz is not found!"
      })
    }

    await db.query("DELETE FROM quizzes WHERE id = ?", [id])
    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully!✅"
    })
  } catch(err) {
    console.error("Failed to delete quiz", err)
    return res.status(500).json({
      success: false,
      error: "Database failed!"
    })
  }
}