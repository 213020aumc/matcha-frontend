import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { ONBOARDING_STEPS } from "../../constants/onboarding";
import { CheckCircle2, Circle, Dot } from "lucide-react";

// Separated Styles
const styles = {
  // Removed max-w-7xl to allow full fluid width if needed, or keep it for the outer shell
  layout: "min-h-screen bg-gray-50 flex flex-col md:flex-row mx-auto",
  sidebar:
    "w-full md:w-80 bg-white border-r border-gray-200 p-8 hidden md:block h-screen sticky top-0",
  // REMOVED internal padding constraints that might fight with the child forms
  content: "flex-1 flex flex-col min-h-screen overflow-y-auto w-full",
  stepItem: (active, completed) => `
    flex items-center gap-4 p-3 rounded-lg transition-all mb-2
    ${active ? "bg-primary/5 text-primary font-medium" : "text-gray-500"}
    ${completed ? "text-green-600" : ""}
  `,
  mobileHeader:
    "md:hidden bg-white p-4 border-b border-gray-200 sticky top-0 z-10",
};

export const OnboardingLayout = () => {
  const { user } = useAuthStore();
  const currentStep = user?.onboardingStep || 0;
  const steps = Object.values(ONBOARDING_STEPS).slice(0, 6);
  const progressPercentage = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className={styles.layout}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-bold text-gray-900">Setup Profile</h1>
          <span className="text-xs text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900">Profile Setup</h1>
          <p className="text-sm text-gray-500 mt-1">Let's get you set up</p>
        </div>
        <nav>
          {steps.map((label, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            return (
              <div
                key={label}
                className={styles.stepItem(isActive, isCompleted)}
              >
                {isCompleted ? (
                  <CheckCircle2 size={20} />
                ) : isActive ? (
                  <Dot
                    size={24}
                    className="text-primary animate-pulse scale-150"
                  />
                ) : (
                  <Circle size={20} />
                )}
                <span className="text-sm">{label}</span>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={styles.content}>
        {/* REMOVED the <div className="max-w-2xl mx-auto"> wrapper here */}
        {/* The Outlet now takes the full available space, allowing the footer to stretch */}
        <Outlet />
      </main>
    </div>
  );
};
