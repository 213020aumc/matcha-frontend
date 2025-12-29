import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export const Login = () => {
  const navigate = useNavigate();
  const { login, verifyOtp, isAuthenticated, user, isAdmin } = useAuthStore();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if already authenticated (on page load)
  useEffect(() => {
    if (isAuthenticated && user && !isRedirecting) {
      handleRedirect(user);
    }
  }, [isAuthenticated, user, isRedirecting]);

  const handleRedirect = (userData) => {
    setIsRedirecting(true);

    // Check if admin using the store function
    if (isAdmin()) {
      console.log("User is admin, redirecting to /admin");
      navigate("/admin", { replace: true });
      return;
    }

    // Check if initial onboarding is complete
    if (!userData?.termsAccepted || !userData?.role) {
      navigate("/onboarding/initial", { replace: true });
      return;
    }

    // Check profile status
    const profileStatus = userData?.profileStatus;
    const onboardingStep = userData?.onboardingStep || 0;

    if (profileStatus === "PENDING_REVIEW") {
      navigate("/profile/status", { replace: true });
    } else if (profileStatus === "ACTIVE") {
      navigate("/profile/status", { replace: true });
    } else if (profileStatus === "REJECTED") {
      navigate("/profile/status", { replace: true });
    } else if (onboardingStep >= 6) {
      navigate("/profile/status", { replace: true });
    } else {
      const stepRoutes = {
        0: "/onboarding/basics",
        1: "/onboarding/basics",
        2: "/onboarding/background",
        3: "/onboarding/health",
        4: "/onboarding/genetic",
        5: "/onboarding/compensation",
      };
      navigate(stepRoutes[onboardingStep] || "/onboarding/basics", {
        replace: true,
      });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email);
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setIsRedirecting(true); // Prevent useEffect from triggering redirect

    try {
      const result = await verifyOtp(email, otp);

      // Use the user data from the response directly
      const userData = result.data?.user;

      if (userData) {
        // Small delay to ensure store is updated
        setTimeout(() => {
          handleRedirect(userData);
        }, 100);
      } else {
        // Fallback - redirect to initial onboarding
        navigate("/onboarding/initial", { replace: true });
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.response?.data?.message || "Invalid OTP");
      setIsRedirecting(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading if redirecting
  if (isRedirecting && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT SIDE: BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-600 to-blue-700 opacity-90" />
        <div className="relative z-10 text-white p-12 max-w-lg">
          <h1 className="text-4xl font-bold mb-6">Welcome to Helix</h1>
          <p className="text-lg text-indigo-100 leading-relaxed">
            Secure, password-less access. Enter your email to receive a
            verification code.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-gray-50">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {step === "email" ? "Sign in to Helix" : "Check your email"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === "email"
                ? "We'll send a 6-digit code to your email."
                : `We sent a code to ${email}`}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Continue with Email"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError("");
                }}
                className="w-full py-3 text-gray-600 hover:text-gray-900 transition"
              >
                ← Change Email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
