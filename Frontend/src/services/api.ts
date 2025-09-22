import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";

// ----------------------
// Types
// ----------------------
export interface User {
  name: string;
  email: string;
  // add other fields from backend if needed
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
}

// ----------------------
// Axios instance
// ----------------------
const api = axios.create({
  baseURL: "/api", // ONLY "/api", let Vite proxy handle it
  headers: { "Content-Type": "application/json" },
});

// ----------------------
// ----------------------
// Request interceptor
// ----------------------
api.interceptors.request.use((config) => {
  // Only attach token for protected routes, not /auth routes
  if (!config.url?.startsWith("/auth")) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ----------------------
// Auth API helpers
// ----------------------
export const registerUser = async (data: { name: string; email: string; password: string }): Promise<RegisterResponse> => {
  try {
    console.log("📩 Sending register request to:", api.defaults.baseURL + "/auth/register", data);
    const res = await api.post<RegisterResponse>("/auth/register", data);
    console.log("✅ Register success:", res.data);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("❌ Register API error:", err.response?.data || err.message);
      throw err.response?.data || new Error(err.message);
    } else {
      console.error("❌ Unknown error:", err);
      throw err;
    }
  }
};

export const loginUser = async (data: { email: string; password: string }): Promise<LoginResponse> => {
  try {
    console.log("📩 Sending login request to:", api.defaults.baseURL + "/auth/login", data);
    const res = await api.post<LoginResponse>("/auth/login", data);
    console.log("✅ Login success:", res.data);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("❌ Login API error:", err.response?.data || err.message);
      throw err.response?.data || new Error(err.message);
    } else {
      console.error("❌ Unknown error:", err);
      throw err;
    }
  }
};

// ----------------------
// Example protected route
// ----------------------
export const getUsers = async (): Promise<User[]> => {
  try {
    const res = await api.get<User[]>("/users");
    return res.data;
  } catch (err) {
    console.error("❌ getUsers API error:", err);
    throw err;
  }
};

export default api;
