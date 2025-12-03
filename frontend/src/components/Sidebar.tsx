import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage?: string;
}

const Sidebar = ({ isOpen, onClose, activePage = "dashboard" }: SidebarProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-linear-to-b from-[#b3ccb8] to-[#9ab8a8] text-[#060404] shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center shadow-md overflow-hidden">
              <img
                src="/JEKlogo.png"
                alt="LogicTutor Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-lg text-[#060404]">LogicTutor</p>
              <p className="text-xs text-[#060404]/70">Master Logic</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-[#060404] hover:bg-white/20 p-1 rounded-lg transition"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => {
              navigate("/dashboard");
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activePage === "dashboard"
              ? "bg-white/90 shadow-sm font-semibold hover:shadow-md"
              : "hover:bg-white/40"
              }`}
          >
            <i className={`fas fa-home w-5 ${activePage === "dashboard" ? "text-[#68ba4a]" : "text-[#060404]"
              }`}></i>
            <span className="text-[#060404]">Dashboard</span>
          </button>

          <button
            onClick={() => {
              navigate("/lessons");
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activePage === "lessons"
              ? "bg-white/90 shadow-sm font-semibold hover:shadow-md"
              : "hover:bg-white/40"
              }`}
          >
            <i className={`fas fa-book-open w-5 ${activePage === "lessons" ? "text-[#68ba4a]" : "text-[#060404]"
              }`}></i>
            <span className="text-[#060404]">Lessons</span>
          </button>

          <button
            onClick={() => {
              navigate("/quizzes");
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activePage === "quizzes"
              ? "bg-white/90 shadow-sm font-semibold hover:shadow-md"
              : "hover:bg-white/40"
              }`}
          >
            <i className={`fas fa-question-circle w-5 ${activePage === "quizzes" ? "text-[#68ba4a]" : "text-[#060404]"
              }`}></i>
            <span className="text-[#060404]">Quizzes</span>
          </button>

          <button
            onClick={() => {
              navigate("/games");
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activePage === "games"
              ? "bg-white/90 shadow-sm font-semibold hover:shadow-md"
              : "hover:bg-white/40"
              }`}
          >
            <i className={`fas fa-gamepad w-5 ${activePage === "games" ? "text-[#68ba4a]" : "text-[#060404]"
              }`}></i>
            <span className="text-[#060404]">Games</span>
          </button>

          <Link
            to="/settings"
            onClick={() => onClose()}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activePage === "settings"
              ? "bg-white/90 shadow-sm font-semibold hover:shadow-md"
              : "hover:bg-white/40"
              }`}
          >
            <i className={`fas fa-cog w-5 ${activePage === "settings" ? "text-[#68ba4a]" : "text-[#060404]"
              }`}></i>
            <span className="font-medium">Settings</span>
          </Link>

          <Link
            to="/scores"
            onClick={() => onClose()}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activePage === "scores"
              ? "bg-white/90 shadow-sm font-semibold hover:shadow-md"
              : "hover:bg-white/40"
              }`}
          >
            <i className={`fas fa-chart-bar w-5 ${activePage === "scores" ? "text-[#68ba4a]" : "text-[#060404]"
              }`}></i>
            <span className="font-medium">My Scores</span>
          </Link>
        </nav>

        <div className="p-4 mx-3 mb-3 bg-linear-to-br from-white/80 to-white/60 backdrop-blur rounded-xl border border-white/40 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-bullseye text-[#68ba4a]"></i>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#060404]/80">
              Today's Goal
            </p>
          </div>
          <p className="text-sm font-semibold text-[#060404] flex items-center gap-2">
            <i className="fas fa-check-circle text-[#68ba4a] text-xs"></i>
            Complete 1 lesson & quiz
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
