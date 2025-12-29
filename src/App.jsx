import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { useAuthStore } from "./store/authStore";

// Layouts & Pages
import { OnboardingLayout } from "./components/onboarding/OnboardingLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Login } from "./pages/auth/Login";
import { InitialOnboarding } from "./pages/user/InitialOnboarding";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ProfileStatus } from "./pages/user/ProfileStatus";
import { HealthForm } from "./pages/user/steps/HealthForm";
import { BasicsForm } from "./pages/user/steps/BasicsForm";
import { BackgroundForm } from "./pages/user/steps/BackgroundForm";
import { GeneticForm } from "./pages/user/steps/GeneticForm";
import { CompensationForm } from "./pages/user/steps/CompensationForm";
import { LegalAgreements } from "./pages/user/steps/LegalAgreements";

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Helper function to get route for a given step
const getRouteForStep = (step) => {
  const stepRoutes = {
    0: "/onboarding/basics",
    1: "/onboarding/basics",
    2: "/onboarding/background",
    3: "/onboarding/health",
    4: "/onboarding/genetic",
    5: "/onboarding/compensation",
    6: "/onboarding/legal",
  };
  return stepRoutes[step] || "/onboarding/basics";
};

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, isAuthenticated, isLoading, hasPermission, isAdmin } =
    useAuthStore();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Permission check for specific features
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // --- ADMIN CHECK (EARLY EXIT) ---
  // If user is admin and trying to access onboarding routes, redirect to admin
  if (isAdmin()) {
    const currentPath = location.pathname;
    if (
      currentPath.startsWith("/onboarding") ||
      currentPath === "/profile/status"
    ) {
      return <Navigate to="/admin" replace />;
    }
    // Admin can access admin routes and other non-onboarding routes
    return children;
  }

  // --- ONBOARDING GATEWAY FOR REGULAR USERS ---
  const currentPath = location.pathname;
  const onboardingStep = user?.onboardingStep || 0;
  const profileStatus = user?.profileStatus;

  // 1. User hasn't accepted terms yet - must complete initial onboarding
  if (!user?.termsAccepted || !user?.role) {
    if (currentPath !== "/onboarding/initial") {
      return <Navigate to="/onboarding/initial" replace />;
    }
    return children;
  }

  // 2. Profile is PENDING_REVIEW - show status page
  if (profileStatus === "PENDING_REVIEW") {
    if (!currentPath.startsWith("/profile/status")) {
      return <Navigate to="/profile/status" replace />;
    }
    return children;
  }

  // 3. Profile is ACTIVE - allow access to main app
  if (profileStatus === "ACTIVE") {
    if (currentPath.startsWith("/onboarding/")) {
      return <Navigate to="/profile/status" replace />;
    }
    return children;
  }

  // 4. Profile is REJECTED - allow them to edit
  if (profileStatus === "REJECTED") {
    return children;
  }

  // 5. DRAFT status - in progress onboarding
  if (currentPath === "/onboarding/initial" && user?.role) {
    // Already completed initial, go to profile forms
    return <Navigate to={getRouteForStep(onboardingStep)} replace />;
  }

  return children;
};

// Admin-only route wrapper
const AdminRoute = ({ children, requiredPermission }) => {
  const { user, isAuthenticated, isLoading, hasPermission, isAdmin } =
    useAuthStore();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Check if user is admin
  if (!isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Simple unauthorized page
const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
      <p className="text-gray-600 mb-6">
        You don't have permission to access this page.
      </p>
      <a href="/login" className="text-indigo-600 hover:underline">
        Go to Login
      </a>
    </div>
  </div>
);

export default function App() {
  const { fetchMe, isLoading } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* --- PHASE 1: INITIAL WIZARD --- */}
        <Route
          path="/onboarding/initial"
          element={
            <ProtectedRoute>
              <InitialOnboarding />
            </ProtectedRoute>
          }
        />

        {/* --- PHASE 2: DETAILED FORMS --- */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingLayout />
            </ProtectedRoute>
          }
        >
          <Route path="basics" element={<BasicsForm />} />
          <Route path="background" element={<BackgroundForm />} />
          <Route path="health" element={<HealthForm />} />
          <Route path="genetic" element={<GeneticForm />} />
          <Route path="compensation" element={<CompensationForm />} />
          <Route path="legal" element={<LegalAgreements />} />
        </Route>

        {/* --- PROFILE STATUS --- */}
        <Route
          path="/profile/status"
          element={
            <ProtectedRoute>
              <ProfileStatus />
            </ProtectedRoute>
          }
        />

        {/* --- ADMIN ROUTES --- */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <DashboardLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
