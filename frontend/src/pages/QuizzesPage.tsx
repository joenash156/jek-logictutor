import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
//import api from "../services/api";

interface UserStats {
  level: number;
  xp: number;
  completedLessons: string[];
}

interface QuizzesPageProps {
  studentName: string;
  userStats?: UserStats;
  onUpdateStats?: (stats: UserStats) => void;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  order_index: number;
  is_active: boolean;
}

interface QuizCompletion {
  lessonId: string;
  completed: boolean;
  score: number;
}

export default function QuizzesPage({ userStats }: QuizzesPageProps) {
  const navigate = useNavigate();
  const { fetchLessons } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedQuizzes, setCompletedQuizzes] = useState<QuizCompletion[]>([]);

  useEffect(() => {
    document.title = "JEK Logic Tutor | Quizzes";
    async function loadLessonsAndProgress() {
      try {
        const fetchedLessons = await fetchLessons();
        setLessons(fetchedLessons);

        // Load quiz completion status from localStorage
        const storedCompletions = localStorage.getItem("quiz_completions");
        if (storedCompletions) {
          setCompletedQuizzes(JSON.parse(storedCompletions));
        }
      } catch (error) {
        console.error("Failed to load lessons:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLessonsAndProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isQuizCompleted = (lessonId: string): QuizCompletion | undefined => {
    return completedQuizzes.find((q) => q.lessonId === lessonId);
  };

  const isQuizUnlocked = (index: number): boolean => {
    // First lesson is always unlocked
    if (index === 0) return true;

    // Check if previous lesson's quiz is completed
    const prevLesson = lessons[index - 1];
    const prevCompletion = isQuizCompleted(prevLesson.id);
    return prevCompletion?.completed || false;
  };

  const handleStartQuiz = (lessonId: string, lessonTitle: string) => {
    navigate(`/quiz/lesson/${lessonId}`, {
      state: {
        lessonId,
        lessonTitle,
        returnPath: "/quizzes",
      },
    });
  };

  const getDifficultyBadge = (orderIndex: number) => {
    if (orderIndex <= 2) return { label: "Intro", color: "bg-[#b3ccb8]" };
    if (orderIndex <= 5) return { label: "Core", color: "bg-[#8baab1] text-white" };
    return { label: "Challenge", color: "bg-[#68ba4a] text-white" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] to-[#e8f5e9] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="quizzes" />

      <main className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 lg:p-8 md:ml-64 bg-transparent">
        <header className="mb-6" data-aos="fade-down">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-xl bg-white shadow-md text-[#060404] hover:bg-[#68ba4a] hover:text-white transition-all"
              aria-label="Toggle Menu"
            >
              <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
            </button>
            <div className="flex-1">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-xs sm:text-sm text-[#8baab1] hover:text-[#68ba4a] transition-colors flex items-center gap-1 mb-2"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#060404] flex items-center gap-3">
                <i className="fas fa-clipboard-check text-[#68ba4a]"></i>
                Quizzes
              </h1>
              <p className="text-xs sm:text-sm text-[#060404]/70 mt-2">
                Test your knowledge and earn XP. Complete quizzes in order to unlock new ones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border-2 border-[#e8f5e9] shadow-sm w-fit">
            <i className="fas fa-layer-group text-[#8baab1]"></i>
            <div className="text-xs">
              <span className="text-[#060404]/60 block">Level</span>
              <span className="font-bold text-lg text-[#68ba4a]">{userStats?.level || 0}</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <i className="fas fa-spinner fa-spin text-4xl text-[#68ba4a]"></i>
              <p className="text-sm text-[#060404]/60">Loading quizzes...</p>
            </div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4 text-center">
              <i className="fas fa-inbox text-5xl text-[#8baab1]/50"></i>
              <p className="text-lg font-semibold text-[#060404]">No quizzes available</p>
              <p className="text-sm text-[#060404]/60">Check back later for new content</p>
            </div>
          </div>
        ) : (
          <>
            {/* Quizzes Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-[#060404]/70">
                <i className="fas fa-clipboard-list text-[#68ba4a] mr-2"></i>
                Showing <span className="font-semibold text-[#68ba4a]">{lessons.length}</span> {lessons.length === 1 ? 'quiz' : 'quizzes'}
              </p>
            </div>

            {/* Quizzes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {lessons.map((lesson, index) => {
                const unlocked = isQuizUnlocked(index);
                const completion = isQuizCompleted(lesson.id);
                const difficulty = getDifficultyBadge(lesson.order_index);

                return (
                  <article
                    key={lesson.id}
                    data-aos="flip-left"
                    data-aos-delay={index * 50}
                    className={`bg-white rounded-2xl shadow-md border-2 transition-all duration-300 ${unlocked
                      ? "border-[#b3ccb8]/40 hover:border-[#68ba4a]/50 hover:shadow-xl"
                      : "border-gray-200 opacity-75"
                      } p-5 flex flex-col space-y-3`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${unlocked
                            ? "bg-gradient-to-br from-[#68ba4a] to-[#8baab1]"
                            : "bg-gray-300"
                            }`}
                        >
                          <i className="fas fa-clipboard-question text-white"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-[#8baab1]">
                              Quiz {index + 1}
                            </span>
                          </div>
                          <h2 className="font-bold text-base sm:text-lg text-[#060404] line-clamp-2">
                            {lesson.title}
                          </h2>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${difficulty.color}`}>
                          {difficulty.label}
                        </span>
                        {completion?.completed && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-300 font-semibold">
                            ✓ {completion.score}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Preview */}
                    <p className="text-xs sm:text-sm text-[#060404]/70 line-clamp-3 flex-1">
                      Test your understanding of {lesson.title.toLowerCase()}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded-full bg-[#f4f7f4] flex items-center gap-1">
                        <i className="fas fa-clock text-[#8baab1]"></i>
                        <span>~15 min</span>
                      </span>
                      <span className="px-2 py-1 rounded-full bg-[#f4f7f4] flex items-center gap-1">
                        <i className="fas fa-trophy text-[#68ba4a]"></i>
                        <span>75 XP</span>
                      </span>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => unlocked && handleStartQuiz(lesson.id, lesson.title)}
                        disabled={!unlocked}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${unlocked
                          ? "bg-gradient-to-r from-[#68ba4a] to-[#7cc55f] text-white hover:from-[#5ca03e] hover:to-[#68ba4a] shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        {unlocked ? (
                          <>
                            <i className="fas fa-play-circle"></i>
                            <span>{completion?.completed ? "Retake Quiz" : "Start Quiz"}</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-lock"></i>
                            <span>Complete Previous Quiz</span>
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
