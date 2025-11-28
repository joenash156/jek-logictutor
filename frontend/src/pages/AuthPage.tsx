import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import type { AxiosError } from "axios";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Check password match whenever password or confirmPassword changes
  useEffect(() => {
    if (!isLogin && formData.confirmPassword) {
      if (formData.password === formData.confirmPassword) {
        setPasswordMatch(true);
      } else {
        setPasswordMatch(false);
      }
    } else {
      setPasswordMatch(null);
    }
  }, [formData.password, formData.confirmPassword, isLogin]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation for sign-up
    if (!isLogin && !isAdminMode) {
      if (!formData.firstname || !formData.lastname) {
        Swal.fire({
          icon: "error",
          title: "Missing Information",
          text: "Please fill in your first and last name.",
          confirmButtonColor: "#68ba4a",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }

      if (!formData.confirmPassword) {
        Swal.fire({
          icon: "error",
          title: "Missing Information",
          text: "Please confirm your password.",
          confirmButtonColor: "#68ba4a",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        Swal.fire({
          icon: "error",
          title: "Password Mismatch",
          text: "Passwords do not match. Please try again.",
          confirmButtonColor: "#68ba4a",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }

      if (formData.password.length < 6) {
        Swal.fire({
          icon: "error",
          title: "Weak Password",
          text: "Password must be at least 6 characters long.",
          confirmButtonColor: "#68ba4a",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }
    }

    if (!formData.email || !formData.password) {
      Swal.fire({
        icon: "error",
        title: "Missing Credentials",
        text: "Please enter your email and password.",
        confirmButtonColor: "#68ba4a",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    try {
      if (isLogin) {
        // Login flow
        await login(formData.email, formData.password);
        await Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: "Welcome back to LogicTutor.",
          confirmButtonColor: "#68ba4a",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        navigate("/dashboard");
      } else {
        // Signup flow
        const response = await api.post("/user/signup", {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          password: formData.password,
        });

        if (response.data.success) {
          await Swal.fire({
            icon: "success",
            title: "Account Created!",
            text: "Your account has been created successfully. Please login.",
            confirmButtonColor: "#68ba4a",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
          // Switch to login mode and clear form
          setIsLogin(true);
          setFormData({
            firstname: "",
            lastname: "",
            email: formData.email, // Keep email for convenience
            password: "",
            confirmPassword: "",
          });
        }
      }
    } catch (err) {
      console.error(`${isLogin ? "Login" : "Signup"} failed!`, err);
      const axiosError = err as AxiosError<{ error?: string; message?: string }>;
      await Swal.fire({
        icon: "error",
        title: `${isLogin ? "Login" : "Signup"} Failed`,
        text:
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          `Failed to ${isLogin ? "login" : "create account"}. Please try again.`,
        confirmButtonColor: "#68ba4a",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({ firstname: "", lastname: "", email: "", password: "", confirmPassword: "" });
    setShowPassword(false);
    setPasswordMatch(null);
  };

  useEffect(() => {
    document.title = "JEK Logic Tutor | Login/Register";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8faf9] via-[#e8f5e9] to-[#d8f0dd] p-4 sm:p-6">
      <div className="w-full max-w-6xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#e8f5e9] grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Panel - Logo with Overlay */}
        <div className="hidden md:flex items-center justify-center relative overflow-hidden">
          {/* Background Image */}
          <img
            src="/JEKlogo.png"
            alt="LogicTutor Logo"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/vite.svg";
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-[#8baab1]/85 to-green-400/30"></div>

          {/* Decorative Blur Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 text-center text-white p-8">
            <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-2xl">
              <i className="fas fa-brain text-6xl text-white"></i>
            </div>
            <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">LogicTutor</h1>
            <p className="text-lg opacity-90 mb-2 drop-shadow">Master Logical Reasoning</p>
            <p className="text-sm opacity-75 drop-shadow">Build your proof skills, one step at a time</p>
            <div className="mt-8 flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <i className="fas fa-book-open text-3xl drop-shadow-lg"></i>
                <span className="text-sm drop-shadow">Interactive Lessons</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <i className="fas fa-trophy text-3xl drop-shadow-lg"></i>
                <span className="text-sm drop-shadow">Earn XP & Level Up</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center text-[#060404] bg-white">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#68ba4a] to-[#8baab1] flex items-center justify-center shadow-lg">
              <i className="fas fa-brain text-3xl text-white"></i>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-[#68ba4a] to-[#8baab1] bg-clip-text text-transparent">
              {isAdminMode ? "Admin Access" : isLogin ? "Welcome Back" : "Get Started"}
            </h2>
            <p className="text-sm text-[#060404]/60">
              {isAdminMode
                ? "Admin login for system management"
                : isLogin
                  ? "Sign in to continue your learning journey"
                  : "Create your account and start mastering logic"}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name inputs for signup */}
            {!isLogin && !isAdminMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8baab1]">
                    <i className="fas fa-user"></i>
                  </div>
                  <input
                    name="firstname"
                    type="text"
                    placeholder="First name"
                    value={formData.firstname}
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-[#e8f5e9] focus:outline-none focus:border-[#68ba4a] focus:ring-2 focus:ring-[#68ba4a]/20 transition-all bg-[#f8faf9] hover:bg-white"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8baab1]">
                    <i className="fas fa-user"></i>
                  </div>
                  <input
                    name="lastname"
                    type="text"
                    placeholder="Last name"
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-[#e8f5e9] focus:outline-none focus:border-[#68ba4a] focus:ring-2 focus:ring-[#68ba4a]/20 transition-all bg-[#f8faf9] hover:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8baab1]">
                <i className={`fas ${isAdminMode ? "fa-user-shield" : "fa-envelope"}`}></i>
              </div>
              <input
                name="email"
                type="email"
                placeholder={isAdminMode ? "Admin Email" : "Email address"}
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-[#e8f5e9] focus:outline-none focus:border-[#68ba4a] focus:ring-2 focus:ring-[#68ba4a]/20 transition-all bg-[#f8faf9] hover:bg-white"
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8baab1]">
                <i className="fas fa-lock"></i>
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={isAdminMode ? "Admin Password" : "Password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 border-[#e8f5e9] focus:outline-none focus:border-[#68ba4a] focus:ring-2 focus:ring-[#68ba4a]/20 transition-all bg-[#f8faf9] hover:bg-white"
              />
              <button
                type="button"
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#68ba4a]/30 ${showPassword
                  ? "text-[#68ba4a] hover:bg-[#68ba4a]/10"
                  : "text-[#8baab1] hover:bg-[#8baab1]/10"
                  }`}
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>

            {/* Confirm Password field - Only for signup */}
            {!isLogin && !isAdminMode && (
              <div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8baab1]">
                    <i className="fas fa-lock"></i>
                  </div>
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border-2 transition-all bg-[#f8faf9] hover:bg-white focus:outline-none ${passwordMatch === null
                      ? "border-[#e8f5e9] focus:border-[#68ba4a] focus:ring-2 focus:ring-[#68ba4a]/20"
                      : passwordMatch
                        ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        : "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      }`}
                  />
                </div>
                {/* Password match indicator */}
                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    {passwordMatch ? (
                      <>
                        <i className="fas fa-check-circle text-green-500 text-sm"></i>
                        <span className="text-xs text-green-600 font-medium">
                          Passwords match
                        </span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-times-circle text-red-500 text-sm"></i>
                        <span className="text-xs text-red-600 font-medium">
                          Passwords do not match
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full p-4 rounded-xl bg-gradient-to-r from-[#68ba4a] to-[#7cc55f] text-white font-bold text-lg hover:from-[#5ca03e] hover:to-[#68ba4a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center gap-2">
                <i className={`fas ${isLogin ? "fa-sign-in-alt" : "fa-user-plus"}`}></i>
                {isAdminMode ? "Admin Login" : isLogin ? "Sign In" : "Create Account"}
              </span>
            </button>

            {/* Google Login - Only for non-admin */}
            {!isAdminMode && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#e8f5e9] to-transparent"></div>
                  <span className="text-xs text-[#060404]/50 font-medium">OR CONTINUE WITH</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#e8f5e9] to-transparent"></div>
                </div>

                <button
                  type="button"
                  onClick={() => console.log("Google login clicked")}
                  className="w-full p-4 rounded-xl border-2 border-[#e8f5e9] text-[#060404] font-semibold hover:bg-[#f8faf9] hover:border-[#8baab1] transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <img
                      src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                      alt="Google"
                      className="w-6 h-6"
                    />
                    <span>Continue with Google</span>
                  </div>
                </button>
              </>
            )}
          </form>

          {/* Footer Links */}
          <div className="mt-6 space-y-3">
            {!isAdminMode ? (
              <p className="text-center text-sm text-[#060404]/70">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-[#68ba4a] hover:text-[#5ca03e] cursor-pointer transition-colors"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            ) : (
              <p className="text-center text-sm text-[#060404]/70">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminMode(false);
                    setFormData({
                      firstname: "",
                      lastname: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                    });
                  }}
                  className="text-[#68ba4a] font-bold hover:text-[#5ca03e] underline decoration-2 underline-offset-2 transition-colors"
                >
                  <i className="fas fa-arrow-left mr-1"></i>
                  Back to Student Login
                </button>
              </p>
            )}

            <Link
              to={"/"}
              className="text-sm text-[#060404]/70 hover:text-[#68ba4a] transition-colors text-center block"
            >
              Back to <span className="">Landing Page</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
