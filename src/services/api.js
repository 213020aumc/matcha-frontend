// src/services/api.js
import axios from "axios";

// Main API client with auth interceptors
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1",
  withCredentials: true,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors - but NOT for auth routes or profile/current
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";

    // Skip redirect for these routes
    const skipRedirectRoutes = [
      "/auth/",
      "/user/profile/me",
      "/user/profile/onboarding",
    ];

    const shouldSkipRedirect = skipRedirectRoutes.some((route) =>
      requestUrl.includes(route)
    );

    if (error.response?.status === 401 && !shouldSkipRedirect) {
      localStorage.removeItem("token");
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Legacy default export for components using `API.patch("/profile")`
const API = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
};

export default API;
