// src/pages/GameInterface.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";

interface UserStats {
  level: number;
  xp: number;
  completedLessons: string[];
}

interface GameInterfaceProps {
  studentName: string;
  userStats?: UserStats;
  onUpdateStats?: (stats: UserStats) => void;
}

interface TruthTableRow {
  p: boolean;
  q: boolean;
  result: boolean | null;
  userAnswer: boolean | null;
}

interface MatchingPair {
  id: string;
  statement: string;
  equivalent: string;
  matched: boolean;
}

interface ProofStep {
  id: string;
  statement: string;
  rule: string;
  isCorrect: boolean;
}

const GameInterface = ({ studentName, userStats, onUpdateStats }: GameInterfaceProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Common states
  const [gameState, setGameState] = useState<"playing" | "completed">("playing");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());

  // Truth Table states
  const [truthTableRows, setTruthTableRows] = useState<TruthTableRow[]>([]);
  const [currentOperator, setCurrentOperator] = useState<'AND' | 'OR' | 'IMPLIES'>('AND');

  // Matching Game states
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);

  // Proof Builder states
  const [premises, setPremises] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [proofSteps, setProofSteps] = useState<ProofStep[]>([]);
  const [selectedPremise, setSelectedPremise] = useState("");
  const [selectedRule, setSelectedRule] = useState("");

  // Timer effect
  useEffect(() => {
    if (gameState === "playing") {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, startTime]);

  // Auto-end game when time runs out
  useEffect(() => {
    if (timeLeft === 0 && gameState === "playing") {
      handleEndGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, gameState]);

  // Initialize game based on type
  useEffect(() => {
    initializeGame();
  }, [id]);

  const initializeGame = () => {
    if (id === 'truth-table') {
      initTruthTable();
    } else if (id === 'logic-matching') {
      initMatchingGame();
    } else if (id === 'proof-builder') {
      initProofBuilder();
    }
  };

  // Truth Table Game
  const initTruthTable = () => {
    const rows: TruthTableRow[] = [
      { p: true, q: true, result: null, userAnswer: null },
      { p: true, q: false, result: null, userAnswer: null },
      { p: false, q: true, result: null, userAnswer: null },
      { p: false, q: false, result: null, userAnswer: null },
    ];
    setTruthTableRows(rows);
    calculateCorrectAnswers(rows, currentOperator);
  };

  const calculateCorrectAnswers = (rows: TruthTableRow[], operator: 'AND' | 'OR' | 'IMPLIES') => {
    const updated = rows.map(row => ({
      ...row,
      result: operator === 'AND' ? row.p && row.q :
        operator === 'OR' ? row.p || row.q :
          !row.p || row.q // IMPLIES
    }));
    setTruthTableRows(updated);
  };

  const handleTruthTableAnswer = (rowIndex: number, answer: boolean) => {
    const updated = [...truthTableRows];
    updated[rowIndex].userAnswer = answer;
    setTruthTableRows(updated);

    // Check if all answered
    if (updated.every(row => row.userAnswer !== null)) {
      checkTruthTableAnswers(updated);
    }
  };

  const checkTruthTableAnswers = (rows: TruthTableRow[]) => {
    let correct = 0;
    rows.forEach(row => {
      if (row.userAnswer === row.result) correct++;
    });

    const baseScore = (correct / rows.length) * 100;
    const timeBonus = Math.max(0, (180 - elapsedTime) / 2);
    const finalScore = Math.round(baseScore + timeBonus);

    setScore(finalScore);
    handleEndGame(finalScore);
  };

  // Matching Game
  const initMatchingGame = () => {
    const pairs: MatchingPair[] = [
      { id: '1', statement: 'p ∧ q', equivalent: 'q ∧ p', matched: false },
      { id: '2', statement: 'p ∨ q', equivalent: 'q ∨ p', matched: false },
      { id: '3', statement: '¬(p ∧ q)', equivalent: '¬p ∨ ¬q', matched: false },
      { id: '4', statement: '¬(p ∨ q)', equivalent: '¬p ∧ ¬q', matched: false },
      { id: '5', statement: 'p → q', equivalent: '¬p ∨ q', matched: false },
      { id: '6', statement: 'p ↔ q', equivalent: '(p → q) ∧ (q → p)', matched: false },
    ];
    setMatchingPairs(pairs);
    setMatchedCount(0);
  };

  const handleMatchSelect = (side: 'left' | 'right', id: string) => {
    if (side === 'left') {
      setSelectedLeft(id);
    } else {
      setSelectedRight(id);
    }
  };

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      checkMatch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeft, selectedRight]);

  const checkMatch = () => {
    if (selectedLeft === selectedRight) {
      const updated = matchingPairs.map(pair =>
        pair.id === selectedLeft ? { ...pair, matched: true } : pair
      );
      setMatchingPairs(updated);
      setMatchedCount(prev => prev + 1);

      if (matchedCount + 1 === matchingPairs.length) {
        const timeBonus = Math.max(0, (180 - elapsedTime) * 2);
        const finalScore = Math.round(100 + timeBonus);
        setScore(finalScore);
        handleEndGame(finalScore);
      }
    }

    setTimeout(() => {
      setSelectedLeft(null);
      setSelectedRight(null);
    }, 500);
  };

  // Proof Builder
  const initProofBuilder = () => {
    setPremises(['p → q', 'q → r', 'p']);
    setGoal('r');
    setProofSteps([]);
  };

  const addProofStep = () => {
    if (!selectedPremise || !selectedRule) return;

    const newStep: ProofStep = {
      id: Date.now().toString(),
      statement: selectedPremise,
      rule: selectedRule,
      isCorrect: true // Simplified - in real game would validate
    };

    const updated = [...proofSteps, newStep];
    setProofSteps(updated);
    setSelectedPremise("");
    setSelectedRule("");

    // Check if proof is complete
    if (selectedPremise === goal) {
      const timeBonus = Math.max(0, (180 - elapsedTime) * 3);
      const finalScore = Math.round(150 + timeBonus);
      setScore(finalScore);
      handleEndGame(finalScore);
    }
  };

  const handleEndGame = useCallback((finalScore?: number) => {
    const gameScore = finalScore || score;
    setGameState("completed");

    // Save to localStorage
    const stored = localStorage.getItem("logic_game_scores");
    const scores = stored ? JSON.parse(stored) : [];

    const existingIndex = scores.findIndex((s: any) => s.gameId === id);
    if (existingIndex >= 0) {
      scores[existingIndex] = {
        ...scores[existingIndex],
        highScore: Math.max(scores[existingIndex].highScore, gameScore),
        lastPlayed: new Date().toISOString(),
        timesPlayed: scores[existingIndex].timesPlayed + 1,
      };
    } else {
      scores.push({
        gameId: id,
        highScore: gameScore,
        lastPlayed: new Date().toISOString(),
        timesPlayed: 1,
      });
    }

    localStorage.setItem("logic_game_scores", JSON.stringify(scores));

    // Save XP to localStorage
    const xpEarned = Math.floor(gameScore / 2);
    const currentXP = parseInt(localStorage.getItem("user_xp") || "0");
    localStorage.setItem("user_xp", (currentXP + xpEarned).toString());
    localStorage.setItem("user_level", Math.floor((currentXP + xpEarned) / 100).toString());

    // Update XP in state
    if (onUpdateStats && userStats) {
      const updated: UserStats = {
        ...userStats,
        xp: userStats.xp + xpEarned,
        level: Math.floor((userStats.xp + xpEarned) / 100),
        completedLessons: userStats.completedLessons,
      };
      onUpdateStats(updated);
    }
  }, [score, id, onUpdateStats, userStats]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayAgain = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(180);
    setElapsedTime(0);
    initializeGame();
  };

  if (gameState === "completed") {
    const xpEarned = Math.floor(score / 2);

    return (
      <div className="min-h-screen bg-[#fbf9f9] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#b3ccb8]/40 p-8 max-w-md w-full" data-aos="zoom-in">
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#68ba4a] to-[#7cc55f] flex items-center justify-center shadow-lg">
              <i className="fas fa-trophy text-white text-4xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-[#060404] mb-2">Game Complete!</h1>
            <p className="text-sm text-[#060404]/70">Great job, {studentName}!</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gradient-to-br from-[#f8faf9] to-[#f0f7f1] rounded-xl p-6 text-center">
              <p className="text-sm text-[#060404]/70 mb-2">Final Score</p>
              <p className="text-5xl font-bold text-[#68ba4a] mb-2">{score}</p>
              <p className="text-xs text-[#060404]/60">Time: {formatTime(elapsedTime)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-[#e8f5e9] to-[#f0f7f1] rounded-lg p-4 text-center">
                <i className="fas fa-star text-2xl text-[#68ba4a] mb-2"></i>
                <p className="text-xs text-[#060404]/70 mb-1">XP Earned</p>
                <p className="text-xl font-bold text-[#8baab1]">+{xpEarned}</p>
              </div>
              <div className="bg-gradient-to-br from-[#e8f5e9] to-[#f0f7f1] rounded-lg p-4 text-center">
                <i className="fas fa-clock text-2xl text-[#8baab1] mb-2"></i>
                <p className="text-xs text-[#060404]/70 mb-1">Time</p>
                <p className="text-xl font-bold text-[#060404]">{formatTime(elapsedTime)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handlePlayAgain}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#68ba4a] to-[#7cc55f] text-white font-semibold hover:from-[#5ca03e] hover:to-[#68ba4a] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <i className="fas fa-redo"></i>
              <span>Play Again</span>
            </button>
            <button
              onClick={() => navigate("/games")}
              className="w-full px-6 py-3 rounded-xl bg-white border-2 border-[#b3ccb8] text-[#060404] font-semibold hover:bg-[#f8faf9] transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Back to Games</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f9] text-[#060404]">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#b3ccb8]/40 p-4 md:p-6 sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/games")}
              className="text-[#68ba4a] hover:text-[#5a9a3d] font-semibold text-sm flex items-center gap-1"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Back to Games</span>
            </button>
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${timeLeft < 30 ? 'bg-red-50 border-red-500' : 'bg-gradient-to-r from-[#e8f5e9] to-[#f0f7f1] border-[#b3ccb8]'
                }`}>
                <i className={`fas fa-clock ${timeLeft < 30 ? 'text-red-500' : 'text-[#68ba4a]'}`}></i>
                <span className={`font-mono font-bold text-lg ${timeLeft < 30 ? 'text-red-600' : 'text-[#060404]'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              {/* Score */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f8faf9] to-[#f0f7f1] border-2 border-[#b3ccb8]">
                <i className="fas fa-star text-[#68ba4a]"></i>
                <span className="font-bold text-lg text-[#060404]">{score}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {id === 'truth-table' && 'Truth Table Challenge'}
                {id === 'logic-matching' && 'Logic Matching'}
                {id === 'proof-builder' && 'Proof Builder'}
              </h1>
              <p className="text-sm text-[#060404]/70 mt-1">Player: {studentName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Truth Table Game */}
        {id === 'truth-table' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#b3ccb8]/40 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Complete the Truth Table</h2>
                <div className="flex gap-2">
                  {(['AND', 'OR', 'IMPLIES'] as const).map(op => (
                    <button
                      key={op}
                      onClick={() => {
                        setCurrentOperator(op);
                        initTruthTable();
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${currentOperator === op
                        ? 'bg-[#68ba4a] text-white'
                        : 'bg-[#f4f7f4] text-[#060404] hover:bg-[#e8f5e9]'
                        }`}
                    >
                      {op === 'AND' && 'p ∧ q'}
                      {op === 'OR' && 'p ∨ q'}
                      {op === 'IMPLIES' && 'p → q'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#b3ccb8]">
                      <th className="px-4 py-3 text-left font-bold">p</th>
                      <th className="px-4 py-3 text-left font-bold">q</th>
                      <th className="px-4 py-3 text-left font-bold">
                        {currentOperator === 'AND' && 'p ∧ q'}
                        {currentOperator === 'OR' && 'p ∨ q'}
                        {currentOperator === 'IMPLIES' && 'p → q'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {truthTableRows.map((row, index) => (
                      <tr key={index} className="border-b border-[#b3ccb8]/30 hover:bg-[#f8faf9] transition-colors">
                        <td className="px-4 py-3 font-mono font-bold">{row.p ? 'T' : 'F'}</td>
                        <td className="px-4 py-3 font-mono font-bold">{row.q ? 'T' : 'F'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleTruthTableAnswer(index, true)}
                              className={`px-6 py-2 rounded-lg font-bold transition-all ${row.userAnswer === true
                                ? 'bg-[#68ba4a] text-white shadow-md'
                                : 'bg-[#f4f7f4] text-[#060404] hover:bg-[#e8f5e9]'
                                }`}
                            >
                              T
                            </button>
                            <button
                              onClick={() => handleTruthTableAnswer(index, false)}
                              className={`px-6 py-2 rounded-lg font-bold transition-all ${row.userAnswer === false
                                ? 'bg-[#68ba4a] text-white shadow-md'
                                : 'bg-[#f4f7f4] text-[#060404] hover:bg-[#e8f5e9]'
                                }`}
                            >
                              F
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Matching Game */}
        {id === 'logic-matching' && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#b3ccb8]/40 p-6">
            <h2 className="text-xl font-bold mb-4">Match Equivalent Statements</h2>
            <p className="text-sm text-[#060404]/70 mb-6">Click pairs that are logically equivalent</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="font-semibold text-sm text-[#060404]/70 mb-2">Statements</p>
                {matchingPairs.map(pair => (
                  <button
                    key={`left-${pair.id}`}
                    onClick={() => !pair.matched && handleMatchSelect('left', pair.id)}
                    disabled={pair.matched}
                    className={`w-full p-4 rounded-xl text-left font-mono transition-all ${pair.matched
                      ? 'bg-green-100 border-2 border-green-500 text-green-700 cursor-default'
                      : selectedLeft === pair.id
                        ? 'bg-[#68ba4a] border-2 border-[#68ba4a] text-white shadow-lg'
                        : 'bg-[#f4f7f4] border-2 border-[#b3ccb8] hover:border-[#68ba4a] hover:bg-[#e8f5e9]'
                      }`}
                  >
                    {pair.statement}
                    {pair.matched && <i className="fas fa-check ml-2"></i>}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <p className="font-semibold text-sm text-[#060404]/70 mb-2">Equivalents</p>
                {matchingPairs.map(pair => (
                  <button
                    key={`right-${pair.id}`}
                    onClick={() => !pair.matched && handleMatchSelect('right', pair.id)}
                    disabled={pair.matched}
                    className={`w-full p-4 rounded-xl text-left font-mono transition-all ${pair.matched
                      ? 'bg-green-100 border-2 border-green-500 text-green-700 cursor-default'
                      : selectedRight === pair.id
                        ? 'bg-[#68ba4a] border-2 border-[#68ba4a] text-white shadow-lg'
                        : 'bg-[#f4f7f4] border-2 border-[#b3ccb8] hover:border-[#68ba4a] hover:bg-[#e8f5e9]'
                      }`}
                  >
                    {pair.equivalent}
                    {pair.matched && <i className="fas fa-check ml-2"></i>}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm font-semibold">
                Matched: <span className="text-[#68ba4a]">{matchedCount}</span> / {matchingPairs.length}
              </p>
            </div>
          </div>
        )}

        {/* Proof Builder Game */}
        {id === 'proof-builder' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#b3ccb8]/40 p-6">
              <h2 className="text-xl font-bold mb-4">Build a Logical Proof</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-[#f8faf9] to-[#f0f7f1] rounded-xl p-4">
                  <p className="font-semibold text-sm mb-3">Premises:</p>
                  <div className="space-y-2">
                    {premises.map((premise, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg font-mono text-sm border border-[#b3ccb8]">
                        {i + 1}. {premise}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#e8f5e9] to-[#f0f7f1] rounded-xl p-4">
                  <p className="font-semibold text-sm mb-3">Goal:</p>
                  <div className="bg-white p-3 rounded-lg font-mono text-lg font-bold border-2 border-[#68ba4a]">
                    ∴ {goal}
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-[#b3ccb8]/40 pt-6">
                <p className="font-semibold mb-3">Your Proof:</p>
                <div className="space-y-2 mb-4">
                  {proofSteps.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-300">
                      <span className="font-bold text-green-700">{i + 1}.</span>
                      <span className="flex-1 font-mono">{step.statement}</span>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">{step.rule}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={selectedPremise}
                    onChange={(e) => setSelectedPremise(e.target.value)}
                    className="px-4 py-3 rounded-xl border-2 border-[#b3ccb8] focus:border-[#68ba4a] focus:outline-none"
                  >
                    <option value="">Select premise...</option>
                    {premises.map((p, i) => (
                      <option key={i} value={p}>{p}</option>
                    ))}
                    <option value="q">q (derived)</option>
                    <option value="r">r (derived)</option>
                  </select>

                  <select
                    value={selectedRule}
                    onChange={(e) => setSelectedRule(e.target.value)}
                    className="px-4 py-3 rounded-xl border-2 border-[#b3ccb8] focus:border-[#68ba4a] focus:outline-none"
                  >
                    <option value="">Select rule...</option>
                    <option value="Modus Ponens">Modus Ponens</option>
                    <option value="Hypothetical Syllogism">Hypothetical Syllogism</option>
                    <option value="Simplification">Simplification</option>
                  </select>
                </div>

                <button
                  onClick={addProofStep}
                  disabled={!selectedPremise || !selectedRule}
                  className="mt-4 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#68ba4a] to-[#7cc55f] text-white font-semibold hover:from-[#5ca03e] hover:to-[#68ba4a] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Step
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GameInterface;
