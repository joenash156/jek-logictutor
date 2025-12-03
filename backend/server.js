import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import usersRouter from "./routes/users-routes.js";
import lessonsRouter from "./routes/lessons-routes.js";
import quizzesRouter from "./routes/quizzes-routes.js";
import lessonSectionsRouter from "./routes/lessonSections-routes.js";
import quizSubmissionRouter from "./routes/quizSubmission-routes.js";
import lessonProgressRouter from "./routes/lesson_progress-routes.js";
import scoreCalcRouter from "./routes/scores-routes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      "https://jek-logictutor.netlify.app",
      "https://jek-logictutor.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use("/user", usersRouter);
app.use("/lessons", lessonsRouter);
app.use("/quizzes", quizzesRouter);
app.use("/sections", lessonSectionsRouter);
app.use("/quiz_submission", quizSubmissionRouter);
app.use("/scores", scoreCalcRouter);
app.use("/lesson_progress", lessonProgressRouter);

// Error handling middleware for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File is too large. Maximum size is 5MB.",
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message || "An error occurred during upload",
    });
  }

  next();
});

app.listen(PORT, () => {
  console.log(`The server is running🚀 on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  console.log(`Static files served at http://localhost:${PORT}/uploads`);
});
