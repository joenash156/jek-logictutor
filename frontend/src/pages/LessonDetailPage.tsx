// src/pages/LessonDetailPage.tsx
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

interface UserStats {
  level: number;
  xp: number;
  completedLessons: string[];
}

interface LessonDetailPageProps {
  studentName: string;
  userStats?: UserStats;
  onUpdateStats?: (stats: UserStats) => void;
}

interface LessonSection {
  id: string;
  title: string;
  content: string;
  order_index: number;
  is_active: boolean;
}

interface LessonData {
  id: string;
  title: string;
  content: string;
  order_index: number;
  is_active: boolean;
  sections?: LessonSection[];
}

interface LessonProgress {
  sectionId: string;
  title: string;
  orderIndex: number;
  isCompleted: boolean;
  lastScore: number | null;
  attempts: number;
  completedAt: string | null;
}

const LessonDetailPage = ({ studentName, userStats: propsUserStats, onUpdateStats: propsOnUpdateStats }: LessonDetailPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [sections, setSections] = useState<LessonSection[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [quizTaken, setQuizTaken] = useState<{ [key: string]: boolean }>({});

  const userStats = (propsUserStats || location.state?.userStats || {
    level: 0,
    xp: 0,
    completedLessons: [],
  }) as UserStats;

  const onUpdateStats = propsOnUpdateStats || location.state?.onUpdateStats;

  useEffect(() => {
    async function loadLessonData() {
      if (!id) {
        navigate("/lessons");
        return;
      }

      try {
        const response = await api.get(`/lessons/lesson/${id}`);
        if (!response.data.success) {
          throw new Error("Lesson not found");
        }

        setLesson(response.data.lesson);

        const sectionsResponse = await api.get(`/sections/${id}`);
        if (sectionsResponse.data.success) {
          setSections(sectionsResponse.data.sections);
        }

        try {
          const progressResponse = await api.get(`/lesson_progress/${id}`);
          if (progressResponse.data.success) {
            setProgress(progressResponse.data.sections);
            const firstIncompleteIndex = progressResponse.data.sections.findIndex(
              (section: LessonProgress) => !section.isCompleted
            );
            if (firstIncompleteIndex !== -1) {
              setCurrentSectionIndex(firstIncompleteIndex);
            }
          }
        } catch (err) {
          console.log("No progress found, starting fresh", err);
          setProgress([]);
        }
      } catch (error) {
        console.error("Failed to load lesson:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load lesson. Redirecting...",
          confirmButtonColor: "#68ba4a",
        });
        navigate("/lessons");
      } finally {
        setLoading(false);
      }
    }

    loadLessonData();
  }, [id, navigate]);

  useEffect(() => {
    document.title = "JEK Logic Tutor | Lesson Sections";
  }, []);

  // NEW: Handle direct section access from overview
  const handleSectionClick = (index: number) => {
    if (!isStarted) {
      setIsStarted(true);
    }
    setCurrentSectionIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartLesson = () => {
    if (sections.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Sections Available",
        text: "No sections available for this lesson yet.",
        confirmButtonColor: "#68ba4a",
      });
      return;
    }
    setIsStarted(true);
    const firstIncompleteIndex = progress.findIndex(p => !p.isCompleted);
    if (firstIncompleteIndex !== -1) {
      setCurrentSectionIndex(firstIncompleteIndex);
    } else {
      setCurrentSectionIndex(0);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTakeQuiz = (sectionId: string) => {
    // Navigate to quiz page with section info
    navigate(`/quiz/section/${sectionId}`, {
      state: {
        lessonId: id,
        sectionId,
        sectionIndex: currentSectionIndex,
        sectionTitle: currentSection.title,
        returnPath: `/lesson/${id}`,
      },
    });
  };

  const handleNextSection = async () => {
    const currentSection = sections[currentSectionIndex];

    if (!quizTaken[currentSection.id]) {
      await Swal.fire({
        icon: "warning",
        title: "Quiz Required",
        text: "Please complete the quiz for this section before proceeding.",
        confirmButtonColor: "#68ba4a",
        confirmButtonText: "Take Quiz",
      }).then((result) => {
        if (result.isConfirmed) {
          handleTakeQuiz(currentSection.id);
        }
      });
      return;
    }

    try {
      await api.post("/lesson_progress/update", {
        sectionId: currentSection.id,
        isCompleted: true,
        lastScore: 100,
      });

      const progressResponse = await api.get(`/lesson_progress/${id}`);
      if (progressResponse.data.success) {
        setProgress(progressResponse.data.sections);
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
      await Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Failed to save progress. Please try again.",
        confirmButtonColor: "#68ba4a",
      });
      return;
    }

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleCompleteLesson();
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleCompleteLesson = async () => {
    const xpReward = 50;

    try {
      if (userStats && onUpdateStats && lesson) {
        const updated = {
          ...userStats,
          xp: userStats.xp + xpReward,
          level: Math.floor((userStats.xp + xpReward) / 100),
          completedLessons: userStats.completedLessons.includes(id || "")
            ? userStats.completedLessons
            : [...userStats.completedLessons, id || ""],
        };
        onUpdateStats(updated);

        // Save XP to localStorage
        const currentXP = parseInt(localStorage.getItem("user_xp") || "0");
        localStorage.setItem("user_xp", (currentXP + xpReward).toString());

        await Swal.fire({
          icon: "success",
          title: "Lesson Completed!",
          html: `
            <div class="text-center">
              <p class="text-lg mb-2">Congratulations! 🎉</p>
              <p class="text-2xl font-bold text-green-600">+${xpReward} XP</p>
            </div>
          `,
          confirmButtonColor: "#68ba4a",
          confirmButtonText: "Continue",
        });
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
    } finally {
      setIsStarted(false);
      navigate("/lessons");
    }
  };

  const getSectionProgress = (sectionId: string) => {
    return progress.find(p => p.sectionId === sectionId);
  };

  // Load quiz completion status from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`quiz_taken_${id}`);
    if (stored) {
      setQuizTaken(JSON.parse(stored));
    }
  }, [id]);

  // Update quiz taken status when returning from quiz
  useEffect(() => {
    if (location.state?.quizCompleted && location.state?.sectionId) {
      setQuizTaken((prev) => {
        const updated = { ...prev, [location.state.sectionId]: true };
        localStorage.setItem(`quiz_taken_${id}`, JSON.stringify(updated));
        return updated;
      });

      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf9f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <i className="fas fa-spinner fa-spin text-4xl text-[#68ba4a]"></i>
          <p className="text-sm text-[#060404]/60">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2 text-[#68ba4a] animate-spin" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3a1 1 0 00.293.707l2 2a1 1 0 001.414-1.414L11 9.586V7z" clipRule="evenodd" />
            </svg>
          </p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#fbf9f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <i className="fas fa-exclamation-triangle text-5xl text-[#8baab1]/50"></i>
          <p className="text-lg font-semibold text-[#060404]">Lesson not found</p>
          <button
            onClick={() => navigate("/lessons")}
            className="px-6 py-3 rounded-xl bg-[#68ba4a] text-white font-semibold hover:bg-[#5a9a3d] transition"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  const currentSection = sections[currentSectionIndex];

  // Calculate progress based on database data
  const completedSectionsCount = progress.filter(p => p.isCompleted).length;
  const progressPercentage = sections.length > 0
    ? Math.round((completedSectionsCount / sections.length) * 100)
    : 0;

  // Check if current section is completed
  const isCurrentSectionCompleted = progress.find(
    p => p.sectionId === currentSection?.id
  )?.isCompleted || false;



  return (
    <div className="min-h-screen bg-[#fbf9f9] text-[#060404]">
      {/* Add custom styles for HTML content */}
      <style>{`
        .lesson-content p {
          margin: 0 0 1em 0;
        }
        .lesson-content p:last-child {
          margin-bottom: 0;
        }
        .lesson-content h1,
        .lesson-content h2,
        .lesson-content h3,
        .lesson-content h4,
        .lesson-content h5,
        .lesson-content h6 {
          margin: 1.5em 0 0.75em 0;
        }
        .lesson-content h1:first-child,
        .lesson-content h2:first-child,
        .lesson-content h3:first-child,
        .lesson-content h4:first-child,
        .lesson-content h5:first-child,
        .lesson-content h6:first-child {
          margin-top: 0;
        }
        .lesson-content ul,
        .lesson-content ol {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
        .lesson-content li {
          margin: 0.25em 0;
        }
        .lesson-content blockquote {
          margin: 1em 0;
          padding-left: 1em;
          border-left: 3px solid #68ba4a;
        }
        .lesson-content pre {
          margin: 1em 0;
          padding: 1em;
          background: #f4f7f4;
          border-radius: 0.5em;
          overflow-x: auto;
        }
        .lesson-content code {
          background: #f4f7f4;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-size: 0.9em;
        }
        .lesson-content pre code {
          background: transparent;
          padding: 0;
        }
        .lesson-content img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
        }
        .lesson-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        .lesson-content th,
        .lesson-content td {
          border: 1px solid #e8f5e9;
          padding: 0.5em;
          text-align: left;
        }
        .lesson-content th {
          background: #f4f7f4;
          font-weight: 600;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-[#b3ccb8]/40 p-4 md:p-6" data-aos="fade-down">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/lessons")}
            className="text-[#68ba4a] hover:text-[#5a9a3d] font-semibold text-sm mb-3 flex items-center gap-1"
          >
            ← Back to Lessons
          </button>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{lesson.title}</h1>
              <p className="text-[#060404]/70 mb-4">{lesson.content.substring(0, 150)}...</p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 flex items-center gap-1 py-1 rounded-full bg-[#b3ccb8]/30 text-sm font-semibold">
                  <i className="fas fa-book text-[#68ba4a]"></i>
                  <span>Lesson {lesson.order_index}</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-[#68ba4a]/20 text-sm flex items-center gap-1">
                  <i className="fas fa-trophy text-[#68ba4a]"></i>
                  <span>+50 XP</span>
                </span>
                {lesson.is_active && (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-300 text-sm font-semibold">
                    Active
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-300 text-sm font-semibold flex items-center gap-1">
                  <i className="fas fa-layer-group text-blue-700"></i>
                  <span>{sections.length} {sections.length === 1 ? 'Section' : 'Sections'}</span>
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#060404]/70">Student</p>
              <span className="mt-1 flex items-center gap-2 justify-end">
                <i className="fas fa-user text-[#68ba4a]"></i>
                <p className="font-semibold text-lg text-[#060404]">{studentName}</p>
              </span>
            </div>
          </div>

          {/* Enhanced Progress Bar with database sync */}
          {isStarted && sections.length > 0 && (
            <div className="mt-6 bg-gradient-to-r from-[#f8faf9] to-[#e8f5e9] rounded-xl p-4 border-2 border-[#e8f5e9]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <i className="fas fa-book-reader text-[#68ba4a]"></i>
                  <p className="text-sm font-semibold text-[#060404]">
                    Section {currentSectionIndex + 1} of {sections.length}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#68ba4a]">
                    {progressPercentage}% Complete
                  </span>
                  {isCurrentSectionCompleted && (
                    <i className="fas fa-check-circle text-green-500"></i>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative w-full h-4 bg-white rounded-full overflow-hidden shadow-inner border border-[#b3ccb8]/30">
                <div
                  className="h-full bg-gradient-to-r from-[#68ba4a] via-[#7cc55f] to-[#68ba4a] transition-all duration-700 ease-out relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {progressPercentage > 0 && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  )}
                </div>
              </div>

              {/* Progress details */}
              <div className="flex items-center justify-between mt-2 text-xs text-[#060404]/60">
                <span>{completedSectionsCount} of {sections.length} sections completed</span>
                <span>{sections.length - completedSectionsCount} remaining</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {!isStarted ? (
          <>
            {/* Lesson Overview */}
            <section className="bg-white rounded-2xl shadow-md border border-[#b3ccb8]/40 p-6 mb-6" data-aos="fade-up">
              <h2 className="text-xl font-bold mb-4">📖 Lesson Overview</h2>
              <p className="text-[#060404]/80 leading-relaxed mb-6">{lesson.content}</p>

              {/* Clickable Sections List */}
              {sections.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg mb-3">What you'll learn:</h3>
                  {sections.map((section, i) => {
                    const sectionProgress = getSectionProgress(section.id);
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionClick(i)}
                        data-aos="fade-right"
                        data-aos-delay={i * 50}
                        className="w-full bg-[#f4f7f4] hover:bg-[#e8f5e9] rounded-xl p-4 border-l-4 border-[#68ba4a] flex items-start gap-3 transition-all hover:shadow-md group"
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-bold transition-transform group-hover:scale-110 ${sectionProgress?.isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-[#68ba4a]/20 text-[#68ba4a]'
                          }`}>
                          {sectionProgress?.isCompleted ? (
                            <i className="fas fa-check text-sm"></i>
                          ) : (
                            <span className="text-sm">{i + 1}</span>
                          )}
                        </div>

                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-[#060404] group-hover:text-[#68ba4a] transition-colors">
                              {section.title}
                            </p>
                            <div className="flex items-center gap-2">
                              {section.is_active && (
                                <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-300 font-semibold">
                                  Active
                                </span>
                              )}
                              <i className="fas fa-arrow-right text-[#8baab1] opacity-0 group-hover:opacity-100 transition-opacity"></i>
                            </div>
                          </div>
                          <div
                            className="text-sm text-[#060404]/70 line-clamp-2 lesson-content"
                            dangerouslySetInnerHTML={{ __html: section.content.substring(0, 100) + "..." }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Start Button */}
            <div className="flex justify-center">
              <button
                onClick={handleStartLesson}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#68ba4a] to-[#7cc55f] text-white font-bold text-lg hover:from-[#5a9a3d] hover:to-[#68ba4a] transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-3"
              >
                <i className="fas fa-play-circle text-2xl"></i>
                <span>Start From Beginning</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Section Navigation */}
            <div
              className="bg-white rounded-2xl border border-[#b3ccb8]/40 p-6 mb-8"
              data-aos="fade-down"
            >
              <h3 className="font-bold text-lg mb-4">All Sections</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sections.map((section, i) => {
                  const sectionProgress = getSectionProgress(section.id);
                  const isCurrent = i === currentSectionIndex;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(i)}
                      className={`text-left p-3 rounded-xl transition-all border-2 ${isCurrent
                        ? 'border-[#68ba4a] bg-[#68ba4a]/10'
                        : sectionProgress?.isCompleted
                          ? 'border-green-300 bg-green-50 hover:border-green-400'
                          : 'border-[#e8f5e9] bg-[#f8faf9] hover:border-[#b3ccb8]'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${sectionProgress?.isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                              ? 'bg-[#68ba4a] text-white'
                              : 'bg-[#e8f5e9] text-[#8baab1]'
                            }`}
                        >
                          {sectionProgress?.isCompleted ? (
                            <i className="fas fa-check"></i>
                          ) :
                            (
                              i + 1
                            )}
                        </div>
                        <span className={`text-sm font-semibold ${isCurrent ? 'text-[#68ba4a]' : 'text-[#060404]'}`}>
                          {section.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Current Section Content */}
            {currentSection && (
              <section
                className="bg-white rounded-2xl border border-[#b3ccb8]/40 p-6 mb-6"
                data-aos="fade-up"
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-[#8baab1]">
                      Section {currentSectionIndex + 1} of {sections.length}
                    </span>
                    {currentSection.is_active && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-300 font-semibold">
                        Active
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-[#060404]">{currentSection.title}</h2>
                </div>

                <div
                  className="prose lesson-content text-[#060404]/80 leading-relaxed mb-6"
                  dangerouslySetInnerHTML={{ __html: currentSection.content }}
                />

                {/* Quiz Section */}
                <div className="mt-8 bg-gradient-to-r from-[#e8f5e9] to-[#f0f7f1] rounded-xl p-6 border-2 border-[#b3ccb8]/40">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#68ba4a] to-[#7cc55f] flex items-center justify-center shrink-0 shadow-md">
                      <i className="fas fa-clipboard-question text-white text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#060404] mb-2 flex items-center gap-2">
                        Section Quiz
                        {quizTaken[currentSection.id] && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-300">
                            ✓ Completed
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-[#060404]/70 mb-4">
                        Test your understanding of this section with a quick quiz. You must complete the quiz to proceed to the next section.
                      </p>
                      <button
                        onClick={() => handleTakeQuiz(currentSection.id)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#68ba4a] to-[#7cc55f] text-white font-semibold hover:from-[#5a9a3d] hover:to-[#68ba4a] transition shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        <i className="fas fa-play-circle"></i>
                        <span>{quizTaken[currentSection.id] ? 'Retake Quiz' : 'Take Quiz'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}


            {/* Navigation Buttons */}
            <div
              className="flex flex-col md:flex-row gap-3 mb-6"

            >
              <button
                onClick={handlePreviousSection}
                disabled={currentSectionIndex === 0}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition shadow-md flex items-center justify-center gap-2 ${currentSectionIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#8baab1] text-white hover:bg-[#7a9aa1]'
                  }`}
              >
                <i className="fas fa-arrow-left"></i>
                <span>Previous Section</span>
              </button>
              <button
                onClick={handleNextSection}
                className="flex-1 px-6 py-3 rounded-xl bg-[#68ba4a] text-white font-semibold hover:bg-[#5a9a3d] transition shadow-md flex items-center justify-center gap-2"
              >
                <span>
                  {currentSectionIndex === sections.length - 1 ? 'Complete Lesson' : 'Next Section'}
                </span>
                <i className={`fas ${currentSectionIndex === sections.length - 1 ? 'fa-check-circle' : 'fa-arrow-right'}`}></i>
              </button>
            </div>


          </>
        )}
      </main>
    </div>
  );
};

export default LessonDetailPage;
