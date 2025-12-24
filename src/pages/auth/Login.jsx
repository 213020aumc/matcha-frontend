import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { apiClient } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { OtpInput } from "../../components/ui/OtpInput";
import { formStyles } from "../../styles/theme";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";

const styles = {
  container: "min-h-screen flex bg-white",
  brandSide:
    "hidden lg:flex lg:w-1/2 bg-primary items-center justify-center relative overflow-hidden",
  brandContent: "relative z-10 text-white p-12 max-w-lg",
  brandTitle: "text-4xl font-bold mb-6",
  brandText: "text-lg text-indigo-100 leading-relaxed",
  formSide:
    "w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-gray-50",
  formCard:
    "w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100",
  header: "text-center",
  title: "text-2xl font-bold text-gray-900 tracking-tight",
  subtitle: "mt-2 text-sm text-gray-600",
  timer:
    "text-sm text-gray-500 font-medium flex items-center justify-center gap-2 mt-4",
};

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // State
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Timer State
  const [timeLeft, setTimeLeft] = useState(0);

  // Timer Logic
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // STEP 1: Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");

    try {
      // API Call: Request OTP
      await apiClient.post("/auth/login", { email });

      // Success: Move to Step 2 & Start Timer
      setStep(2);
      setTimeLeft(30); // 30 seconds cooldown
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Verify API Call
      const { data } = await apiClient.post("/auth/verify-otp", { email, otp });
      const user = data.data.user;

      // 2. Update Global Store (Sync)
      // This sets isAuthenticated = true immediately
      login(user, data.token);

      // 3. ROLE-BASED REDIRECTION LOGIC
      if (user.role === "ADMIN" || user.role === "Super Admin") {
        // A. Admin Path
        navigate("/admin", { replace: true });
      } else {
        // B. Standard User Path (Calculate "Relevant UI")

        // Scenario 1: Terms not accepted -> Initial Onboarding
        if (!user.termsAccepted) {
          navigate("/onboarding/initial", { replace: true });
          return;
        }

        // Scenario 2: Incomplete Wizard (Steps 0-5)
        // Check ONBOARDING_STEPS to find the string key (e.g., "HEALTH")
        if (user.onboardingStep < 6) {
          const currentStepKey =
            ONBOARDING_STEPS[user.onboardingStep] || "BASICS";
          const targetRoute = STEP_ROUTES[currentStepKey];
          navigate(targetRoute, { replace: true });
          return;
        }

        // Scenario 3: Pending Review (Step 6)
        if (user.profileStatus === "PENDING_REVIEW") {
          navigate("/profile/status", { replace: true });
          return;
        }

        // Scenario 4: Fully Active / Dashboard
        navigate("/profile/status", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Invalid code. Please check and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* LEFT SIDE: BRANDING */}
      <div className={styles.brandSide}>
        <div className="absolute inset-0 bg-linear-to-br from-indigo-600 to-blue-700 opacity-90" />
        <div className={styles.brandContent}>
          <h1 className={styles.brandTitle}>Welcome to Helix</h1>
          <p className={styles.brandText}>
            Secure, password-less access. Enter your email to receive a
            verification code.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className={styles.formSide}>
        <div className={styles.formCard}>
          {/* HEADER */}
          <div className={styles.header}>
            <h2 className={styles.title}>
              {step === 1 ? "Sign in to Helix" : "Check your email"}
            </h2>
            <p className={styles.subtitle}>
              {step === 1
                ? "We'll send a 6-digit code to your email."
                : `We sent a code to ${email}`}
            </p>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* STEP 1: EMAIL FORM */}
          {step === 1 && (
            <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label className={formStyles.label}>Email address</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className={`${formStyles.input} pl-10`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={loading}>
                Send Code
              </Button>
            </form>
          )}

          {/* STEP 2: OTP FORM */}
          {step === 2 && (
            <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-center text-sm font-medium text-gray-700 mb-4">
                  Enter the 6-digit code
                </label>
                <OtpInput
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={loading}
                disabled={otp.length !== 6}
              >
                Verify & Sign In
              </Button>

              {/* RESEND LOGIC */}
              <div className="text-center">
                {timeLeft > 0 ? (
                  <p className={styles.timer}>
                    Resend code in{" "}
                    <span className="text-gray-900 font-bold">
                      00:{timeLeft.toString().padStart(2, "0")}
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="flex items-center justify-center gap-2 mx-auto text-sm font-medium text-primary hover:text-indigo-500"
                  >
                    <RefreshCw size={16} /> Resend Code
                  </button>
                )}
              </div>

              {/* GO BACK */}
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1"
              >
                <ArrowLeft size={16} /> Change email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
