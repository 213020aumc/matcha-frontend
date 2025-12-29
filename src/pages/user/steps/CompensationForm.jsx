import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";
import { useAuthStore } from "../../../store/authStore";

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

  // Fetch existing compensation data on mount
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
        // Don't show error for 404 (no data yet)
        if (err.response?.status !== 404) {
          setError("Failed to load saved data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingData();
  }, []);

  const handleSubmit = async () => {
    // Validation
    if (isInterested && allowBidding && !minAccepted) {
      setError("Minimum accepted price is required when bidding is allowed");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Payload matching backend UserCompensation schema
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

      console.log("Stage 5 Complete! Navigating to Stage 6...");
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
    <div className="flex items-center gap-3">
      {labelLeft && (
        <span
          className={`text-sm ${
            !checked ? "font-semibold text-gray-900" : "text-gray-400"
          }`}
        >
          {labelLeft}
        </span>
      )}
      <div
        className={`relative w-12 h-7 rounded-full transition-colors duration-200 cursor-pointer ${
          checked ? "bg-[#483d8b]" : "bg-gray-300"
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "left-6" : "left-1"
          }`}
        ></div>
      </div>
      {labelRight && (
        <span
          className={`text-sm ${
            checked ? "font-semibold text-gray-900" : "text-gray-400"
          }`}
        >
          {labelRight}
        </span>
      )}
    </div>
  );

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
      {/* Header */}
      <div className="pt-6 px-6">
        <div className="w-full bg-gray-200 h-1 mb-6">
          <div className="bg-[#483d8b] h-1 w-5/6 transition-all duration-300"></div>
        </div>
        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
          Stage 5 of 6 • Compensation
        </p>
      </div>

      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <main className="flex-1 px-6 pb-24 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Donor Compensation
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Are you interested in being compensated for providing your gametes?
        </p>

        <div className="mb-8">
          <CustomToggle
            checked={isInterested}
            onChange={setIsInterested}
            labelLeft="No"
            labelRight="Yes I am Interested"
          />
        </div>

        {isInterested && (
          <div className="animate-fade-in space-y-6">
            {!allowBidding ? (
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Asking Compensation ($)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={askingAmount}
                  onChange={(e) => setAskingAmount(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#483d8b]"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Minimum Accepted ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={minAccepted}
                    onChange={(e) => setMinAccepted(e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#483d8b]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    "Buy Now" Price ($)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={buyNowPrice}
                    onChange={(e) => setBuyNowPrice(e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-xl border-none outline-none focus:ring-1 focus:ring-[#483d8b]"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-gray-700 font-medium text-sm">
                Allow Bidding?
              </span>
              <CustomToggle checked={allowBidding} onChange={setAllowBidding} />
            </div>
          </div>
        )}

        <div className="mt-10 text-gray-400 text-xs space-y-2">
          <p>Helix does not provide legal advice.</p>
          <p>Verify compensation legality in your jurisdiction.</p>
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 p-6 bg-white flex justify-between items-center border-t">
        <button
          onClick={handleBack}
          className="px-8 py-3 rounded-full border border-[#483d8b] text-[#483d8b] font-semibold"
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-3 rounded-full bg-[#483d8b] text-white font-semibold shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </footer>
    </div>
  );
};

export default CompensationForm;
