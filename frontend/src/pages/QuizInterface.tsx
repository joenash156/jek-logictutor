// src/pages/QuizInterface.tsx
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

interface UserStats {
  level: number;
  xp: number;
  completedLessons: string[];
}

interface QuizInterfaceProps {
  studentName: string;
  userStats?: UserStats;
  onUpdateStats?: (stats: UserStats) => void;
}

// interface Question {
//   id: string;
//   text: string;
//   options: string[];
//   correct: number;
//   explanation: string;
// }

interface Quiz {
  id: string;
  lesson_id: string;
  section_id: string | null;
  order_index: number;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  hint: string | null;
}

interface Answer {
  quizId: string;
  selected: string;
}

interface QuizCompletion {
  lessonId: string;
  completed: boolean;
  score: number;
}

const QuizInterface = ({ studentName, userStats, onUpdateStats }: QuizInterfaceProps) => {
  const navigate = useNavigate();
  const { id, sectionId } = useParams<{ id: string; sectionId?: string }>();
  const location = useLocation();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const attemptNumber = 1;
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { lessonId, sectionTitle, returnPath, lessonTitle } = location.state || {};

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Fetch quizzes from backend
  useEffect(() => {
    async function loadQuizzes() {
      try {
        let endpoint = '';
        if (sectionId) {
          // Fetch quizzes for specific section
          endpoint = `/quizzes/${lessonId || id}?sectionId=${sectionId}`;
        } else {
          // Fetch quizzes for entire lesson
          endpoint = `/quizzes/${id}`;
        }

        const response = await api.get(endpoint);

        if (response.data.success && response.data.quizzes.length > 0) {
          setQuizzes(response.data.quizzes);
        } else {
          await Swal.fire({
            icon: "info",
            title: "No Quiz Available",
            text: "There are no quizzes for this section yet.",
            confirmButtonColor: "#68ba4a",
          });
          if (returnPath) {
            navigate(returnPath, {
              state: { quizCompleted: true, sectionId: sectionId || id },
            });
          } else {
            navigate("/lessons");
          }
        }
      } catch (error) {
        console.error("Failed to load quizzes:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load quiz. Please try again.",
          confirmButtonColor: "#68ba4a",
        });
        navigate(returnPath || "/lessons");
      } finally {
        setLoading(false);
      }
    }

    loadQuizzes();
  }, [id, sectionId, lessonId, returnPath, navigate]);

  const currentQuiz = quizzes[currentQuestion];
  const isLastQuestion = currentQuestion === quizzes.length - 1;

  const handleAnswer = (optionKey: string) => {
    setSelectedOption(optionKey);

    // Store the answer
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.quizId === currentQuiz.id);

    if (existingIndex >= 0) {
      newAnswers[existingIndex] = { quizId: currentQuiz.id, selected: optionKey };
    } else {
      newAnswers.push({ quizId: currentQuiz.id, selected: optionKey });
    }

    setAnswers(newAnswers);
    setShowResult(true);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      await handleSubmitQuiz();
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowResult(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;

    setSubmitting(true);

    try {
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

      const response = await api.post("/quiz_submission/submit_quiz", {
        sectionId: sectionId || id,
        attemptNumber,
        durationSeconds,
        answers,
      });

      if (response.data.success) {
        const { score, status, correctCount, totalQuestions } = response.data.submission;

        // Calculate XP based on score
        const xpEarned = status === "passed" ? 75 : 25;

        // Update user stats
        if (onUpdateStats && userStats) {
          const updated: UserStats = {
            ...userStats,
            xp: userStats.xp + xpEarned,
            level: Math.floor((userStats.xp + xpEarned) / 100),
            completedLessons: userStats.completedLessons,
          };
          onUpdateStats(updated);
        }

        // Save XP to localStorage
        const currentXP = parseInt(localStorage.getItem("user_xp") || "0");
        localStorage.setItem("user_xp", (currentXP + xpEarned).toString());
        localStorage.setItem("user_level", Math.floor((currentXP + xpEarned) / 100).toString());

        // Store completion in localStorage for quizzes page
        if (!sectionId) {
          const storedCompletions = localStorage.getItem("quiz_completions");
          const completions = storedCompletions ? JSON.parse(storedCompletions) : [];

          const existingIndex = completions.findIndex((c: QuizCompletion) => c.lessonId === id);
          if (existingIndex >= 0) {
            completions[existingIndex] = { lessonId: id, completed: true, score };
          } else {
            completions.push({ lessonId: id, completed: true, score });
          }

          localStorage.setItem("quiz_completions", JSON.stringify(completions));
        }

        await Swal.fire({
          icon: status === "passed" ? "success" : "info",
          title: status === "passed" ? "Quiz Passed!" : "Quiz Completed",
          html: `
            <div class="text-center">
              <p class="text-2xl font-bold mb-2">${correctCount}/${totalQuestions}</p>
              <p class="text-xl mb-2">${score}%</p>
              <p class="text-sm text-gray-600 mb-1">Time: ${formatTime(durationSeconds)}</p>
              <p class="text-lg font-bold ${status === "passed" ? "text-green-600" : "text-orange-600"} mt-2">
                ${status === "passed" ? "+75 XP 🎉" : "+25 XP 📚"}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                ${status === "passed" ? "Great job!" : "Keep practicing!"}
              </p>
            </div>
          `,
          confirmButtonColor: "#68ba4a",
          confirmButtonText: returnPath ? "Continue" : "Back to Lessons",
        });

        // Navigate back with completion status
        if (returnPath) {
          navigate(returnPath, {
            state: {
              quizCompleted: true,
              sectionId: sectionId || id,
              quizScore: score,
            },
          });
        } else {
          navigate("/lessons");
        }
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      await Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Failed to submit quiz. Please try again.",
        confirmButtonColor: "#68ba4a",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    document.title = "JEK Logic Tutor | Take Quiz";
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf9f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <i className="fas fa-spinner fa-spin text-4xl text-[#68ba4a]"></i>
          <p className="text-sm text-[#060404]/60">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-[#fbf9f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <i className="fas fa-clipboard-question text-5xl text-[#8baab1]/50"></i>
          <p className="text-lg font-semibold text-[#060404]">No quizzes available</p>
          <button
            onClick={() => navigate(returnPath || "/lessons")}
            className="px-6 py-3 rounded-xl bg-[#68ba4a] text-white font-semibold hover:bg-[#5a9a3d] transition"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = selectedOption === currentQuiz.correct_answer;
  const optionKeys = Object.keys(currentQuiz.options);

  return (
    <div className="min-h-screen bg-[#fbf9f9] text-[#060404]">
      {/* Header */}
      <header className="bg-white border-b border-[#b3ccb8]/40 p-4 md:p-6" data-aos="fade-down">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(returnPath || "/lessons")}
            className="text-[#68ba4a] hover:text-[#5a9a3d] font-semibold text-sm mb-3 flex items-center gap-1"
          >
            ← {returnPath ? "Back to Lesson" : "Back to Lessons"}
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {sectionTitle ? `Quiz: ${sectionTitle}` : lessonTitle ? `Quiz: ${lessonTitle}` : "Quiz"}
              </h1>
              <p className="text-sm text-[#060404]/70 mt-1">Student: {studentName}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {/* Timer */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#e8f5e9] to-[#f0f7f1] border border-[#b3ccb8]/40">
                <i className="fas fa-clock text-[#68ba4a]"></i>
                <span className="font-mono font-bold text-lg text-[#060404]">
                  {formatTime(elapsedTime)}
                </span>
              </div>
              {/* Question Counter */}
              <div className="text-right">
                <p className="text-sm text-[#060404]/70">Question</p>
                <p className="text-2xl font-bold text-[#68ba4a]">
                  {currentQuestion + 1}/{quizzes.length}
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full h-2 bg-[#e5f0e5] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#68ba4a] to-[#7cc55f] transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / quizzes.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Question */}
        <section
          className="bg-white rounded-2xl shadow-md border border-[#b3ccb8]/40 p-6 md:p-8 mb-6"
          data-aos="fade-up"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-8">{currentQuiz.question}</h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {optionKeys.map((key, index) => (
              <button
                key={key}
                data-aos="fade-right"
                data-aos-delay={index * 50}
                onClick={() => !showResult && handleAnswer(key)}
                disabled={showResult}
                className={`w-full text-left px-6 py-4 rounded-xl border-2 transition font-semibold ${selectedOption === key
                  ? key === currentQuiz.correct_answer
                    ? "bg-green-100 border-green-500 text-[#060404]"
                    : "bg-red-100 border-red-500 text-[#060404]"
                  : key === currentQuiz.correct_answer && showResult
                    ? "bg-green-100 border-green-500 text-[#060404]"
                    : "bg-white border-[#b3ccb8] hover:border-[#8baab1]"
                  } ${showResult ? "cursor-default" : "cursor-pointer hover:bg-[#f4f7f4]"}`}
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-current font-bold">
                    {key}
                  </span>
                  <span className="flex-1">{currentQuiz.options[key]}</span>
                  {selectedOption === key && showResult && (
                    <span className="ml-auto text-xl">
                      {key === currentQuiz.correct_answer ? "✅" : "❌"}
                    </span>
                  )}
                  {key === currentQuiz.correct_answer && showResult && selectedOption !== key && (
                    <span className="ml-auto text-green-600 font-semibold">✓ Correct</span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Hint */}
          {showResult && currentQuiz.hint && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
              <p className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                <i className="fas fa-lightbulb"></i>
                Hint:
              </p>
              <p className="text-sm text-[#060404]/80">{currentQuiz.hint}</p>
            </div>
          )}

          {/* Result message */}
          {showResult && (
            <div className={`border-l-4 rounded-lg p-4 mb-6 ${isCorrect
              ? "bg-green-50 border-green-500"
              : "bg-red-50 border-red-500"
              }`}>
              <p className={`font-semibold mb-2 ${isCorrect ? "text-green-700" : "text-red-700"
                }`}>
                {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
              </p>
              <p className="text-sm text-[#060404]/80">
                {isCorrect
                  ? "Great job! You selected the right answer."
                  : `The correct answer is ${currentQuiz.correct_answer}: ${currentQuiz.options[currentQuiz.correct_answer]}`
                }
              </p>
            </div>
          )}

          {/* Next button */}
          {showResult && (
            <button
              onClick={handleNext}
              disabled={submitting}
              className="w-full px-6 py-3 rounded-xl bg-[#68ba4a] text-white font-semibold hover:bg-[#5a9a3d] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>{isLastQuestion ? "Submit Quiz" : "Next Question"}</span>
                  <i className={`fas ${isLastQuestion ? "fa-check-circle" : "fa-arrow-right"}`}></i>
                </>
              )}
            </button>
          )}
        </section>

        {/* Progress indicator */}
        <div className="grid grid-cols-2 gap-4" data-aos="fade-up" data-aos-delay="100">
          <div className="bg-white rounded-xl p-4 border border-[#b3ccb8]/40">
            <p className="text-xs text-[#060404]/70 uppercase tracking-wide">Answered</p>
            <p className="text-2xl font-bold text-[#68ba4a]">{answers.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#b3ccb8]/40">
            <p className="text-xs text-[#060404]/70 uppercase tracking-wide">Remaining</p>
            <p className="text-2xl font-bold text-[#8baab1]">
              {quizzes.length - answers.length}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizInterface;
