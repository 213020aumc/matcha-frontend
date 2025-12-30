import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { authStyles as styles } from "../../styles/auth";

export const Login = () => {
  const navigate = useNavigate();
  const { login, verifyOtp, isAuthenticated, user, isAdmin } = useAuthStore();

  // State
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");

  // OTP State: Array of 6 strings
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Timer State
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // --- Redirect Logic ---
  useEffect(() => {
    if (isAuthenticated && user && !isRedirecting) {
      handleRedirect(user);
    }
  }, [isAuthenticated, user, isRedirecting]);

  // --- Timer Logic ---
  useEffect(() => {
    let interval;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleRedirect = (userData) => {
    setIsRedirecting(true);

    if (isAdmin()) {
      navigate("/admin", { replace: true });
      return;
    }

    if (!userData?.termsAccepted || !userData?.role) {
      navigate("/onboarding/initial", { replace: true });
      return;
    }

    const profileStatus = userData?.profileStatus;
    const onboardingStep = userData?.onboardingStep || 0;

    if (["PENDING_REVIEW", "ACTIVE", "REJECTED"].includes(profileStatus)) {
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

  // --- Handlers ---

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email);
      setStep("otp");
      setTimer(30); // Reset timer
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) return;

    setError("");
    setIsLoading(true);
    setIsRedirecting(true);

    try {
      const result = await verifyOtp(email, otpValue);
      const userData = result.data?.user;

      if (userData) {
        setTimeout(() => handleRedirect(userData), 100);
      } else {
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

  // --- OTP Input Logic ---
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    // Handle Backspace
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return; // Only numbers

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus appropriate box
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex].focus();
  };

  // --- Loading View ---
  if (isRedirecting && isAuthenticated) {
    return (
      <div className={styles.loadingContainer}>
        <div className="text-center">
          <div className={styles.loadingSpinner}></div>
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* LEFT SIDE: BRANDING */}
      <div className={styles.brandSection}>
        <div className={styles.brandOverlay} />
        <div className={styles.brandContent}>
          <h1 className={styles.brandTitle}>Welcome to Helix</h1>
          <p className={styles.brandText}>
            Secure, password-less access. Enter your email to receive a
            verification code.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className={styles.formSection}>
        <div className={styles.card}>
          <div className="text-center">
            <h2 className={styles.headerTitle}>
              {step === "email" ? "Sign in to Helix" : "Check your email"}
            </h2>
            <p className={styles.headerSubtitle}>
              {step === "email"
                ? "We'll send a 6-digit code to your email."
                : `We sent a code to ${email}`}
            </p>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          {step === "email" ? (
            <form onSubmit={handleSendOtp} className={styles.formGroup}>
              <div>
                <label className={styles.inputLabel}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={styles.inputField}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !email}
                className={styles.primaryButton}
              >
                {isLoading ? "Sending..." : "Continue with Email"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className={styles.formGroup}>
              <div>
                <label className={styles.inputLabel}>Enter 6-Digit Code</label>

                {/* 6-Digit Boxes */}
                <div className={styles.otpContainer}>
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      ref={(el) => (inputRefs.current[index] = el)}
                      value={data}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className={styles.otpInput}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.join("").length !== 6}
                className={styles.primaryButton}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>

              {/* Resend Timer */}
              <div className={styles.resendContainer}>
                <span className={styles.resendText}>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={canResend ? handleSendOtp : undefined}
                  disabled={!canResend}
                  className={styles.resendLink(!canResend)}
                >
                  {canResend ? "Resend Email" : `Resend in ${timer}s`}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp(new Array(6).fill(""));
                  setError("");
                }}
                className={styles.secondaryButton}
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
