import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { ONBOARDING_STEPS } from "../../constants/onboarding";
import { CheckCircle2, Circle, Dot } from "lucide-react";

// Separated Styles
const styles = {
  layout: "min-h-screen bg-gray-50 flex flex-col md:flex-row max-w-7xl mx-auto",
  sidebar:
    "w-full md:w-80 bg-white border-r border-gray-200 p-8 hidden md:block", // Hidden on mobile, Sidebar on Web
  content: "flex-1 p-6 md:p-12 overflow-y-auto",
  stepItem: (active, completed) => `
    flex items-center gap-4 p-3 rounded-lg transition-all mb-2
    ${active ? "bg-primary/5 text-primary font-medium" : "text-gray-500"}
    ${completed ? "text-green-600" : ""}
  `,
  mobileHeader: "md:hidden bg-white p-4 border-b mb-6", // Fallback for mobile
};

export const OnboardingLayout = () => {
  const { user } = useAuthStore();
  const currentStep = user?.onboardingStep || 0;
  const steps = Object.values(ONBOARDING_STEPS).slice(0, 6);

  return (
    <div className={styles.layout}>
      {/* WEB SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className="mb-10">
          <h1 className="text-xl font-bold text-gray-900">Profile Setup</h1>
          <p className="text-sm text-gray-500">Complete your information</p>
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
                  <Dot size={24} className="text-primary animate-pulse" />
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
        <div className="max-w-3xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
