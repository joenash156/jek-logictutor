import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface UserStats {
  level: number;
  xp: number;
  completedLessons: string[];
}

interface ScoresPageProps {
  studentName: string;
  userStats?: UserStats;
}

interface LessonScore {
  id: string;
  lesson_id: string;
  lessonTitle: string;
  score: number;
  status: "passed" | "failed";
  updated_at: string;
}

interface QuizSubmission {
  id: string;
  section_id: string;
  sectionTitle: string;
  score: number;
  status: "passed" | "failed";
  attempt_number: number;
  duration_seconds: number;
  created_at: string;
}

export default function ScoresPage({ studentName }: ScoresPageProps) {
  const navigate = useNavigate();
  const { fetchLessons } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lessonScores, setLessonScores] = useState<LessonScore[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"overview" | "lessons" | "quizzes">("overview");

  useEffect(() => {
    document.title = "JEK Logic Tutor | My Scores";
    loadScoresData();
  }, []);

  const loadScoresData = async () => {
    try {
      setLoading(true);

      // Fetch all lessons to get titles
      const lessons = await fetchLessons();
      const lessonsMap: Record<string, string> = {};
      lessons.forEach((lesson: any) => {
        lessonsMap[lesson.id] = lesson.title;
      });

      // Fetch all quiz submissions for the user
      const submissionsResponse = await api.get("/quiz_submission/user_submissions");

      if (submissionsResponse.data.success) {
        const submissions = submissionsResponse.data.submissions;

        // Get section titles
        const sectionsResponse = await api.get("/sections/all");
        const sectionsMap: Record<string, string> = {};
        if (sectionsResponse.data.success) {
          sectionsResponse.data.sections.forEach((section: any) => {
            sectionsMap[section.id] = section.title;
          });
        }

        // Process quiz submissions with section titles
        const processedSubmissions = submissions.map((sub: any) => ({
          ...sub,
          sectionTitle: sectionsMap[sub.section_id] || "Unknown Section",
        }));

        setRecentSubmissions(processedSubmissions);

        // Fetch computed lesson scores from backend
        const scoresResponse = await api.get("/scores/user_scores");

        if (scoresResponse.data.success && scoresResponse.data.scores.length > 0) {
          const scores: LessonScore[] = scoresResponse.data.scores.map((scoreData: any) => ({
            id: scoreData.id,
            lesson_id: scoreData.lesson_id,
            lessonTitle: scoreData.lesson_title,
            score: scoreData.score,
            status: scoreData.status,
            updated_at: scoreData.updated_at,
          }));

          setLessonScores(scores.sort((a, b) => b.score - a.score));
        } else {
          // Fallback: Calculate from submissions (for lessons not yet completed)
          const lessonScoresMap: Record<string, { scores: number[], updated: string }> = {};

          submissions.forEach((sub: any) => {
            const section = sectionsResponse.data?.sections?.find((s: any) => s.id === sub.section_id);
            if (section) {
              const lessonId = section.lesson_id;
              if (!lessonScoresMap[lessonId]) {
                lessonScoresMap[lessonId] = { scores: [], updated: sub.created_at };
              }
              lessonScoresMap[lessonId].scores.push(sub.score);
              if (new Date(sub.created_at) > new Date(lessonScoresMap[lessonId].updated)) {
                lessonScoresMap[lessonId].updated = sub.created_at;
              }
            }
          });

          const scores: LessonScore[] = Object.entries(lessonScoresMap).map(([lessonId, data]) => {
            const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
            return {
              id: `score-${lessonId}`,
              lesson_id: lessonId,
              lessonTitle: lessonsMap[lessonId] || "Unknown Lesson",
              score: avgScore,
              status: avgScore >= 50 ? "passed" : "failed",
              updated_at: data.updated,
            };
          });

          setLessonScores(scores.sort((a, b) => b.score - a.score));
        }
      }
    } catch (error) {
      console.error("Failed to load scores:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallScore = () => {
    if (lessonScores.length === 0) return 0;
    const total = lessonScores.reduce((sum, score) => sum + score.score, 0);
    return Math.round(total / lessonScores.length);
  };

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: "A+", color: "text-green-600", bg: "bg-green-50", border: "border-green-500" };
    if (score >= 80) return { grade: "A", color: "text-green-500", bg: "bg-green-50", border: "border-green-400" };
    if (score >= 70) return { grade: "B", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-500" };
    if (score >= 60) return { grade: "C", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-500" };
    if (score >= 50) return { grade: "D", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-500" };
    return { grade: "F", color: "text-red-600", bg: "bg-red-50", border: "border-red-500" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const overallScore = calculateOverallScore();
  const overallGrade = getGrade(overallScore);
  const passedCount = lessonScores.filter(s => s.status === "passed").length;
  const failedCount = lessonScores.filter(s => s.status === "failed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] to-[#e8f5e9] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="scores" />

      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 md:ml-64">
        {/* Header */}
        <header className="mb-6" data-aos="fade-down">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-xl bg-white shadow-md text-[#060404] hover:bg-[#68ba4a] hover:text-white transition-all"
              aria-label="Toggle Menu"
            >
              <i className={`fas ${sidebarOpen ? "fa-times" : "fa-bars"} text-lg`}></i>
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
                <i className="fas fa-chart-bar text-[#68ba4a]"></i>
                My Scores
              </h1>
              <p className="text-xs sm:text-sm text-[#060404]/70 mt-2">
                Track your performance and progress across all lessons
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border-2 border-[#e8f5e9] shadow-sm w-fit">
            <i className="fas fa-user-graduate text-[#8baab1]"></i>
            <div className="text-xs">
              <span className="text-[#060404]/60 block">Student</span>
              <span className="font-bold text-sm text-[#060404]">{studentName}</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <i className="fas fa-spinner fa-spin text-4xl text-[#68ba4a]"></i>
              <p className="text-sm text-[#060404]/60">Loading your scores...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-md border border-[#b3ccb8]/40 mb-6 overflow-hidden" data-aos="fade-up">
              <div className="flex border-b border-[#e8f5e9]">
                <button
                  onClick={() => setSelectedTab("overview")}
                  className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base transition-all ${selectedTab === "overview"
                    ? "bg-gradient-to-r from-[#68ba4a] to-[#7cc55f] text-white"
                    : "text-[#060404]/70 hover:bg-[#f8faf9]"
                    }`}
                >
                  <i className="fas fa-chart-pie mr-2"></i>
                  <span className="hidden sm:inline">Overview</span>
                </button>
                <button
                  onClick={() => setSelectedTab("lessons")}
                  className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base transition-all ${selectedTab === "lessons"
                    ? "bg-gradient-to-r from-[#68ba4a] to-[#7cc55f] text-white"
                    : "text-[#060404]/70 hover:bg-[#f8faf9]"
                    }`}
                >
                  <i className="fas fa-book mr-2"></i>
                  <span className="hidden sm:inline">Lessons</span>
                </button>
                <button
                  onClick={() => setSelectedTab("quizzes")}
                  className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base transition-all ${selectedTab === "quizzes"
                    ? "bg-gradient-to-r from-[#68ba4a] to-[#7cc55f] text-white"
                    : "text-[#060404]/70 hover:bg-[#f8faf9]"
                    }`}
                >
                  <i className="fas fa-clipboard-check mr-2"></i>
                  <span className="hidden sm:inline">Quizzes</span>
                </button>
              </div>
            </div>

            {/* Overview Tab */}
            {selectedTab === "overview" && (
              <div className="space-y-6">
                {/* Overall Performance Card */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-[#b3ccb8]/40 p-6 sm:p-8" data-aos="fade-up">
                  <h2 className="text-xl font-bold text-[#060404] mb-6 flex items-center gap-2">
                    <i className="fas fa-trophy text-[#68ba4a]"></i>
                    Overall Performance
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Overall Score */}
                    <div className={`${overallGrade.bg} border-2 ${overallGrade.border} rounded-xl p-6 text-center`}>
                      <div className={`text-6xl font-bold ${overallGrade.color} mb-2`}>
                        {overallGrade.grade}
                      </div>
                      <div className="text-3xl font-bold text-[#060404] mb-1">{overallScore}%</div>
                      <p className="text-xs text-[#060404]/70">Overall Score</p>
                    </div>

                    {/* Passed Lessons */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500 rounded-xl p-6 text-center">
                      <i className="fas fa-check-circle text-4xl text-green-600 mb-3"></i>
                      <div className="text-3xl font-bold text-green-700">{passedCount}</div>
                      <p className="text-xs text-green-700">Lessons Passed</p>
                    </div>

                    {/* Failed Lessons */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-500 rounded-xl p-6 text-center">
                      <i className="fas fa-times-circle text-4xl text-red-600 mb-3"></i>
                      <div className="text-3xl font-bold text-red-700">{failedCount}</div>
                      <p className="text-xs text-red-700">Needs Improvement</p>
                    </div>

                    {/* Total Attempts */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500 rounded-xl p-6 text-center">
                      <i className="fas fa-chart-line text-4xl text-blue-600 mb-3"></i>
                      <div className="text-3xl font-bold text-blue-700">{recentSubmissions.length}</div>
                      <p className="text-xs text-blue-700">Total Attempts</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-[#b3ccb8]/40 p-6" data-aos="fade-up" data-aos-delay="100">
                  <h3 className="text-lg font-bold text-[#060404] mb-4 flex items-center gap-2">
                    <i className="fas fa-history text-[#68ba4a]"></i>
                    Recent Quiz Attempts
                  </h3>

                  {recentSubmissions.length === 0 ? (
                    <div className="text-center py-8 text-[#060404]/60">
                      <i className="fas fa-inbox text-4xl mb-3"></i>
                      <p>No quiz attempts yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentSubmissions.slice(0, 5).map((submission) => {
                        const grade = getGrade(submission.score);
                        return (
                          <div
                            key={submission.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#f8faf9] to-[#f0f7f1] border border-[#e8f5e9] hover:border-[#68ba4a]/30 transition-all"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-12 h-12 rounded-lg ${grade.bg} border-2 ${grade.border} flex items-center justify-center`}>
                                <span className={`font-bold ${grade.color}`}>{grade.grade}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-[#060404]">{submission.sectionTitle}</p>
                                <p className="text-xs text-[#060404]/60">
                                  {formatDate(submission.created_at)} • {formatDuration(submission.duration_seconds)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-[#68ba4a]">{submission.score}%</p>
                              <p className="text-xs text-[#060404]/60">Attempt #{submission.attempt_number}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lessons Tab */}
            {selectedTab === "lessons" && (
              <div className="space-y-4">
                {lessonScores.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-[#b3ccb8]/40 p-12 text-center">
                    <i className="fas fa-book-open text-5xl text-[#8baab1]/50 mb-4"></i>
                    <p className="text-lg font-semibold text-[#060404]">No lesson scores yet</p>
                    <p className="text-sm text-[#060404]/60 mt-2">Complete some quizzes to see your lesson scores</p>
                  </div>
                ) : (
                  lessonScores.map((score, index) => {
                    const grade = getGrade(score.score);
                    return (
                      <div
                        key={score.id}
                        data-aos="fade-up"
                        data-aos-delay={index * 50}
                        className="bg-white rounded-2xl shadow-md border-2 border-[#b3ccb8]/40 hover:border-[#68ba4a]/50 hover:shadow-lg transition-all p-6"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-16 h-16 rounded-xl ${grade.bg} border-2 ${grade.border} flex items-center justify-center`}>
                              <span className={`text-2xl font-bold ${grade.color}`}>{grade.grade}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-[#060404] mb-1">{score.lessonTitle}</h3>
                              <p className="text-sm text-[#060404]/60">
                                Last updated: {formatDate(score.updated_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl font-bold text-[#68ba4a] mb-1">{score.score}%</div>
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${score.status === "passed"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-red-100 text-red-700 border border-red-300"
                              }`}>
                              {score.status === "passed" ? "✓ Passed" : "✗ Needs Review"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Quizzes Tab */}
            {selectedTab === "quizzes" && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-[#b3ccb8]/40 overflow-hidden">
                {recentSubmissions.length === 0 ? (
                  <div className="p-12 text-center">
                    <i className="fas fa-clipboard-question text-5xl text-[#8baab1]/50 mb-4"></i>
                    <p className="text-lg font-semibold text-[#060404]">No quiz attempts yet</p>
                    <p className="text-sm text-[#060404]/60 mt-2">Start taking quizzes to track your progress</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-[#f8faf9] to-[#f0f7f1] border-b-2 border-[#b3ccb8]/40">
                        <tr>
                          <th className="px-4 py-4 text-left text-sm font-bold text-[#060404]">Section</th>
                          <th className="px-4 py-4 text-center text-sm font-bold text-[#060404]">Score</th>
                          <th className="px-4 py-4 text-center text-sm font-bold text-[#060404]">Grade</th>
                          <th className="px-4 py-4 text-center text-sm font-bold text-[#060404]">Status</th>
                          <th className="px-4 py-4 text-center text-sm font-bold text-[#060404]">Attempt</th>
                          <th className="px-4 py-4 text-center text-sm font-bold text-[#060404]">Duration</th>
                          <th className="px-4 py-4 text-left text-sm font-bold text-[#060404]">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentSubmissions.map((submission, index) => {
                          const grade = getGrade(submission.score);
                          return (
                            <tr
                              key={submission.id}
                              className={`border-b border-[#e8f5e9] hover:bg-[#f8faf9] transition-colors ${index % 2 === 0 ? "bg-white" : "bg-[#f8faf9]/50"
                                }`}
                            >
                              <td className="px-4 py-4">
                                <p className="font-semibold text-sm text-[#060404]">{submission.sectionTitle}</p>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="text-xl font-bold text-[#68ba4a]">{submission.score}%</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${grade.bg} border-2 ${grade.border} font-bold ${grade.color}`}>
                                  {grade.grade}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${submission.status === "passed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                                  }`}>
                                  {submission.status === "passed" ? "Passed" : "Failed"}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center text-sm text-[#060404]/70">
                                #{submission.attempt_number}
                              </td>
                              <td className="px-4 py-4 text-center text-sm text-[#060404]/70">
                                {formatDuration(submission.duration_seconds)}
                              </td>
                              <td className="px-4 py-4 text-sm text-[#060404]/70">
                                {formatDate(submission.created_at)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
