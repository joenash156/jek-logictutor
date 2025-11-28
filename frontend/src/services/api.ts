import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// An axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// in-memory access token
let accessToken: string | null = null;

// set the token after login or refresh
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// add token to headers before every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// Handle expired access tokens automatically
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh if we have a 401 and haven't tried before
    // Also skip refresh for login/register endpoints
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes("/login") &&
      !originalRequest.url.includes("/register")
    ) {
      originalRequest._retry = true;

      try {
        // call refresh token endpoint
        const { data } = await api.post("/user/refresh");

        const newAccessToken = data.accessToken;
        setAccessToken(newAccessToken);

        // retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed: ", refreshError);
        // Clear token on refresh failure
        setAccessToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("theme");
        // Redirect to login only if not already there
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
