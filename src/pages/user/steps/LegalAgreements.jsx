import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import { useAuthStore } from "../../../store/authStore";
import { formStyles as styles } from "../../../styles/onboarding";

export const LegalAgreements = () => {
  const navigate = useNavigate();
  const { updateUserStep } = useAuthStore();

  const [hasAgreed, setHasAgreed] = useState(false);
  const [anonymity, setAnonymity] = useState("IDENTITY_DISCLOSURE");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        setIsLoading(true);
        const { data } = await API.get("/user/profile/stage-6/legal");

        if (data?.data) {
          const l = data.data;
          setHasAgreed(l.consentAgreed || false);
          setAnonymity(l.anonymityPreference || "IDENTITY_DISCLOSURE");
        }
      } catch (err) {
        console.error("Failed to fetch legal data:", err);
        if (err.response?.status !== 404) {
          setError("Failed to load saved data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingData();
  }, []);

  // --- Handlers ---
  const handleContinue = async () => {
    if (!hasAgreed) {
      setError("Please agree to the Informed Consent document to proceed.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        consentAgreed: hasAgreed,
        anonymityPreference: anonymity,
      };

      await API.post("/user/profile/stage-6/complete", payload);

      console.log("Profile submitted for review!");
      updateUserStep(6);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to submit profile:", err);
      setError(
        err.response?.data?.message || "Failed to submit. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalAction = () => {
    navigate("/profile/status");
  };

  const handleBack = () => {
    navigate("/onboarding/compensation");
  };

  // --- Loading ---
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingIcon}></div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles.successModalOverlay}>
          <div className={styles.successModalContent}>
            <div className={styles.successIconContainer}>
              <span className={styles.successIcon}>✓</span>
            </div>

            <h2 className={styles.successTitle}>Profile Submitted!</h2>
            <p className={styles.successText}>
              Your profile is now under review. We'll notify you once it's
              approved.
            </p>

            <button
              onClick={handleFinalAction}
              className={styles.successButton}
            >
              View Status
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.progressBarContainer}>
          <div
            className="bg-primary h-full transition-all duration-300"
            style={styles.progressBarFill(100)}
          ></div>
        </div>
        <p className={styles.sectionLabel}>Stage 6 of 6 • Legal Agreements</p>
      </div>

      {/* Error Box */}
      {error && (
        <div className="w-full max-w-lg mx-auto px-6 mt-4">
          <div className={styles.errorBox}>{error}</div>
        </div>
      )}

      {/* Main Content */}
      <main className={styles.contentContainer}>
        <h1 className={styles.heading}>Legal Agreements</h1>
        <p className={styles.subHeading}>
          Please review and agree to complete your profile.
        </p>

        {/* Informed Consent */}
        <div className={styles.consentBox}>
          <label className={styles.consentLabel}>
            <div className={styles.consentCheckCircle(hasAgreed)}>
              {hasAgreed && <span className={styles.consentCheckIcon}>✓</span>}
            </div>

            <input
              type="checkbox"
              className="hidden"
              checked={hasAgreed}
              onChange={() => setHasAgreed(!hasAgreed)}
            />

            <div className={styles.consentText}>
              <span>
                I have read and agree to the{" "}
                <strong>Informed Consent for Donation</strong>.
              </span>
              <br />
              <button
                type="button"
                className={styles.consentLink}
                onClick={(e) => {
                  e.preventDefault();
                  alert("Consent document would open here");
                }}
              >
                Tap to view document
              </button>
            </div>
          </label>
        </div>

        <hr className={styles.divider} />

        {/* Anonymity Preference */}
        <div className={styles.anonymityWrapper}>
          <p className={styles.anonymityLabel}>Anonymity Preference</p>

          {/* Option 1: Disclosure */}
          <label
            className={styles.anonymityCard(
              anonymity === "IDENTITY_DISCLOSURE"
            )}
          >
            <input
              type="radio"
              name="anonymity"
              className={styles.anonymityRadio}
              checked={anonymity === "IDENTITY_DISCLOSURE"}
              onChange={() => setAnonymity("IDENTITY_DISCLOSURE")}
            />
            <div className="flex-1">
              <span
                className={styles.anonymityTitle(
                  anonymity === "IDENTITY_DISCLOSURE"
                )}
              >
                Identity Disclosure
              </span>
              <p className={styles.anonymityDesc}>
                I agree to release my identifying information to offspring upon
                their 18th birthday.
              </p>
            </div>
          </label>

          {/* Option 2: Anonymous */}
          <label className={styles.anonymityCard(anonymity === "ANONYMOUS")}>
            <input
              type="radio"
              name="anonymity"
              className={styles.anonymityRadio}
              checked={anonymity === "ANONYMOUS"}
              onChange={() => setAnonymity("ANONYMOUS")}
            />
            <div className="flex-1">
              <span
                className={styles.anonymityTitle(anonymity === "ANONYMOUS")}
              >
                Anonymous
              </span>
              <p className={styles.anonymityDesc}>
                I do not agree to release my identifying information.
              </p>
            </div>
          </label>
        </div>

        {/* Info Box */}
        <div className={`${styles.fileStatusBox("active")} mt-8`}>
          <p className="text-blue-700 text-sm flex items-center gap-2">
            <span>ℹ️</span>
            You can change your anonymity preference later from your profile
            settings.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <button
            onClick={handleBack}
            className={styles.backButton}
            disabled={isSubmitting}
          >
            Back
          </button>

          <button
            onClick={handleContinue}
            disabled={!hasAgreed || isSubmitting}
            className={styles.submitButton(!hasAgreed || isSubmitting)}
          >
            {isSubmitting ? "Submitting..." : "Submit Profile"}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LegalAgreements;
