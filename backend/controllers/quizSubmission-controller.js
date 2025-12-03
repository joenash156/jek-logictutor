import { v4 as uuid } from "uuid";
import db from "../config/database.js";

// CREATE QUIZ SUBMISSION
export const createQuizSubmission = async (req, res) => {
  const userId = req.user.id;
  const { sectionId, attemptNumber, durationSeconds, answers } = req.body;

  try {
    // validate section exists
    const [sectionRows] = await db.query(
      "SELECT id, lesson_id FROM lesson_sections WHERE id = ?",
      [sectionId]
    );

    if (sectionRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Section not found!",
      });
    }

    const lessonId = sectionRows[0].lesson_id;

    // fetch all quizzes for this section
    const [quizzes] = await db.query(
      "SELECT id, options, correct_answer FROM quizzes WHERE section_id = ? ORDER BY order_index ASC",
      [sectionId]
    );

    if (quizzes.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No quizzes found for this section!",
      });
    }

    // Parse options JSON
    const quizMap = {};
    quizzes.forEach((q) => {
      quizMap[q.id] = {
        id: q.id,
        correct: q.correct_answer,
        options: JSON.parse(q.options),
      };
    });

    // compare submitted answers with correct answers
    let correctCount = 0;

    const attemptsToSave = answers
      .map((ans) => {
        const quiz = quizMap[ans.quizId];
        if (!quiz) return null;

        const isCorrect = ans.selected === quiz.correct;
        if (isCorrect) correctCount++;

        return {
          id: uuid(),
          submissionId: null, // will be filled later with uuid
          quizId: ans.quizId,
          selected: ans.selected,
          isCorrect,
        };
      })
      .filter(Boolean);

    const totalQuestions = quizzes.length;

    // calculate score
    const score = Math.round((correctCount / totalQuestions) * 100);
    const status = score >= 50 ? "passed" : "failed";

    // save quiz submission
    const submissionId = uuid();

    await db.query(
      `INSERT INTO quiz_submissions 
      (id, user_id, section_id, total_questions, correct_count, score, status, attempt_number, duration_seconds)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        submissionId,
        userId,
        sectionId,
        totalQuestions,
        correctCount,
        score,
        status,
        attemptNumber,
        durationSeconds,
      ]
    );

    // save question attempts
    for (let attempt of attemptsToSave) {
      await db.query(
        `INSERT INTO question_attempts 
        (id, submission_id, quiz_id, selected_option, is_correct)
        VALUES (?, ?, ?, ?, ?)`,
        [
          attempt.id,
          submissionId,
          attempt.quizId,
          attempt.selected,
          attempt.isCorrect ? 1 : 0,
        ]
      );
    }

    // ===== AUTOMATIC LESSON SCORE COMPUTATION =====
    // Get all sections for this lesson
    const [allSections] = await db.query(
      "SELECT id FROM lesson_sections WHERE lesson_id = ?",
      [lessonId]
    );

    const sectionIds = allSections.map((s) => s.id);

    // Get best score per section for this user
    const [bestScores] = await db.query(
      `SELECT section_id, MAX(score) AS bestScore
       FROM quiz_submissions
       WHERE user_id = ? AND section_id IN (?)
       GROUP BY section_id`,
      [userId, sectionIds]
    );

    // Check if user has attempted all sections
    if (bestScores.length === sectionIds.length) {
      // Calculate lesson score (average of best scores)
      const totalBestScore = bestScores.reduce(
        (sum, s) => sum + s.bestScore,
        0
      );
      const lessonScore = Math.round(totalBestScore / bestScores.length);
      const lessonStatus = lessonScore >= 50 ? "passed" : "failed";

      // Check if a score record already exists
      const [existingScore] = await db.query(
        "SELECT id FROM scores WHERE user_id = ? AND lesson_id = ?",
        [userId, lessonId]
      );

      if (existingScore.length > 0) {
        // Update existing
        await db.query(
          "UPDATE scores SET score = ?, status = ?, updated_at = NOW() WHERE id = ?",
          [lessonScore, lessonStatus, existingScore[0].id]
        );
      } else {
        // Insert new
        await db.query(
          "INSERT INTO scores (id, user_id, lesson_id, score, status) VALUES (?, ?, ?, ?, ?)",
          [uuid(), userId, lessonId, lessonScore, lessonStatus]
        );
      }

      console.log(
        `Lesson score computed: ${lessonScore}% for lesson ${lessonId}`
      );
    }
    // ===== END AUTOMATIC LESSON SCORE COMPUTATION =====

    // response
    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully!✅",
      submission: {
        id: submissionId,
        sectionId,
        totalQuestions,
        correctCount,
        score,
        status,
        attemptNumber,
        durationSeconds,
      },
    });
  } catch (err) {
    console.error("Failed to create quiz submission:", err);
    return res.status(500).json({
      success: false,
      error: "Database error",
    });
  }
};

// GET USER SUBMISSIONS
export const getUserSubmissions = async (req, res) => {
  const userId = req.user.id;

  try {
    const [submissions] = await db.query(
      `SELECT id, section_id, total_questions, correct_count, score, status, attempt_number, duration_seconds, created_at 
       FROM quiz_submissions 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "User submissions fetched successfully!✅",
      count: submissions.length,
      submissions,
    });
  } catch (err) {
    console.error("Failed to fetch user submissions:", err);
    return res.status(500).json({
      success: false,
      error: "Database error",
    });
  }
};
