import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CHRONIC_CONDITIONS } from "../../../constants/onboarding";
import API from "../../../services/api";
import { useAuthStore } from "../../../store/authStore";

const SUB_STEPS = {
  CHRONIC: 0,
  SURGERIES: 1,
  REPRODUCTIVE: 2,
  LIFESTYLE: 3,
};

export const HealthForm = () => {
  const navigate = useNavigate();
  const { user, updateUserStep } = useAuthStore();

  // Determine role from user data
  const role = user?.gender === "MAN" ? "donor" : "recipient";

  const [subStep, setSubStep] = useState(SUB_STEPS.CHRONIC);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    chronicConditions: [],
    otherChronicCondition: "",
    hasMajorSurgeries: null,
    surgeryDetails: "",
    hasAllergies: null,
    allergyDetails: "",
    cmvStatus: null,
    hasPrescriptionMeds: null,
    prescriptionMedsList: "",
    hasMentalHealthCondition: null,
    mentalHealthDetails: "",
    hasBiologicalChildren: null,
    hasReproductiveIssues: null,
    hasRegularCycles: null,
    hasBeenPregnant: null,
    hasTestedPositiveHIVHep: null,
    hasUsedNeedles: null,
    hasReceivedTransfusion: null,
    hasTraveledMalariaRisk: null,
    hasTraveledZikaRisk: null,
  });

  // Fetch existing health data on mount
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        setIsLoading(true);
        const { data } = await API.get("/user/profile/stage-3/health");

        if (data?.data) {
          const h = data.data;

          // Map backend fields to frontend state
          const conditions = [];
          if (h.hasDiabetes) conditions.push("DIABETES");
          if (h.hasHeartCondition) conditions.push("HEART_CONDITION");
          if (h.hasAutoimmune) conditions.push("AUTOIMMUNE");
          if (h.hasCancer) conditions.push("CANCER");
          if (h.hasNeuroDisorder) conditions.push("NEUROLOGICAL");
          if (h.hasRespiratory) conditions.push("RESPIRATORY");
          if (h.otherConditions) conditions.push("OTHER");

          setFormData({
            chronicConditions: conditions,
            otherChronicCondition: h.otherConditions || "",
            hasMajorSurgeries: h.majorSurgeries
              ? true
              : h.majorSurgeries === null
              ? null
              : false,
            surgeryDetails: h.majorSurgeries || "",
            hasAllergies: h.allergies,
            allergyDetails: h.allergiesDetails || "",
            cmvStatus: h.cmvStatus || null,
            hasPrescriptionMeds: h.medications
              ? true
              : h.medications === null
              ? null
              : false,
            prescriptionMedsList: h.medications || "",
            hasMentalHealthCondition: h.mentalHealthHistory
              ? true
              : h.mentalHealthHistory === null
              ? null
              : false,
            mentalHealthDetails: h.mentalHealthHistory || "",
            hasBiologicalChildren: h.biologicalChildren,
            hasReproductiveIssues: h.reproductiveIssues,
            hasRegularCycles: h.menstrualRegularity,
            hasBeenPregnant: h.pregnancyHistory,
            hasTestedPositiveHIVHep: h.hivHepStatus,
            hasUsedNeedles: h.needleUsage,
            hasReceivedTransfusion: h.transfusionHistory,
            hasTraveledMalariaRisk: h.malariaRisk,
            hasTraveledZikaRisk: h.zikaRisk,
          });
        }
      } catch (err) {
        console.error("Failed to fetch health data:", err);
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

  const handleConditionToggle = (id) => {
    setFormData((prev) => {
      const exists = prev.chronicConditions.includes(id);
      return {
        ...prev,
        chronicConditions: exists
          ? prev.chronicConditions.filter((c) => c !== id)
          : [...prev.chronicConditions, id],
      };
    });
  };

  const handleNext = async () => {
    setError(null);

    if (subStep < SUB_STEPS.LIFESTYLE) {
      setSubStep(subStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Build payload matching backend UserHealth schema
      const payload = {
        // Chronic conditions as individual booleans
        hasDiabetes: formData.chronicConditions.includes("DIABETES"),
        hasHeartCondition:
          formData.chronicConditions.includes("HEART_CONDITION"),
        hasAutoimmune: formData.chronicConditions.includes("AUTOIMMUNE"),
        hasCancer: formData.chronicConditions.includes("CANCER"),
        hasNeuroDisorder: formData.chronicConditions.includes("NEUROLOGICAL"),
        hasRespiratory: formData.chronicConditions.includes("RESPIRATORY"),
        otherConditions: formData.chronicConditions.includes("OTHER")
          ? formData.otherChronicCondition
          : null,

        // Surgeries & Medications
        majorSurgeries: formData.hasMajorSurgeries
          ? formData.surgeryDetails
          : null,
        allergies: formData.hasAllergies || false,
        allergiesDetails: formData.hasAllergies
          ? formData.allergyDetails
          : null,
        cmvStatus: formData.cmvStatus,
        medications: formData.hasPrescriptionMeds
          ? formData.prescriptionMedsList
          : null,

        // Mental & Reproductive Health
        mentalHealthHistory: formData.hasMentalHealthCondition
          ? formData.mentalHealthDetails
          : null,
        biologicalChildren: formData.hasBiologicalChildren || false,
        reproductiveIssues: formData.hasReproductiveIssues || false,
        menstrualRegularity: formData.hasRegularCycles,
        pregnancyHistory: formData.hasBeenPregnant,

        // Lifestyle & Travel Risk
        hivHepStatus: formData.hasTestedPositiveHIVHep || false,
        needleUsage: formData.hasUsedNeedles || false,
        transfusionHistory: formData.hasReceivedTransfusion || false,
        malariaRisk: formData.hasTraveledMalariaRisk || false,
        zikaRisk: formData.hasTraveledZikaRisk || false,

        // Mark stage as complete
        isComplete: true,
      };

      await API.post("/user/profile/stage-3/health", payload);

      // Update local auth store
      updateUserStep(3);

      // Navigate to next stage
      navigate("/onboarding/genetic");
    } catch (err) {
      console.error("Failed to save health data:", err);
      setError(
        err.response?.data?.message || "Failed to save. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setError(null);

    if (subStep > 0) {
      setSubStep(subStep - 1);
    } else {
      navigate("/onboarding/background");
    }
  };

  // Reusable radio group component
  const renderRadioGroup = (label, value, onChange, yesDetails = null) => (
    <div className="mb-6 animate-fade-in">
      <p className="text-gray-700 font-medium mb-3 text-sm">{label}</p>
      <div className="flex gap-6 mb-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value === true}
            onChange={() => onChange(true)}
            className="w-5 h-5 text-[#483d8b] border-gray-300 focus:ring-[#483d8b]"
          />
          <span className="text-gray-600">Yes</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value === false}
            onChange={() => onChange(false)}
            className="w-5 h-5 text-[#483d8b] border-gray-300 focus:ring-[#483d8b]"
          />
          <span className="text-gray-600">No</span>
        </label>
      </div>
      {value === true && yesDetails && (
        <textarea
          placeholder={yesDetails.placeholder || "Please specify"}
          value={yesDetails.value}
          onChange={(e) => yesDetails.onChange(e.target.value)}
          className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-1 focus:ring-[#483d8b] outline-none text-sm resize-none h-24"
        />
      )}
    </div>
  );

  // Calculate progress within this stage
  const stageProgress = ((subStep + 1) / 4) * 100;

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
      {/* Privacy Popup Overlay */}
      {showPrivacyPopup && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Privacy</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              All your medical information will always be kept private to you,
              and won't be publicly visible.
            </p>
            <button
              onClick={() => setShowPrivacyPopup(false)}
              className="w-full py-3 bg-[#483d8b] text-white rounded-full font-semibold"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Header with Progress */}
      <div className="pt-6 px-6">
        <div className="w-full bg-gray-200 h-1 mb-6">
          <div
            className="bg-[#483d8b] h-1 transition-all duration-300"
            style={{ width: `${stageProgress}%` }}
          ></div>
        </div>
        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
          Stage 3 of 6 • Step {subStep + 1} of 4
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 px-6 pb-24 overflow-y-auto">
        {/* SUB-STEP 1: CHRONIC CONDITIONS */}
        {subStep === SUB_STEPS.CHRONIC && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Personal Health History
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Please answer the following questions about your personal medical
              history.
            </p>

            {/* Privacy Toggle Row */}
            <div className="flex items-center gap-2 mb-8">
              <span className="text-gray-700 font-medium text-sm">
                Always Private
              </span>
              <div
                className="relative inline-block w-10 h-6 transition duration-200 ease-in-out bg-[#483d8b] rounded-full cursor-pointer"
                onClick={() => setShowPrivacyPopup(true)}
              >
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></span>
              </div>
            </div>

            <p className="font-medium text-gray-800 mb-4 text-sm">
              Have you ever been diagnosed with any chronic conditions?
            </p>

            <div className="space-y-4">
              {CHRONIC_CONDITIONS.map((cond) => (
                <div key={cond.id}>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div
                      className={`w-6 h-6 rounded border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                        formData.chronicConditions.includes(cond.id)
                          ? "bg-[#483d8b] border-[#483d8b]"
                          : "border-gray-300 group-hover:border-gray-400"
                      }`}
                    >
                      {formData.chronicConditions.includes(cond.id) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.chronicConditions.includes(cond.id)}
                      onChange={() => handleConditionToggle(cond.id)}
                    />
                    <span className="text-gray-600 text-sm leading-snug">
                      {cond.label}
                    </span>
                  </label>

                  {/* "Other" Text Input */}
                  {cond.id === "OTHER" &&
                    formData.chronicConditions.includes("OTHER") && (
                      <input
                        type="text"
                        placeholder="Please Specify"
                        value={formData.otherChronicCondition}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            otherChronicCondition: e.target.value,
                          })
                        }
                        className="mt-3 w-full p-4 bg-gray-50 rounded-xl border-none outline-none text-sm focus:ring-1 focus:ring-[#483d8b]"
                      />
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-STEP 2: SURGERIES & MEDICATIONS */}
        {subStep === SUB_STEPS.SURGERIES && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Medical History
            </h1>

            {renderRadioGroup(
              "Have you had any major surgeries?",
              formData.hasMajorSurgeries,
              (val) => setFormData({ ...formData, hasMajorSurgeries: val }),
              {
                placeholder: "Please describe the surgeries",
                value: formData.surgeryDetails,
                onChange: (v) =>
                  setFormData({ ...formData, surgeryDetails: v }),
              }
            )}

            {renderRadioGroup(
              "Do you have any known allergies?",
              formData.hasAllergies,
              (val) => setFormData({ ...formData, hasAllergies: val }),
              {
                placeholder: "Please list your allergies",
                value: formData.allergyDetails,
                onChange: (v) =>
                  setFormData({ ...formData, allergyDetails: v }),
              }
            )}

            <div className="mb-6">
              <p className="text-gray-700 font-medium mb-3 text-sm">
                What is your CMV Status?
              </p>
              <div className="flex gap-4 flex-wrap">
                {[
                  { label: "Positive", value: "POSITIVE" },
                  { label: "Negative", value: "NEGATIVE" },
                  { label: "Not Sure", value: "NOT_SURE" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="cmvStatus"
                      checked={formData.cmvStatus === opt.value}
                      onChange={() =>
                        setFormData({ ...formData, cmvStatus: opt.value })
                      }
                      className="w-5 h-5 text-[#483d8b] focus:ring-[#483d8b]"
                    />
                    <span className="text-gray-600 text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {renderRadioGroup(
              "Are you currently taking any prescription medications?",
              formData.hasPrescriptionMeds,
              (val) => setFormData({ ...formData, hasPrescriptionMeds: val }),
              {
                placeholder: "Please list your medications",
                value: formData.prescriptionMedsList,
                onChange: (v) =>
                  setFormData({ ...formData, prescriptionMedsList: v }),
              }
            )}
          </div>
        )}

        {/* SUB-STEP 3: REPRODUCTIVE & MENTAL HEALTH */}
        {subStep === SUB_STEPS.REPRODUCTIVE && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Mental & Reproductive Health
            </h1>

            {renderRadioGroup(
              "Have you ever been diagnosed with a mental health condition?",
              formData.hasMentalHealthCondition,
              (val) =>
                setFormData({ ...formData, hasMentalHealthCondition: val }),
              {
                placeholder: "Please describe the condition(s)",
                value: formData.mentalHealthDetails,
                onChange: (v) =>
                  setFormData({ ...formData, mentalHealthDetails: v }),
              }
            )}

            {/* Male-specific questions */}
            {role === "donor" && (
              <>
                {renderRadioGroup(
                  "Have you fathered any children (biologically)?",
                  formData.hasBiologicalChildren,
                  (v) => setFormData({ ...formData, hasBiologicalChildren: v })
                )}
                {renderRadioGroup(
                  "Have you been diagnosed with any reproductive health issues?",
                  formData.hasReproductiveIssues,
                  (v) => setFormData({ ...formData, hasReproductiveIssues: v })
                )}
              </>
            )}

            {/* Female-specific questions */}
            {role !== "donor" && (
              <>
                {renderRadioGroup(
                  "Are your menstrual cycles regular?",
                  formData.hasRegularCycles,
                  (v) => setFormData({ ...formData, hasRegularCycles: v })
                )}
                {renderRadioGroup(
                  "Have you ever been pregnant or given birth?",
                  formData.hasBeenPregnant,
                  (v) => setFormData({ ...formData, hasBeenPregnant: v })
                )}
              </>
            )}
          </div>
        )}

        {/* SUB-STEP 4: LIFESTYLE & TRAVEL */}
        {subStep === SUB_STEPS.LIFESTYLE && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Lifestyle & Travel History
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Standard screening questions for safety compliance.
            </p>

            <div className="space-y-1">
              {renderRadioGroup(
                "Have you ever tested positive for HIV, Hepatitis B, or Hepatitis C?",
                formData.hasTestedPositiveHIVHep,
                (v) => setFormData({ ...formData, hasTestedPositiveHIVHep: v })
              )}
              {renderRadioGroup(
                "Have you ever used a needle for non-prescribed substances?",
                formData.hasUsedNeedles,
                (v) => setFormData({ ...formData, hasUsedNeedles: v })
              )}
              {renderRadioGroup(
                "Have you received a blood transfusion or organ transplant?",
                formData.hasReceivedTransfusion,
                (v) => setFormData({ ...formData, hasReceivedTransfusion: v })
              )}
              {renderRadioGroup(
                "Have you traveled to a malaria-risk area in the last 3 years?",
                formData.hasTraveledMalariaRisk,
                (v) => setFormData({ ...formData, hasTraveledMalariaRisk: v })
              )}
              {renderRadioGroup(
                "Have you traveled to a Zika-risk area in the last 6 months?",
                formData.hasTraveledZikaRisk,
                (v) => setFormData({ ...formData, hasTraveledZikaRisk: v })
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 bg-white flex justify-between items-center shadow-lg border-t">
        <button
          onClick={handleBack}
          className="px-8 py-3 rounded-full border border-[#483d8b] text-[#483d8b] font-semibold disabled:opacity-50"
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="px-8 py-3 rounded-full bg-[#483d8b] text-white font-semibold shadow-lg disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : subStep === SUB_STEPS.LIFESTYLE
            ? "Complete Stage 3"
            : "Continue"}
        </button>
      </footer>
    </div>
  );
};

export default HealthForm;
