// src/pages/LessonsPage.tsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

interface UserStats {
  level: number;
  xp: number;
  completedLessons: string[];
}

interface LessonsPageProps {
  studentName: string;
  userStats?: UserStats;
  onUpdateStats?: (stats: UserStats) => void;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  order_index?: number;
  is_active: boolean;
}

const LessonsPage = ({ studentName, userStats }: LessonsPageProps) => {
  const navigate = useNavigate();
  const { fetchLessons } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadLessons() {
      try {
        const fetchedLessons = await fetchLessons();
        setLessons(fetchedLessons);
      } catch (error) {
        console.error("Failed to load lessons:", error);
      } finally {
        setLoading(false);
      }
    }
    loadLessons();
  }, [fetchLessons]);

  const handleStartLesson = (id: string) => {
    navigate(`/lesson/${id}`);
  };

  // Filter lessons based on search query
  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    document.title = "JEK Logic Tutor | Lessons";
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f8faf9] to-[#e8f5e9] flex">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="lessons" />

      {/* Main content */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 md:ml-64">
        {/* Header */}
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
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-xs sm:text-sm text-[#8baab1] hover:text-[#68ba4a] transition-colors flex items-center gap-1"
                >
                  <i className="fas fa-arrow-left"></i>
                  <span>Back to Dashboard</span>
                </button>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#060404] flex items-center gap-3">
                <i className="fas fa-book-open text-[#68ba4a]"></i>
                Lessons
              </h1>
              <p className="text-xs sm:text-sm text-[#060404]/70 mt-2">
                Hi {studentName}, explore our lessons and start your learning journey
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#8baab1]"></i>
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#b3ccb8] text-sm focus:outline-none focus:ring-2 focus:ring-[#68ba4a] focus:border-transparent bg-white transition-all"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border-2 border-[#e8f5e9] shadow-sm">
              <i className="fas fa-layer-group text-[#8baab1]"></i>
              <div className="text-xs">
                <span className="text-[#060404]/60 block">Level</span>
                <span className="font-bold text-lg text-[#68ba4a]">{userStats?.level || 0}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <i className="fas fa-spinner fa-spin text-4xl text-[#68ba4a]"></i>
              <p className="text-sm text-[#060404]/60">Loading lessons...</p>
            </div>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4 text-center">
              <i className="fas fa-inbox text-5xl text-[#8baab1]/50"></i>
              <p className="text-lg font-semibold text-[#060404]">
                {searchQuery ? "No lessons found" : "No lessons available"}
              </p>
              <p className="text-sm text-[#060404]/60">
                {searchQuery ? "Try adjusting your search" : "Check back later for new content"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Lessons Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-[#060404]/70">
                <i className="fas fa-book text-[#68ba4a] mr-2"></i>
                Showing <span className="font-semibold text-[#68ba4a]">{filteredLessons.length}</span> {filteredLessons.length === 1 ? 'lesson' : 'lessons'}
              </p>
            </div>

            {/* Lessons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {filteredLessons.map((lesson, index) => {
                const isActive = lesson.is_active;
                const prevLesson = filteredLessons[index - 1];
                const unlocked = index === 0 || (userStats && userStats.completedLessons.includes(prevLesson?.id || "")) || isActive;

                return (
                  <article
                    key={lesson.id}
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                    className={`relative bg-white rounded-2xl shadow-md border-2 transition-all duration-300 ${unlocked
                      ? "border-[#b3ccb8]/40 hover:border-[#68ba4a]/50 hover:shadow-xl"
                      : "border-gray-200 opacity-75"
                      } p-5 flex flex-col space-y-3 group`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${unlocked
                          ? "bg-linear-to-br from-[#68ba4a] to-[#8baab1]"
                          : "bg-gray-300"
                          }`}>
                          <i className={`fas fa-book-reader text-white`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-[#8baab1]">
                              Lesson {lesson.order_index || index + 1}
                            </span>
                          </div>
                          <h2 className="font-bold text-base sm:text-lg text-[#060404] line-clamp-2">
                            {lesson.title}
                          </h2>
                        </div>
                      </div>
                      {isActive && (
                        <span className="shrink-0 text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-300 font-semibold">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Content Preview */}
                    <p className="text-xs sm:text-sm text-[#060404]/70 line-clamp-3 flex-1">
                      {lesson.content.substring(0, 150)}...
                    </p>

                    {/* Action Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => unlocked && handleStartLesson(lesson.id)}
                        disabled={!unlocked}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${unlocked
                          ? "bg-linear-to-r from-[#68ba4a] to-[#7cc55f] text-white hover:from-[#5ca03e] hover:to-[#68ba4a] shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        {unlocked ? (
                          <>
                            <i className="fas fa-play-circle"></i>
                            <span>Start Lesson</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-lock"></i>
                            <span>Complete Previous Lesson</span>
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
};

export default LessonsPage;
