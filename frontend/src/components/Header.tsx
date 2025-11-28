import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const studentAvatar = user?.avatar ? `${import.meta.env.VITE_API_URL}${user.avatar}` : null;

  // const handleGetStarted = () => {
  //   navigate("/auth");
  //   setDropdownOpen(false);
  // };

  const handleDashboard = () => {
    navigate("/dashboard");
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setDropdownOpen(false);
  };

  return (
    <header className="bg-gray-50 backdrop-blur-md shadow-md sticky top-0 z-50 border-b-2 border-[#e8f5e9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo and Name */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            {/* <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-[#68ba4a] to-[#8baab1] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <i className="fas fa-brain text-white text-xl sm:text-2xl"></i>
            </div> */}
            <img src="./JEKlogo.png" alt="JEK Logo" className="w-12 rounded" />
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-bold bg-[#68ba4a] bg-clip-text text-transparent">
                <span className="text-[#3b7227]">JEK</span> Logic Tutor
              </h1>
              <p className="text-xs text-[#060404]/60">Master The Concepts of Propositional Logic</p>
            </div>
            <div>
              <h1 className="sm:hidden text-lg font-bold bg-[#68ba4a] bg-clip-text text-transparent">
                <span className="text-[#3b7227]">JEK</span> Logic Tutor
              </h1>
              <p className="text-[9px] text-[#060404]/60 sm:hidden">Master The Concepts of Propositional Logic</p>
            </div>

          </div>

          {/* User Avatar/Icon with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#f8faf9] transition-all"
            >
              {user ? (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#68ba4a] text-white flex items-center justify-center font-bold shadow-md">
                  {studentAvatar ? (
                    <img src={studentAvatar} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.firstname?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"
                  )}
                </div>
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#e8f5e9] text-[#8baab1] flex items-center justify-center shadow-md">
                  <i className="fas fa-user text-lg"></i>
                </div>
              )}
              <i className={`fas fa-chevron-down text-[#8baab1] text-sm transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                ></div>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-[#e8f5e9] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-[#e8f5e9] bg-[#f8faf9]">
                        <p className="text-sm font-semibold text-[#060404]">
                          {user.firstname} {user.lastname}
                        </p>
                        <p className="text-xs text-[#060404]/60 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleDashboard}
                        className="w-full text-left px-4 py-3 hover:bg-[#f8faf9] transition-colors flex items-center gap-3 text-[#060404] hov"
                      >
                        <i className="fas fa-home text-[#68ba4a]"></i>
                        <span className="font-medium">Dashboard</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 hover:bg-red-100 transition-colors flex items-center gap-3 text-[#060404]"
                      >
                        <i className="fas fa-sign-out-alt text-red-500 mt-0.5"></i>
                        <span className="font-medium text-red-500">Logout</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth-page"
                      //onClick={handleGetStarted}
                      className="w-full text-left px-4 py-3 hover:bg-[#f8faf9] transition-colors flex items-center gap-3 text-[#060404]"
                    >
                      <i className="fas fa-rocket text-[#68ba4a]"></i>
                      <span className="font-medium">Get Started</span>
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
