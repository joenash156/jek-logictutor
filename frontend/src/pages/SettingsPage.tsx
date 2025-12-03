import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Swal from "sweetalert2";
import api from "../services/api";


const API_URL: string = import.meta.env.VITE_API_URL;

interface SettingsPageProps {
  studentName: string;
}

export default function SettingsPage({ studentName }: SettingsPageProps) {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "danger">("profile");

  // Profile states
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar ? `${import.meta.env.VITE_API_URL}${user.avatar}` : ""
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      const maxSizeInBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Please select an image smaller than 5MB",
          confirmButtonColor: "#68ba4a",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: "Please select an image file (JPEG, PNG, GIF, WebP)",
          confirmButtonColor: "#68ba4a",
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setAvatarFile(file);
    }
  };

  useEffect(() => {
    document.title = "JEK Logic Tutor | Settings";
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSavingProfile(true);

    try {
      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        const uploadResponse = await api.post("/user/upload_avatar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (uploadResponse.data.success) {
          // Update user avatar in context
          const fullAvatarUrl = `${API_URL}${uploadResponse.data.avatarUrl}`;

          setUser((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              avatar: uploadResponse.data.avatarUrl,
            };
          });

          // Update localStorage
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            parsedUser.avatar = uploadResponse.data.avatarUrl;
            localStorage.setItem("user", JSON.stringify(parsedUser));
          }

          setAvatarPreview(fullAvatarUrl);
          setAvatarFile(null);
        }
      }

      // Update profile info (firstname, lastname)
      const response = await api.patch("/user/update_profile", {
        firstname: user.firstname,
        lastname: user.lastname,
      });

      if (response.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Profile Updated!",
          text: "Your profile has been updated successfully",
          confirmButtonColor: "#68ba4a",
          timer: 2000,
          timerProgressBar: true,
        });
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);

      let errorMessage = "Failed to update profile. Please try again.";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: errorMessage,
        confirmButtonColor: "#68ba4a",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle password change
  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));

    // Check password match for confirm field
    if (field === "confirmPassword" || field === "newPassword") {
      const newPass = field === "newPassword" ? value : passwordData.newPassword;
      const confirmPass = field === "confirmPassword" ? value : passwordData.confirmPassword;

      if (confirmPass) {
        setPasswordMatch(newPass === confirmPass);
      } else {
        setPasswordMatch(null);
      }
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      await Swal.fire({
        icon: "error",
        title: "Missing Fields",
        text: "Please fill in all password fields",
        confirmButtonColor: "#68ba4a",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      await Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "New password and confirm password do not match",
        confirmButtonColor: "#68ba4a",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      await Swal.fire({
        icon: "error",
        title: "Weak Password",
        text: "Password must be at least 6 characters long",
        confirmButtonColor: "#68ba4a",
      });
      return;
    }

    setChangingPassword(true);

    try {
      const response = await api.patch("/user/change_password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Password Changed!",
          text: "Your password has been changed successfully. Please login again.",
          confirmButtonColor: "#68ba4a",
          timer: 2500,
          timerProgressBar: true,
        });

        // Clear password fields
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordMatch(null);

        // Logout user to re-login with new password
        setTimeout(() => {
          logout();
        }, 2500);
      }
    } catch (error: any) {
      console.error("Failed to change password:", error);
      await Swal.fire({
        icon: "error",
        title: "Password Change Failed",
        text: error.response?.data?.error || "Failed to change password. Please check your current password and try again.",
        confirmButtonColor: "#68ba4a",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    const { value: password } = await Swal.fire({
      title: "Delete Account",
      html: `
        <div class="text-left">
          <p class="text-sm text-gray-600 mb-4">This action cannot be undone. All your data will be permanently deleted.</p>
          <p class="text-sm font-semibold text-red-600 mb-4">Please enter your password to confirm account deletion:</p>
        </div>
      `,
      input: "password",
      inputPlaceholder: "Enter your password",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Delete Account",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      inputValidator: (value) => {
        if (!value) {
          return "Password is required";
        }
        return null;
      },
    });

    if (password) {
      try {
        const response = await api.delete("/user/delete", {
          data: { password },
        });

        if (response.data.success) {
          await Swal.fire({
            icon: "success",
            title: "Account Deleted",
            text: "Your account has been permanently deleted. We're sorry to see you go.",
            confirmButtonColor: "#68ba4a",
            timer: 2500,
            timerProgressBar: true,
          });

          // Logout and navigate to auth page
          setTimeout(() => {
            logout();
          }, 2500);
        }
      } catch (error: any) {
        console.error("Failed to delete account:", error);
        await Swal.fire({
          icon: "error",
          title: "Deletion Failed",
          text: error.response?.data?.error || "Failed to delete account. Please check your password and try again.",
          confirmButtonColor: "#68ba4a",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] to-[#e8f5e9] flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="settings" />

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 md:ml-64">
        {/* Header */}
        <header className="mb-6" data-aos="fade-down">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-xl bg-white shadow-md text-[#060404] hover:bg-[#68ba4a] hover:text-white transition-all"
              aria-label="Toggle Menu"
            >
              <i className={`fas ${sidebarOpen ? "fa-times" : "fa-bars"} text-lg`}></i>
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
                <i className="fas fa-cog text-[#68ba4a]"></i>
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-[#060404]/70 mt-2">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </header>

        {/* Settings Container */}
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div
            className="bg-white rounded-2xl shadow-md border border-[#b3ccb8]/40 mb-6 overflow-hidden"
            data-aos="fade-up"
          >
            <div className="flex border-b border-[#e8f5e9]">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base transition-all ${activeTab === "profile"
                  ? "bg-gradient-to-r from-[#68ba4a] to-[#7cc55f] text-white"
                  : "text-[#060404]/70 hover:bg-[#f8faf9]"
                  }`}
              >
                <i className="fas fa-user mr-2"></i>
                <span className="hidden sm:inline">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base transition-all ${activeTab === "security"
                  ? "bg-gradient-to-r from-[#68ba4a] to-[#7cc55f] text-white"
                  : "text-[#060404]/70 hover:bg-[#f8faf9]"
                  }`}
              >
                <i className="fas fa-lock mr-2"></i>
                <span className="hidden sm:inline">Security</span>
              </button>
              <button
                onClick={() => setActiveTab("danger")}
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base transition-all ${activeTab === "danger"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                  : "text-[#060404]/70 hover:bg-[#f8faf9]"
                  }`}
              >
                <i className="fas fa-exclamation-triangle mr-2"></i>
                <span className="hidden sm:inline">Danger Zone</span>
              </button>
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div
              className="bg-white rounded-2xl shadow-md border border-[#b3ccb8]/40 p-6 sm:p-8"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <h2 className="text-xl font-bold text-[#060404] mb-6 flex items-center gap-2">
                <i className="fas fa-id-card text-[#68ba4a]"></i>
                Profile Information
              </h2>

              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-[#e8f5e9]">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-[#68ba4a] shadow-lg">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#68ba4a] to-[#8baab1] flex items-center justify-center text-white text-4xl font-bold">
                        {user?.firstname?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#68ba4a] text-white flex items-center justify-center shadow-lg hover:bg-[#5a9a3d] transition-all transform hover:scale-110"
                  >
                    <i className="fas fa-camera"></i>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-[#060404] mb-1">
                    {user?.firstname} {user?.lastname}
                  </h3>
                  <p className="text-sm text-[#060404]/70 mb-3">{user?.email}</p>
                  <p className="text-xs text-[#060404]/50">
                    Click the camera icon to change your profile picture
                  </p>
                  {avatarFile && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1 justify-center sm:justify-start">
                      <i className="fas fa-check-circle"></i>
                      <span>New image selected. Click Save to upload.</span>
                    </p>
                  )}
                  <p className="text-xs text-[#060404]/40 mt-2">
                    Supported: JPEG, PNG, GIF, WebP (Max 5MB)
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#060404] mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-[#8baab1]"></i>
                      <input
                        type="text"
                        value={user?.firstname || ""}
                        disabled
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#e8f5e9] bg-[#f8faf9] text-[#060404]/50 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#060404] mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-[#8baab1]"></i>
                      <input
                        type="text"
                        value={user?.lastname || ""}
                        disabled
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#e8f5e9] bg-[#f8faf9] text-[#060404]/50 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#060404] mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-[#8baab1]"></i>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-[#e8f5e9] bg-[#f8faf9] text-[#060404]/50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#68ba4a] to-[#7cc55f] text-white font-semibold hover:from-[#5a9a3d] hover:to-[#68ba4a] transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingProfile ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div
              className="bg-white rounded-2xl shadow-md border border-[#b3ccb8]/40 p-6 sm:p-8"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <h2 className="text-xl font-bold text-[#060404] mb-6 flex items-center gap-2">
                <i className="fas fa-shield-alt text-[#68ba4a]"></i>
                Security Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#060404] mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-[#8baab1]"></i>
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                      placeholder="Enter current password"
                      className="w-full pl-11 pr-12 py-3 rounded-xl border-2 border-[#e8f5e9] focus:outline-none focus:border-[#68ba4a] focus:ring-2 focus:ring-[#68ba4a]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#8baab1] hover:text-[#68ba4a] transition"
                    >
                      <i className={`fas ${showPasswords.current ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#060404] mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-[#8baab1]"></i>
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-11 pr-12 py-3 rounded-xl border-2 border-[#e8f5e9] focus:outline-none focus:border-[#68ba4a] focus:ring-2 focus:ring-[#68ba4a]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#8baab1] hover:text-[#68ba4a] transition"
                    >
                      <i className={`fas ${showPasswords.new ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#060404] mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-[#8baab1]"></i>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                      placeholder="Confirm new password"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${passwordMatch === null
                        ? "border-[#e8f5e9] focus:border-[#68ba4a] focus:ring-2 focus:ring-[#68ba4a]/20"
                        : passwordMatch
                          ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                          : "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        }`}
                    />
                  </div>
                  {passwordData.confirmPassword && (
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

                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-700 flex items-start gap-2">
                    <i className="fas fa-info-circle mt-0.5"></i>
                    <span>After changing your password, you'll be logged out and need to login again with your new password.</span>
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleChangePassword}
                    disabled={changingPassword || !passwordMatch}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#68ba4a] to-[#7cc55f] text-white font-semibold hover:from-[#5a9a3d] hover:to-[#68ba4a] transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changingPassword ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Changing Password...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-key"></i>
                        <span>Change Password</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === "danger" && (
            <div
              className="bg-white rounded-2xl shadow-md border-2 border-red-200 p-6 sm:p-8"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <h2 className="text-xl font-bold text-red-600 mb-6 flex items-center gap-2">
                <i className="fas fa-exclamation-triangle"></i>
                Danger Zone
              </h2>

              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-red-700 mb-2">Delete Account</h3>
                <p className="text-sm text-red-600 mb-4">
                  Once you delete your account, there is no going back. All your data, including
                  lessons progress, quiz scores, and profile information will be permanently
                  deleted.
                </p>
                <ul className="text-sm text-red-600 mb-6 space-y-2">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-times-circle mt-1"></i>
                    <span>All your learning progress will be lost</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-times-circle mt-1"></i>
                    <span>Quiz submissions and scores will be deleted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-times-circle mt-1"></i>
                    <span>This action cannot be undone</span>
                  </li>
                </ul>
                <button
                  onClick={handleDeleteAccount}
                  className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <i className="fas fa-trash-alt"></i>
                  <span>Delete My Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
