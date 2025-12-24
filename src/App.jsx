import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import {
  ONBOARDING_STEPS,
  STEP_ROUTES,
  USER_ROLES,
} from "./constants/onboarding";

// Layouts & Pages
import { OnboardingLayout } from "./components/onboarding/OnboardingLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Login } from "./pages/auth/Login";
import { InitialOnboarding } from "./pages/user/InitialOnboarding";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ProfileStatus } from "./pages/user/ProfileStatus";
import { HealthForm } from "./pages/user/steps/HealthForm";
import { BasicsForm } from "./pages/user/steps/BasicsForm";

// 1. Loading Screen Component to prevent flicker
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Role Check
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ONBOARDING GATEWAY (Logic remains the same as before...)
  if (!requiredRole || requiredRole !== USER_ROLES.ADMIN) {
    if (!user.termsAccepted) {
      return window.location.pathname === "/onboarding/initial" ? (
        children
      ) : (
        <Navigate to="/onboarding/initial" replace />
      );
    }

    if (user.onboardingStep < 6) {
      const currentStepKey = ONBOARDING_STEPS[user.onboardingStep] || "BASICS";
      const targetRoute = STEP_ROUTES[currentStepKey];

      if (!window.location.pathname.startsWith("/onboarding")) {
        return <Navigate to={targetRoute} replace />;
      }
    }

    if (user.onboardingStep === 6 && user.profileStatus === "PENDING_REVIEW") {
      if (window.location.pathname !== "/profile/status") {
        return <Navigate to="/profile/status" replace />;
      }
    }
  }

  return children;
};

export default function App() {
  const { fetchMe, isLoading } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, []); // Run once on mount

  // 2. Global Loading Check
  // If the app is initializing (checking token), show nothing or a spinner
  // This prevents the "Login" page from briefly flashing before the dashboard loads
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* ... Rest of your routes remain the same ... */}

        <Route
          path="/onboarding/initial"
          element={
            <ProtectedRoute>
              <InitialOnboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingLayout />
            </ProtectedRoute>
          }
        >
          <Route path="basics" element={<BasicsForm />} />
          <Route path="health" element={<HealthForm />} />
        </Route>

        <Route
          path="/profile/status"
          element={
            <ProtectedRoute>
              <ProfileStatus />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
