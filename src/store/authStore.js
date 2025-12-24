import { create } from "zustand";
import { apiClient } from "../services/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start true to block UI until we check token

  // Actions
  login: (userData, token) => {
    if (token) {
      localStorage.setItem("token", token);
    }
    set({ user: userData, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false, isLoading: false });
    // Use window.location to ensure a clean state reset, but check if we are already there
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  },

  fetchMe: async () => {
    // 1. PREVENT LOOP: Check if token exists before calling API
    const token = localStorage.getItem("token");

    if (!token) {
      // No token? We are definitely a guest. Stop loading, don't call API.
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    // 2. Token exists? Verify it with the backend.
    set({ isLoading: true });
    try {
      const { data } = await apiClient.get("/user/profile/current");

      set({
        user: data.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return data.data;
    } catch (error) {
      // If the token was invalid (401), the interceptor usually handles logout.
      // But we ensure state is cleared here too.
      console.error("Session verification failed:", error);
      localStorage.removeItem("token"); // Clear bad token
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUserStep: (newStep) => {
    set((state) => ({
      user: { ...state.user, onboardingStep: newStep },
    }));
  },
}));
