// // src/pages/AdminPage.tsx
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// interface QuizQuestion {
//   id: string;
//   text: string;
//   options: string[];
//   correct: number;
//   explanation: string;
// }

// interface GameTemplate {
//   id: string;
//   title: string;
//   description: string;
//   type: string;
//   difficulty: "Easy" | "Medium" | "Hard";
//   maxScore: number;
// }

// const AdminPage = (props: AdminPageProps) => {
//   const navigate = useNavigate();
// }

// const AdminPage = () => {
//   const navigate = useNavigate();
//     Record<string, { title: string; questions: QuizQuestion[] }>
//   >({
//     "logic-basics": {
//       title: "Logic Basics Quiz",
//       questions: [
//         {
//           id: "q1",
//           text: "Which of the following is a tautology?",
//           options: ["p ∧ ¬p", "p ∨ ¬p", "p ∧ q", "p → ¬p"],
//           correct: 1,
//           explanation:
//             "p ∨ ¬p is always true (the law of excluded middle). This is a tautology.",
//         },
//       ],
//     },
//   });

//   const [games, setGames] = useState<Record<string, GameTemplate>>({
//     "truth-table": {
//       id: "truth-table",
//       title: "Truth Table Challenge",
//       description: "Complete truth tables by filling in the missing values",
//       type: "Logic",
//       difficulty: "Easy",
//       maxScore: 100,
//     },
//   });

//   // Load persisted quizzes/games from localStorage
//   useEffect(() => {
//     try {
//       const q = localStorage.getItem("jek_quizzes");
//       const g = localStorage.getItem("jek_games");
//       if (q) setQuizzes(JSON.parse(q));
//       if (g) setGames(JSON.parse(g));
//     } catch (e) {
//       // ignore
//       console.log(e);
//     }
//   }, []);

//   // Persist on change
//   useEffect(() => {
//     try {
//       localStorage.setItem("jek_quizzes", JSON.stringify(quizzes));
//     } catch (e) {
//       console.log(e);
//     }
//   }, [quizzes]);

//   useEffect(() => {
//     try {
//       localStorage.setItem("jek_games", JSON.stringify(games));
//     } catch (e) {
//       console.log(e);
//     }
//   }, [games]);

//   const [newQuestion, setNewQuestion] = useState<{
//     quizId: string;
//     text: string;
//     options: [string, string, string, string];
//     correct: number;
//     explanation: string;
//   }>({
//     quizId: "logic-basics",
//     text: "",
//     options: ["", "", "", ""],
//     correct: 0,
//     explanation: "",
//   });

//   const handleAdminLogin = () => {
//     if (adminPassword === "admin123") {
//       setIsAuthenticated(true);
//     } else {
//       alert("❌ Incorrect admin password");
//     }
//   };

//   const handleAddQuestion = () => {
//     if (!newQuestion.text || newQuestion.options.some((o) => !o)) {
//       alert("⚠️ Please fill in all fields");
//       return;
//     }

//     const quizId = newQuestion.quizId;
//     const updatedQuizzes = { ...quizzes };

//     if (!updatedQuizzes[quizId]) {
//       updatedQuizzes[quizId] = { title: quizId, questions: [] };
//     }

//     updatedQuizzes[quizId].questions.push({
//       id: `q${Date.now()}`,
//       text: newQuestion.text,
//       options: newQuestion.options,
//       correct: newQuestion.correct,
//       explanation: newQuestion.explanation,
//     });

//     setQuizzes(updatedQuizzes);
//     setNewQuestion({
//       quizId: "logic-basics",
//       text: "",
//       options: ["", "", "", ""],
//       correct: 0,
//       explanation: "",
//     });

//     alert("✅ Question added successfully!");
//   };

//   const handleAddGame = (title: string) => {
//     const gameId = title.toLowerCase().replace(/\s+/g, "-");
//     const updatedGames = {
//       ...games,
//       [gameId]: {
//         id: gameId,
//         title,
//         description: `Custom game: ${title}`,
//         type: "Logic",
//         difficulty: "Medium" as const,
//         maxScore: 100,
//       },
//     };
//     setGames(updatedGames);
//     alert(`✅ Game "${title}" added successfully!`);
//   };

//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen bg-[#fbf9f9] text-[#060404] flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-lg border border-[#b3ccb8]/40 p-8 max-w-md w-full">
//           <h1 className="text-3xl font-bold mb-2 text-center">🔐 Admin Panel</h1>
//           <p className="text-[#060404]/70 text-center mb-6">
//             Enter admin password to manage quizzes and games
//           </p>

//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-semibold mb-2">
//                 Admin Password
//               </label>
//               <input
//                 type="password"
//                 value={adminPassword}
//                 onChange={(e) => setAdminPassword(e.target.value)}
//                 onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
//                 placeholder="Enter password"
//                 className="w-full px-4 py-2 rounded-lg border border-[#b3ccb8] focus:outline-none focus:ring-2 focus:ring-[#68ba4a]"
//               />
//             </div>

