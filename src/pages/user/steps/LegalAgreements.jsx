import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import { useAuthStore } from "../../../store/authStore";

export const LegalAgreements = () => {
  const navigate = useNavigate();
  const { updateUserStep } = useAuthStore();

  const [hasAgreed, setHasAgreed] = useState(false);
  const [anonymity, setAnonymity] = useState("IDENTITY_DISCLOSURE");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch existing legal data on mount
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

  const handleContinue = async () => {
    if (!hasAgreed) {
      setError("Please agree to the Informed Consent document to proceed.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Payload matching backend UserLegal schema
      const payload = {
        consentAgreed: hasAgreed,
        anonymityPreference: anonymity, // 'IDENTITY_DISCLOSURE' or 'ANONYMOUS'
      };

      // This endpoint saves legal and submits for review
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#483d8b]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans relative">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-[#483d8b] mb-6 flex items-center justify-center">
              <span className="text-white text-4xl">✓</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Profile Submitted!
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed px-2">
              Your profile is now under review. We'll notify you once it's
              approved.
            </p>

            <button
              onClick={handleFinalAction}
              className="w-full py-4 bg-[#483d8b] text-white rounded-full font-bold text-lg shadow-xl"
            >
              View Status
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pt-6 px-6">
        <div className="w-full bg-gray-200 h-1 mb-6">
          <div className="bg-[#483d8b] h-1 w-full transition-all duration-300"></div>
        </div>
        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
          Stage 6 of 6 • Legal Agreements
        </p>
      </div>

      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <main className="flex-1 px-6 pb-24 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Legal Agreements
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Please review and agree to complete your profile.
        </p>

        {/* Informed Consent */}
        <div className="mb-8 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div
              className={`mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                hasAgreed ? "bg-[#483d8b] border-[#483d8b]" : "border-gray-300"
              }`}
              onClick={() => setHasAgreed(!hasAgreed)}
            >
              {hasAgreed && (
                <span className="text-white text-xs font-bold">✓</span>
              )}
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={hasAgreed}
              onChange={() => setHasAgreed(!hasAgreed)}
            />
            <div className="text-sm text-gray-700">
              <span>
                I have read and agree to the{" "}
                <strong>Informed Consent for Donation</strong>.
              </span>
              <br />
              <button
                type="button"
                className="text-[#483d8b] underline mt-1 font-medium text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Open consent document modal
                  alert("Consent document would open here");
                }}
              >
                Tap to view document
              </button>
            </div>
          </label>
        </div>

        <hr className="border-gray-100 mb-8" />

        {/* Anonymity Preference */}
        <div className="space-y-6">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
            Anonymity Preference
          </p>

          <label
            className="flex items-start gap-4 cursor-pointer group p-4 rounded-xl border-2 transition-all hover:border-gray-300
            ${anonymity === 'IDENTITY_DISCLOSURE' ? 'border-[#483d8b] bg-[#483d8b]/5' : 'border-gray-200'}"
          >
            <input
              type="radio"
              name="anonymity"
              className="mt-1 w-5 h-5 text-[#483d8b] focus:ring-[#483d8b]"
              checked={anonymity === "IDENTITY_DISCLOSURE"}
              onChange={() => setAnonymity("IDENTITY_DISCLOSURE")}
            />
            <div className="flex-1">
              <span
                className={`block font-semibold mb-1 ${
                  anonymity === "IDENTITY_DISCLOSURE"
                    ? "text-[#483d8b]"
                    : "text-gray-700"
                }`}
              >
                Identity Disclosure
              </span>
              <p className="text-gray-500 text-sm leading-snug">
                I agree to release my identifying information to offspring upon
                their 18th birthday.
              </p>
            </div>
          </label>

          <label
            className="flex items-start gap-4 cursor-pointer group p-4 rounded-xl border-2 transition-all hover:border-gray-300
            ${anonymity === 'ANONYMOUS' ? 'border-[#483d8b] bg-[#483d8b]/5' : 'border-gray-200'}"
          >
            <input
              type="radio"
              name="anonymity"
              className="mt-1 w-5 h-5 text-[#483d8b] focus:ring-[#483d8b]"
              checked={anonymity === "ANONYMOUS"}
              onChange={() => setAnonymity("ANONYMOUS")}
            />
            <div className="flex-1">
              <span
                className={`block font-semibold mb-1 ${
                  anonymity === "ANONYMOUS" ? "text-[#483d8b]" : "text-gray-700"
                }`}
              >
                Anonymous
              </span>
              <p className="text-gray-500 text-sm leading-snug">
                I do not agree to release my identifying information.
              </p>
            </div>
          </label>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl">
          <p className="text-blue-700 text-sm">
            ℹ️ You can change your anonymity preference later from your profile
            settings.
          </p>
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 p-6 bg-white flex justify-between items-center border-t shadow-lg">
        <button
          onClick={handleBack}
          className="px-8 py-3 rounded-full border border-[#483d8b] text-[#483d8b] font-semibold"
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!hasAgreed || isSubmitting}
          className={`px-8 py-3 rounded-full font-semibold shadow-lg transition-all ${
            hasAgreed
              ? "bg-[#483d8b] text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit Profile"}
        </button>
      </footer>
    </div>
  );
};

export default LegalAgreements;
