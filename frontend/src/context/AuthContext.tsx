import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import api, { setAccessToken } from "../services/api";
import Swal from "sweetalert2";

interface User {
  id: string;
  email: string;
  theme: string;
  firstname?: string;
  lastname?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  order_index: number;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  changeTheme: (theme: string) => Promise<void>;
  fetchLessons: () => Promise<Lesson[]>;
  fetchLessonById: (id: string) => Promise<Lesson | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // fetch current user to start session
  useEffect(() => {
    async function checkAuth() {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.post("/user/refresh");
        setAccessToken(data.accessToken);
        // Use the user profile endpoint instead of /user/me
        const profileResponse = await api.get("/user/profile");
        setUser(profileResponse.data.user);
      } catch (refreshErr) {
        console.log("User not logged in: ", refreshErr);
        localStorage.removeItem("user");
        localStorage.removeItem("theme");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Login
  async function login(email: string, password: string) {
    const response = await api.post("/user/login", {
      email,
      password,
    });

    if (response.data.success) {
      setAccessToken(response.data.accessToken); // This sets it in api.js
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("theme", JSON.stringify(response.data.user.theme));
      // Navigation is handled by the calling component
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  }

  // change theme
  async function changeTheme(theme: string) {
    try {
      const response = await api.patch("/user/update_theme", {
        theme,
      });

      if (response.data.success) {
        // Update user state with new theme
        setUser((prevUser) => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            theme,
          };
        });

        // Update localStorage
        const storedUserStr = localStorage.getItem("user");
        const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
        if (storedUser) {
          storedUser.theme = theme;
          localStorage.setItem("user", JSON.stringify(storedUser));
        }
        localStorage.setItem("theme", JSON.stringify(theme));

        // await Swal.fire({
        //   icon: "success",
        //   title: "Theme updated!",
        //   text: `Theme changed to ${theme} mode`,
        //   confirmButtonColor: "#10b981",
        //   toast: true,
        //   position: "top-end",
        //   showConfirmButton: false,
        //   timer: 800,
        //   timerProgressBar: true,
        // });
      }
    } catch (err) {
      console.error("Unable to update theme: ", err);
      await Swal.fire({
        icon: "error",
        title: "Update failed!",
        text: "Failed to update theme. Please try again.",
        confirmButtonColor: "#ef4444",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 800,
        timerProgressBar: true,
      });
    }
  }

  // Fetch all lessons
  const fetchLessons = useCallback(async () => {
    try {
      const response = await api.get("/lessons");

      if (response.data.success) {
        return response.data.lessons;
      } else {
        console.error("Failed to fetch lessons:", response.data.message);
        return [];
      }
    } catch (err) {
      console.error("Error fetching lessons:", err);
      return [];
    }
  }, []);

  // Fetch single lesson by ID
  const fetchLessonById = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/lessons/lesson/${id}`);
      if (response.data.success) {
        return response.data.lesson;
      }
      return null;
    } catch (err) {
      console.error("Error fetching lesson:", err);
      throw err;
    }
  }, []);



  // logout
  async function logout() {
    try {
      await api.post("/user/logout");
      await Swal.fire({
        icon: "success",
        title: "Logout successful!",
        text: "You logged out successfully from your account",
        confirmButtonColor: "#10b981",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("Logout error: ", err);
      await Swal.fire({
        icon: "error",
        title: "Logout failed!",
        text: "Something went wrong while logging out.",
        confirmButtonColor: "#3b82f6",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("theme");
      navigate("/auth-page");
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        changeTheme,
        fetchLessons,
        fetchLessonById,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