//             <button
//               onClick={handleAdminLogin}
//               className="w-full px-6 py-3 rounded-xl bg-[#68ba4a] text-white font-semibold hover:bg-[#5a9a3d] transition"
//             >
//               🔓 Login
//             </button>

//             <button
//               onClick={() => navigate("/dashboard")}
//               className="w-full px-6 py-3 rounded-xl bg-[#b3ccb8] text-[#060404] font-semibold hover:bg-[#a3bcb8] transition"
//             >
//               ← Back to Dashboard
//             </button>
//           </div>

//           <p className="text-xs text-[#060404]/50 text-center mt-6">
//             Default password: admin123
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#fbf9f9] text-[#060404]">
//       {/* Header */}
//       <header className="bg-white border-b border-[#b3ccb8]/40 p-4 md:p-6">
//         <div className="max-w-6xl mx-auto flex items-center justify-between">
//           <div>
//             <button
//               onClick={() => navigate("/dashboard")}
//               className="text-[#68ba4a] hover:text-[#5a9a3d] font-semibold text-sm mb-3 flex items-center gap-1"
//             >
//               ← Back to Dashboard
//             </button>
//             <h1 className="text-3xl font-bold">🔧 Admin Panel</h1>
//             <p className="text-sm text-[#060404]/70 mt-1">Manage quizzes and games</p>
//           </div>
//           <button
//             onClick={() => {
//               setIsAuthenticated(false);
//               setAdminPassword("");
//               navigate("/dashboard");
//             }}
//             className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
//           >
//             Logout
//           </button>
//         </div>
//       </header>

//       {/* Tabs */}
//       <div className="bg-white border-b border-[#b3ccb8]/40 p-4">
//         <div className="max-w-6xl mx-auto flex gap-4">
//           <button
//             onClick={() => setActiveTab("quiz")}
//             className={`px-6 py-2 rounded-full font-semibold transition ${
//               activeTab === "quiz"
//                 ? "bg-[#68ba4a] text-white"
//                 : "bg-[#f4f7f4] text-[#060404] hover:bg-[#e8f1e8]"
//             }`}
//           >
//             📝 Quiz Manager
//           </button>
//           <button
//             onClick={() => setActiveTab("game")}
//             className={`px-6 py-2 rounded-full font-semibold transition ${
//               activeTab === "game"
//                 ? "bg-[#68ba4a] text-white"
//                 : "bg-[#f4f7f4] text-[#060404] hover:bg-[#e8f1e8]"
//             }`}
//           >
//             🎮 Game Manager
//           </button>
//         </div>
//       </div>

//       {/* Content */}
//       <main className="max-w-6xl mx-auto p-4 md:p-8">
//         {activeTab === "quiz" && (
//           <div className="space-y-6">
//             {/* Existing Quizzes */}
//             <section className="bg-white rounded-2xl shadow-md border border-[#b3ccb8]/40 p-6">
//               <h2 className="text-2xl font-bold mb-4">📚 Existing Quizzes</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {Object.entries(quizzes).map(([id, quiz]) => (
//                   <div
//                     key={id}
//                     className="border border-[#b3ccb8]/40 rounded-lg p-4 hover:bg-[#f4f7f4] transition"
//                   >
//                     <h3 className="font-semibold text-lg mb-2">{quiz.title}</h3>
//                     <p className="text-sm text-[#060404]/70">
//                       {quiz.questions.length} questions
//                     </p>
//                     <button className="mt-3 px-3 py-1 text-sm rounded-lg bg-[#8baab1] text-white hover:bg-[#7a9aa1] transition">
//                       📝 Edit
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </section>

