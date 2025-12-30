import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import { useAuthStore } from "../../../store/authStore";
import { formStyles as styles } from "../../../styles/onboarding";

export const CompensationForm = () => {
  const navigate = useNavigate();
  const { updateUserStep } = useAuthStore();

  const [isInterested, setIsInterested] = useState(false);
  const [askingAmount, setAskingAmount] = useState("");
  const [allowBidding, setAllowBidding] = useState(false);
  const [minAccepted, setMinAccepted] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        setIsLoading(true);
        const { data } = await API.get("/user/profile/stage-5/compensation");

        if (data?.data) {
          const c = data.data;
          setIsInterested(c.isInterested || false);
          setAllowBidding(c.allowBidding || false);
          setAskingAmount(c.askingPrice?.toString() || "");
          setMinAccepted(c.minAcceptedPrice?.toString() || "");
          setBuyNowPrice(c.buyNowPrice?.toString() || "");
        }
      } catch (err) {
        console.error("Failed to fetch compensation data:", err);
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
  const handleSubmit = async () => {
    // Validation
    if (isInterested && allowBidding && !minAccepted) {
      setError("Minimum accepted price is required when bidding is allowed");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        isInterested: isInterested,
        allowBidding: isInterested ? allowBidding : false,
        askingPrice:
          isInterested && !allowBidding
            ? parseFloat(askingAmount) || null
            : null,
        minAcceptedPrice:
          isInterested && allowBidding ? parseFloat(minAccepted) || null : null,
        buyNowPrice:
          isInterested && allowBidding ? parseFloat(buyNowPrice) || null : null,
        isComplete: true,
      };

      await API.post("/user/profile/stage-5/compensation", payload);

      updateUserStep(5);
      navigate("/onboarding/legal");
    } catch (err) {
      console.error("Failed to save compensation data:", err);
      setError(
        err.response?.data?.message || "Failed to save. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/onboarding/genetic");
  };

  // --- UI Helpers ---
  const CustomToggle = ({ checked, onChange, labelLeft, labelRight }) => (
    <div className={styles.toggleRow}>
      {labelLeft && (
        <span className={styles.toggleLabel(!checked)}>{labelLeft}</span>
      )}
      <div
        className={styles.switchTrack(checked)}
        onClick={() => onChange(!checked)}
      >
        <div className={styles.switchKnob(checked)}></div>
      </div>
      {labelRight && (
        <span className={styles.toggleLabel(checked)}>{labelRight}</span>
      )}
    </div>
  );

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
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.progressBarContainer}>
          <div
            className="bg-primary h-full transition-all duration-300"
            style={styles.progressBarFill(83)} // Stage 5 approx 83%
          ></div>
        </div>
        <p className={styles.sectionLabel}>Stage 5 of 6 • Compensation</p>
      </div>

      {/* Error Box */}
      {error && (
        <div className="w-full max-w-lg mx-auto px-6 mt-4">
          <div className={styles.errorBox}>{error}</div>
        </div>
      )}

      {/* Main Content */}
      <main className={styles.contentContainer}>
        <h1 className={styles.heading}>Donor Compensation</h1>
        <p className={styles.subHeading}>
          Are you interested in being compensated for providing your gametes?
        </p>

        {/* Interested Toggle */}
        <div className="mb-8">
          <CustomToggle
            checked={isInterested}
            onChange={setIsInterested}
            labelLeft="No"
            labelRight="Yes I am Interested"
          />
        </div>

        {/* Dynamic Fields */}
        {isInterested && (
          <div className={styles.biddingSection}>
            {/* Standard Asking Price (No Bidding) */}
            {!allowBidding ? (
              <div>
                <label className={styles.inputLabel}>
                  Asking Compensation ($)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={askingAmount}
                  onChange={(e) => setAskingAmount(e.target.value)}
                  className={styles.inputField}
                />
              </div>
            ) : (
              /* Bidding Enabled Fields */
              <div className="space-y-4">
                <div>
                  <label className={styles.inputLabel}>
                    Minimum Accepted ($){" "}
                    <span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={minAccepted}
                    onChange={(e) => setMinAccepted(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
                <div>
                  <label className={styles.inputLabel}>
                    "Buy Now" Price ($)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={buyNowPrice}
                    onChange={(e) => setBuyNowPrice(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
              </div>
            )}

            {/* Bidding Toggle */}
            <div className={styles.biddingRow}>
              <span className={styles.biddingLabel}>Allow Bidding?</span>
              <CustomToggle checked={allowBidding} onChange={setAllowBidding} />
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className={styles.disclaimerBox}>
          <p>Helix does not provide legal advice.</p>
          <p>Verify compensation legality in your jurisdiction.</p>
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={styles.nextButton}
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CompensationForm;
