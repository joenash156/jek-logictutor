import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-linear-to-br from-[#f8faf9] to-[#e8f5e9] border-t-2 border-[#e8f5e9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg">
                <img src="./JEKlogo.png" alt="" className="rounded-lg"/>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-linear-to-r from-[#68ba4a] to-[#8baab1] bg-clip-text text-transparent">
                  LogicTutor
                </h3>
                <p className="text-xs text-[#060404]/60">Master Logic</p>
              </div>
            </div>
            <p className="text-sm text-[#060404]/70 leading-relaxed">
              Your comprehensive platform for mastering logical reasoning and building strong proof skills.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-[#060404] mb-4 text-sm uppercase tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="text-sm text-[#060404]/70 hover:text-[#68ba4a] transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-home text-xs"></i>
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/auth")}
                  className="text-sm text-[#060404]/70 hover:text-[#68ba4a] transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-sign-in-alt text-xs"></i>
                  Get Started
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-sm text-[#060404]/70 hover:text-[#68ba4a] transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-graduation-cap text-xs"></i>
                  Lessons
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-[#060404] mb-4 text-sm uppercase tracking-wide">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-[#060404]/70 hover:text-[#68ba4a] transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-book text-xs"></i>
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-[#060404]/70 hover:text-[#68ba4a] transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-question-circle text-xs"></i>
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-[#060404]/70 hover:text-[#68ba4a] transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-shield-alt text-xs"></i>
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-[#060404] mb-4 text-sm uppercase tracking-wide">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <i className="fas fa-envelope text-[#8baab1] mt-1"></i>
                <div>
                  <p className="text-sm text-[#060404]/70">Email</p>
                  <a
                    href="mailto:support@logictutor.com"
                    className="text-sm font-medium text-[#68ba4a] hover:underline"
                  >
                    support@jekapp.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-phone text-[#8baab1] mt-1"></i>
                <div>
                  <p className="text-sm text-[#060404]/70">Phone</p>
                  <a
                    href="tel:+233257266272"
                    className="text-sm font-medium text-[#68ba4a] hover:underline"
                  >
                    +233 (257) 266-272
                  </a>
                  <span className="text-green-500">/</span>
                  <a
                    href="tel:+233501234567"
                    className="text-sm font-medium text-[#68ba4a] hover:underline"
                  >
                     +233 (501) 234-567
                  </a>

                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-[#e8f5e9]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#060404]/60 text-center sm:text-left">
              © {new Date().getFullYear()} LogicTutor. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white hover:bg-[#68ba4a] text-[#8baab1] hover:text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white hover:bg-[#68ba4a] text-[#8baab1] hover:text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white hover:bg-[#68ba4a] text-[#8baab1] hover:text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white hover:bg-[#68ba4a] text-[#8baab1] hover:text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md"
              >
                <i className="fab fa-github"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