//             {/* Add Question Form */}
//             <section className="bg-white rounded-2xl shadow-md border border-[#b3ccb8]/40 p-6">
//               <h2 className="text-2xl font-bold mb-6">➕ Add Question to Quiz</h2>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-semibold mb-2">
//                     Select Quiz
//                   </label>
//                   <select
//                     value={newQuestion.quizId}
//                     onChange={(e) =>
//                       setNewQuestion({ ...newQuestion, quizId: e.target.value })
//                     }
//                     className="w-full px-4 py-2 rounded-lg border border-[#b3ccb8] focus:outline-none focus:ring-2 focus:ring-[#68ba4a]"
//                   >
//                     {Object.entries(quizzes).map(([id, quiz]) => (
//                       <option key={id} value={id}>
//                         {quiz.title}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold mb-2">
//                     Question Text
//                   </label>
//                   <textarea
//                     value={newQuestion.text}
//                     onChange={(e) =>
//                       setNewQuestion({ ...newQuestion, text: e.target.value })
//                     }
//                     placeholder="e.g., Which of the following is a tautology?"
//                     className="w-full px-4 py-2 rounded-lg border border-[#b3ccb8] focus:outline-none focus:ring-2 focus:ring-[#68ba4a]"
//                     rows={3}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold mb-2">
//                     Answer Options (A, B, C, D)
//                   </label>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     {[0, 1, 2, 3].map((index) => (
//                       <input
//                         key={index}
//                         type="text"
//                         value={newQuestion.options[index]}
//                         onChange={(e) => {
//                           const newOptions = [...newQuestion.options];
//                           newOptions[index] = e.target.value as never;
//                           setNewQuestion({
//                             ...newQuestion,
//                             options: newOptions as [string, string, string, string],
//                           });
//                         }}
//                         placeholder={`Option ${String.fromCharCode(65 + index)}`}
//                         className="px-4 py-2 rounded-lg border border-[#b3ccb8] focus:outline-none focus:ring-2 focus:ring-[#68ba4a]"
//                       />
//                     ))}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold mb-2">
//                     Correct Answer
//                   </label>
//                   <select
//                     value={newQuestion.correct}
//                     onChange={(e) =>
//                       setNewQuestion({
//                         ...newQuestion,
//                         correct: parseInt(e.target.value),
//                       })
//                     }
//                     className="w-full px-4 py-2 rounded-lg border border-[#b3ccb8] focus:outline-none focus:ring-2 focus:ring-[#68ba4a]"
//                   >
//                     {[0, 1, 2, 3].map((index) => (
//                       <option key={index} value={index}>
//                         Option {String.fromCharCode(65 + index)}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold mb-2">
//                     Explanation
//                   </label>
//                   <textarea
//                     value={newQuestion.explanation}
//                     onChange={(e) =>
//                       setNewQuestion({
//                         ...newQuestion,
//                         explanation: e.target.value,
//                       })
//                     }
//                     placeholder="Explain why this is the correct answer..."
//                     className="w-full px-4 py-2 rounded-lg border border-[#b3ccb8] focus:outline-none focus:ring-2 focus:ring-[#68ba4a]"
//                     rows={3}
//                   />
//                 </div>

//                 <button
//                   onClick={handleAddQuestion}
//                   className="w-full px-6 py-3 rounded-xl bg-[#68ba4a] text-white font-semibold hover:bg-[#5a9a3d] transition"
//                 >
//                   ✅ Add Question
//                 </button>
//               </div>
//             </section>
//           </div>
//         )}

//         {activeTab === "game" && (
//           <div className="space-y-6">
//             {/* Existing Games */}
//             <section className="bg-white rounded-2xl shadow-md border border-[#b3ccb8]/40 p-6">
//               <h2 className="text-2xl font-bold mb-4">🎮 Existing Games</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {Object.entries(games).map(([id, game]) => (
//                   <div
//                     key={id}
//                     className="border border-[#b3ccb8]/40 rounded-lg p-4 hover:bg-[#f4f7f4] transition"
//                   >
//                     <h3 className="font-semibold text-lg mb-2">{game.title}</h3>
//                     <p className="text-sm text-[#060404]/70 mb-2">
//                       {game.description}
//                     </p>
//                     <div className="flex gap-2 text-xs">
//                       <span className="bg-[#b3ccb8]/20 px-2 py-1 rounded">
//                         {game.type}
//                       </span>
//                       <span className="bg-[#68ba4a]/20 px-2 py-1 rounded">
//                         {game.difficulty}
//                       </span>
//                       <span className="bg-[#8baab1]/20 px-2 py-1 rounded">
//                         Max {game.maxScore} pts
//                       </span>
//                     </div>
//                     <button className="mt-3 px-3 py-1 text-sm rounded-lg bg-[#8baab1] text-white hover:bg-[#7a9aa1] transition">
//                       🎮 Edit
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </section>

//             {/* Create Game */}
//             <section className="bg-white rounded-2xl shadow-md border border-[#b3ccb8]/40 p-6">
//               <h2 className="text-2xl font-bold mb-6">➕ Create New Game</h2>
//               <p className="text-[#060404]/70 mb-4">
//                 Enter the game name and parameters:
//               </p>
//               <div className="flex gap-3">
//                 <input
//                   type="text"
//                   placeholder="e.g., Logic Puzzle, Proof Builder..."
//                   className="flex-1 px-4 py-2 rounded-lg border border-[#b3ccb8] focus:outline-none focus:ring-2 focus:ring-[#68ba4a]"
//                   id="gameNameInput"
//                 />
//                 <button
//                   onClick={() => {
//                     const input = document.getElementById(
//                       "gameNameInput"
//                     ) as HTMLInputElement;
//                     if (input.value.trim()) {
//                       handleAddGame(input.value.trim());
//                       input.value = "";
//                     }
//                   }}
//                   className="px-6 py-2 rounded-lg bg-[#68ba4a] text-white font-semibold hover:bg-[#5a9a3d] transition"
//                 >
//                   ➕ Create
//                 </button>
//               </div>
//             </section>

//             <div className="bg-[#f4f7f4] rounded-2xl p-6 border border-[#b3ccb8]/40">
//               <p className="text-sm text-[#060404]/70">
//                 💡 <strong>Tip:</strong> Games are customizable templates. After creating a
//                 game, click "Edit" to configure specific rules, questions, and scoring
//                 parameters.
//               </p>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default AdminPage;
