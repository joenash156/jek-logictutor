import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

interface UserStats {
  level: number;
  xp: number;
  completedLessons: string[];
}

interface GamesPageProps {
  studentName: string;
  userStats?: UserStats;
  onUpdateStats?: (stats: UserStats) => void;
}

interface GameScore {
  gameId: string;
  highScore: number;
  lastPlayed: string;
  timesPlayed: number;
}

const games = [
  {
    id: "truth-table",
    title: "Truth Table Challenge",
    description: "Build and complete truth tables as fast as you can",
    icon: "fa-table",
    color: "from-blue-500 to-blue-600",
    difficulty: "Beginner",
    xp: 100,
  },
  {
    id: "logic-matching",
    title: "Logic Matching",
    description: "Match equivalent logical statements and expressions",
    icon: "fa-puzzle-piece",
    color: "from-purple-500 to-purple-600",
    difficulty: "Intermediate",
    xp: 120,
  },
  {
    id: "proof-builder",
    title: "Proof Builder",
    description: "Construct valid logical proofs step by step",
    icon: "fa-layer-group",
    color: "from-green-500 to-green-600",
    difficulty: "Advanced",
    xp: 150,
  },
];

export default function GamesPage({ userStats }: GamesPageProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gameScores, setGameScores] = useState<GameScore[]>([]);

  useEffect(() => {
    document.title = "JEK Logic Tutor | Games";
    // Load game scores from localStorage
    const stored = localStorage.getItem("logic_game_scores");
    if (stored) {
      setGameScores(JSON.parse(stored));
    }
  }, []);

  const getGameScore = (gameId: string) => {
    return gameScores.find(score => score.gameId === gameId);
  };

  const handlePlayGame = (gameId: string) => {
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] to-[#e8f5e9] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="games" />

      <main className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 lg:p-8 md:ml-64 bg-transparent">
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
              <button
                onClick={() => navigate("/dashboard")}
                className="text-xs sm:text-sm text-[#8baab1] hover:text-[#68ba4a] transition-colors flex items-center gap-1 mb-2"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#060404] flex items-center gap-3">
                <i className="fas fa-gamepad text-[#68ba4a]"></i>
                Logic Games
              </h1>
              <p className="text-xs sm:text-sm text-[#060404]/70 mt-2">
                Master propositional logic through interactive challenges
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

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {games.map((game, index) => {
            const gameScore = getGameScore(game.id);

            return (
              <article
                key={game.id}
                data-aos="zoom-in"
                data-aos-delay={index * 100}
                className="bg-white rounded-2xl shadow-lg border-2 border-[#b3ccb8]/40 hover:border-[#68ba4a]/50 hover:shadow-xl transition-all duration-300 p-6 flex flex-col space-y-4 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <i className={`fas ${game.icon} text-white text-2xl`}></i>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-[#e8f5e9] text-[#68ba4a] font-semibold">
                    {game.difficulty}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="flex-1">
                  <h2 className="font-bold text-lg text-[#060404] mb-2">
                    {game.title}
                  </h2>
                  <p className="text-sm text-[#060404]/70 leading-relaxed">
                    {game.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-[#f8faf9] to-[#f0f7f1] rounded-lg p-3">
                    <p className="text-xs text-[#060404]/60 mb-1">High Score</p>
                    <p className="text-xl font-bold text-[#68ba4a]">
                      {gameScore?.highScore || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-[#f8faf9] to-[#f0f7f1] rounded-lg p-3">
                    <p className="text-xs text-[#060404]/60 mb-1">XP Reward</p>
                    <p className="text-xl font-bold text-[#8baab1]">
                      {game.xp}
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                {gameScore && (
                  <div className="flex items-center gap-2 text-xs text-[#060404]/60">
                    <i className="fas fa-gamepad"></i>
                    <span>Played {gameScore.timesPlayed} {gameScore.timesPlayed === 1 ? 'time' : 'times'}</span>
                  </div>
                )}

                {/* Play Button */}
                <button
                  onClick={() => handlePlayGame(game.id)}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#68ba4a] to-[#7cc55f] text-white font-semibold hover:from-[#5ca03e] hover:to-[#68ba4a] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-play-circle"></i>
                  <span>{gameScore ? 'Play Again' : 'Start Game'}</span>
                </button>
              </article>
            );
          })}
        </div>

        {/* How to Play Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border-2 border-[#b3ccb8]/40 p-6" data-aos="fade-up">
          <h3 className="text-xl font-bold text-[#060404] mb-4 flex items-center gap-2">
            <i className="fas fa-info-circle text-[#68ba4a]"></i>
            How to Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {games.map((game) => (
              <div key={game.id} className="bg-gradient-to-br from-[#f8faf9] to-[#f0f7f1] rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${game.color} flex items-center justify-center`}>
                    <i className={`fas ${game.icon} text-white text-sm`}></i>
                  </div>
                  <h4 className="font-bold text-sm text-[#060404]">{game.title}</h4>
                </div>
                <p className="text-xs text-[#060404]/70 leading-relaxed">
                  {game.id === 'truth-table' && 'Complete truth tables by selecting the correct truth values for each row. Faster completion earns more points!'}
                  {game.id === 'logic-matching' && 'Match logically equivalent statements by clicking pairs. Find all matches before time runs out!'}
                  {game.id === 'proof-builder' && 'Construct valid logical proofs using inference rules. Chain premises to reach the conclusion!'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
