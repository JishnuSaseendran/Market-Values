import { create } from "zustand";
import api from "../lib/api";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/login", { username, password });
      const token = res.data.access_token;
      localStorage.setItem("token", token);

      const userRes = await api.get("/auth/me");
      localStorage.setItem("user", JSON.stringify(userRes.data));

      set({ token, user: userRes.data, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.detail || "Login failed", loading: false });
      return false;
    }
  },

  register: async (email, username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/register", { email, username, password });
      const token = res.data.access_token;
      localStorage.setItem("token", token);

      const userRes = await api.get("/auth/me");
      localStorage.setItem("user", JSON.stringify(userRes.data));

      set({ token, user: userRes.data, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.detail || "Registration failed", loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
