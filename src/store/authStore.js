// src/store/authStore.js
import { create } from "zustand";
import { apiClient } from "../services/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  permissions: [],

  // Check if user is admin
  isAdmin: () => {
    const { user } = get();
    if (!user) return false;

    const adminRoles = ["Super Admin", "Admin", "Moderator"];
    return adminRoles.includes(user?.accessRole?.name);
  },

  // Fetch current user profile on app load
  fetchMe: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
      });
      return null;
    }

    try {
      set({ isLoading: true });
      const { data } = await apiClient.get("/user/profile/current");

      const user = data.data.user;
      const permissions =
        user?.accessRole?.permissions?.map((p) => p.slug) || [];

      set({
        user: {
          ...user,
          onboardingStep: data.data.lastCompletedStep ?? user.onboardingStep,
          suggestedStage: data.data.suggestedStage,
          isComplete: data.data.isComplete,
        },
        isAuthenticated: true,
        permissions,
        isLoading: false,
      });

      return data.data;
    } catch (error) {
      console.error("fetchMe error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
      }
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
      });
      return null;
    }
  },

  // Update user step after completing a stage
  updateUserStep: (step) => {
    set((state) => ({
      user: state.user ? { ...state.user, onboardingStep: step } : null,
    }));
  },

  // Update user data locally
  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },

  // Check if user has a specific permission
  hasPermission: (permissionSlug) => {
    const { permissions, user } = get();
    // Super admin bypass - add return true
    if (user?.accessRole?.name === "Super Admin") return true;
    return permissions.includes(permissionSlug);
  },

  // Login handler
  login: async (email) => {
    const { data } = await apiClient.post("/auth/login", { email });
    return data;
  },

  // Verify OTP and set user
  verifyOtp: async (email, otp) => {
    const { data } = await apiClient.post("/auth/verify-otp", { email, otp });

    // Store token
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    const user = data.data?.user;
    const permissions =
      user?.accessRole?.permissions?.map((p) => p.slug) || [];

    set({
      user: user,
      isAuthenticated: true,
      permissions,
      isLoading: false,
    });

    return data;
  },

  // Submit initial onboarding
  submitOnboarding: async (onboardingData) => {
    const { data } = await apiClient.put(
      "/user/profile/onboarding",
      onboardingData
    );

    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            ...onboardingData,
            termsAccepted: true,
          }
        : null,
    }));

    return data;
  },

  // Logout
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem("token");
    set({
      user: null,
      isAuthenticated: false,
      permissions: [],
      isLoading: false,
    });
  },
}));
