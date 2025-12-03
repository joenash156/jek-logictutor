import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect } from "react";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
      document.title = "JEK Logic Tutor | Homepage";
    }, []);

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-[#f8faf9] to-[#e8f5e9]">
      <Header />

      {/* Main Content */}
      <main className="flex-1"  data-aos="fade-up">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#68ba4a]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8baab1]/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"  data-aos="fade-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#060404] mb-6 leading-tight">
                  Master{" "}
                  <span className="bg-[#68ba4a] bg-clip-text text-transparent">
                    Logical Reasoning
                  </span>{" "}
                  with Ease
                </h1>
                <p className="text-lg sm:text-xl text-[#060404]/70 mb-8 leading-relaxed">
                  Build strong proof skills through interactive lessons, challenging quizzes,
                  and engaging games. Start your journey to becoming a logic master today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={() => navigate("/auth-page")}
                    className="px-8 py-4 rounded-xl bg-[#68ba4a] text-white font-bold text-lg hover:bg-[#5ca03e] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-rocket"></i>
                      Get Started Free
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-8 py-4 rounded-xl border-2 border-[#8baab1] text-[#060404] font-semibold text-lg hover:bg-white transition-all shadow-sm hover:shadow-md"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-info-circle"></i>
                      Learn More
                    </span>
                  </button>
                </div>

                {/* Stats */}
                <div className="mt-12 grid grid-cols-3 gap-6"  data-aos="fade-up">
                  <div className="text-center lg:text-left">
                    <div className="text-3xl sm:text-4xl font-bold text-[#68ba4a]">10+</div>
                    <div className="text-sm text-[#060404]/60 mt-1">Lessons</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl sm:text-4xl font-bold text-[#8baab1]">30+</div>
                    <div className="text-sm text-[#060404]/60 mt-1">Quizzes</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl sm:text-4xl font-bold text-[#68ba4a]">15+</div>
                    <div className="text-sm text-[#060404]/60 mt-1">Students</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Illustration */}
              <div className="relative"  data-aos="fade-up">
                <div className="relative bg-green-50/60 rounded-3xl p-8 border-2 border-[#e8f5e9]">
                  <div className="flex items-center justify-center">
                    <div className="w-64 sm:w-80 rounded-2xl bg-linear-to-br from-[#68ba4a]/20 to-[#8baab1]/20 flex items-center justify-center">
                      <img src="./JEKlogo.png" alt="JEK Logo" className="z-10 rounded-2xl"/>
                    </div>
                  </div>

                  {/* Floating Cards */}
                  {/* <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border-2 border-[#e8f5e9] animate-bounce">
                    <i className="fas fa-trophy text-[#68ba4a] text-2xl"></i>
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border-2 border-[#e8f5e9] animate-pulse">
                    <i className="fas fa-star text-[#8baab1] text-2xl"></i>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-24 bg-white"  data-aos="fade-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#060404] mb-4">
                Why Choose{" "}
                <span className="bg-[#68ba4a] bg-clip-text text-transparent">
                  JEK Logic Tutor
                </span>
                ?
              </h2>
              <p className="text-lg text-[#060404]/70 max-w-2xl mx-auto">
                Everything you need to master logical reasoning in one comprehensive platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-linear-to-br from-[#f8faf9] to-[#f0f7f1] rounded-2xl p-8 border-2 border-[#e8f5e9] hover:border-[#68ba4a]/30 transition-all hover:shadow-xl group"  data-aos="fade-up">
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#68ba4a] to-[#7cc55f] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <i className="fas fa-book-open text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-[#060404] mb-3">Interactive Lessons</h3>
                <p className="text-[#060404]/70 leading-relaxed">
                  Learn through engaging, step-by-step lessons designed to build your logical reasoning skills progressively.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-linear-to-br from-[#f8faf9] to-[#f0f7f1] rounded-2xl p-8 border-2 border-[#e8f5e9] hover:border-[#68ba4a]/30 transition-all hover:shadow-xl group"  data-aos="fade-up">
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#8baab1] to-[#9ab8a8] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <i className="fas fa-clipboard-check text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-[#060404] mb-3">Practice Quizzes</h3>
                <p className="text-[#060404]/70 leading-relaxed">
                  Test your knowledge with carefully crafted quizzes that reinforce your learning and track your progress.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-linear-to-br from-[#f8faf9] to-[#f0f7f1] rounded-2xl p-8 border-2 border-[#e8f5e9] hover:border-[#68ba4a]/30 transition-all hover:shadow-xl group"  data-aos="fade-up">
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#68ba4a] to-[#7cc55f] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <i className="fas fa-gamepad text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-[#060404] mb-3">Logic Games</h3>
                <p className="text-[#060404]/70 leading-relaxed">
                  Make learning fun with interactive games that challenge your mind and enhance your problem-solving skills.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-linear-to-br from-[#f8faf9] to-[#f0f7f1] rounded-2xl p-8 border-2 border-[#e8f5e9] hover:border-[#68ba4a]/30 transition-all hover:shadow-xl group"  data-aos="fade-up">
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#8baab1] to-[#9ab8a8] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <i className="fas fa-chart-line text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-[#060404] mb-3">Track Progress</h3>
                <p className="text-[#060404]/70 leading-relaxed">
                  Monitor your improvement with detailed analytics and earn XP as you level up your logical reasoning skills.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-linear-to-br from-[#f8faf9] to-[#f0f7f1] rounded-2xl p-8 border-2 border-[#e8f5e9] hover:border-[#68ba4a]/30 transition-all hover:shadow-xl group"  data-aos="fade-up">
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#68ba4a] to-[#7cc55f] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <i className="fas fa-trophy text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-[#060404] mb-3">Earn Rewards</h3>
                <p className="text-[#060404]/70 leading-relaxed">
                  Stay motivated with achievements, badges, and a leveling system that celebrates your accomplishments.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-linear-to-br from-[#f8faf9] to-[#f0f7f1] rounded-2xl p-8 border-2 border-[#e8f5e9] hover:border-[#68ba4a]/30 transition-all hover:shadow-xl group"  data-aos="fade-up">
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#8baab1] to-[#9ab8a8] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <i className="fas fa-mobile-alt text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-[#060404] mb-3">Learn Anywhere</h3>
                <p className="text-[#060404]/70 leading-relaxed">
                  Access your lessons on any device with our fully responsive platform designed for learning on the go.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24"  data-aos="fade-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#849d7b] rounded-3xl p-12 sm:p-16 text-center shadow-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Join thousands of students mastering logical reasoning. Create your free account and start learning today!
                </p>
                <button
                  onClick={() => navigate("/auth-page")}
                  className="px-10 py-5 rounded-xl bg-white text-[#68ba4a] font-bold text-lg hover:bg-[#f8faf9] transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center gap-3">
                    <i className="fas fa-user-plus"></i>
                    Create Free Account
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
