import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CHRONIC_CONDITIONS } from "../../../constants/onboarding";
import API from "../../../services/api";
import { useAuthStore } from "../../../store/authStore";
import { formStyles as styles } from "../../../styles/onboarding";

export const HealthForm = () => {
  const navigate = useNavigate();
  const { user, updateUserStep } = useAuthStore();
  const role = user?.gender === "MAN" ? "donor" : "recipient";

  // --- State Management ---
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Consolidated Form State
  const [formData, setFormData] = useState({
    // 1. Chronic Conditions
    chronicConditions: [],
    otherChronicCondition: "",

    // 2. Medical History
    hasMajorSurgeries: null,
    surgeryDetails: "",

    hasAllergies: null,
    // Note: Per your request, Allergies is just Yes/No in the UI sequence,
    // unlike Surgeries/Meds which have text inputs.

    cmvStatus: null,

    hasPrescriptionMeds: null,
    prescriptionMedsList: "",

    // 3. Mental Health
    hasMentalHealthCondition: null,
    mentalHealthDetails: "",

    // 4. Reproductive (Role Based)
    hasBiologicalChildren: null,
    hasReproductiveIssues: null, // Male
    hasRegularCycles: null, // Female
    hasBeenPregnant: null, // Female
    hasReproductiveConds: null, // Female

    // 5. Lifestyle (Kept for backend compatibility, though strictly not in your text sequence list)
    hasTestedPositiveHIVHep: null,
    hasUsedNeedles: null,
    hasReceivedTransfusion: null,
    hasTraveledMalariaRisk: null,
    hasTraveledZikaRisk: null,
  });

  // --- Data Fetching ---
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        setIsLoading(true);
        const { data } = await API.get("/user/profile/stage-3/health");

        if (data?.data) {
          const h = data.data;

          // Map Chronic Conditions from DB
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

            // Surgeries (DB string -> UI Boolean + String)
            hasMajorSurgeries: !!h.majorSurgeries,
            surgeryDetails: h.majorSurgeries || "",

            // Allergies
            hasAllergies: h.allergies,

            cmvStatus: h.cmvStatus || null,

            // Meds
            hasPrescriptionMeds: !!h.medications,
            prescriptionMedsList: h.medications || "",

            // Mental Health
            hasMentalHealthCondition: !!h.mentalHealthHistory,
            mentalHealthDetails: h.mentalHealthHistory || "",

            // Reproductive
            hasBiologicalChildren: h.biologicalChildren,
            hasReproductiveIssues: h.reproductiveIssues,
            hasRegularCycles: h.menstrualRegularity,
            hasBeenPregnant: h.pregnancyHistory,
            hasReproductiveConds: h.reproductiveConds,

            // Lifestyle
            hasTestedPositiveHIVHep: h.hivHepStatus,
            hasUsedNeedles: h.needleUsage,
            hasReceivedTransfusion: h.transfusionHistory,
            hasTraveledMalariaRisk: h.malariaRisk,
            hasTraveledZikaRisk: h.zikaRisk,
          });
        }
      } catch (err) {
        if (err.response?.status !== 404) setError("Failed to load saved data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExistingData();
  }, []);

  // --- Handlers ---

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

  const handlePrivacyToggle = () => {
    // Logic: If toggled (True), display Popup
    setShowPrivacyPopup(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        // Chronic
        diabetes: formData.chronicConditions.includes("DIABETES"),
        heart: formData.chronicConditions.includes("HEART_CONDITION"),
        autoimmune: formData.chronicConditions.includes("AUTOIMMUNE"),
        cancer: formData.chronicConditions.includes("CANCER"),
        neuroDisorder: formData.chronicConditions.includes("NEUROLOGICAL"),
        respiratory: formData.chronicConditions.includes("RESPIRATORY"),
        otherConditions: formData.chronicConditions.includes("OTHER")
          ? formData.otherChronicCondition
          : null,

        // Medical History
        // Logic: "others are string where If selected Yes" -> Send string if Yes, else null
        majorSurgeries: formData.hasMajorSurgeries
          ? formData.surgeryDetails
          : null,
        allergies: formData.hasAllergies || false,
        cmvStatus: formData.cmvStatus,
        medications: formData.hasPrescriptionMeds
          ? formData.prescriptionMedsList
          : null,
        mentalHealth: formData.hasMentalHealthCondition
          ? formData.mentalHealthDetails
          : null,

        // Reproductive
        biologicalChildren: formData.hasBiologicalChildren || false,
        reproductiveIssues: formData.hasReproductiveIssues || false,
        menstrualRegularity: formData.hasRegularCycles,
        pregnancyHistory: formData.hasBeenPregnant,
        reproductiveConds: formData.hasReproductiveConds || false,

        // Lifestyle (Required by backend schema)
        hivStatus: formData.hasTestedPositiveHIVHep || false,
        needleUsage: formData.hasUsedNeedles || false,
        transfusionHistory: formData.hasReceivedTransfusion || false,
        malariaRisk: formData.hasTraveledMalariaRisk || false,
        zikaRisk: formData.hasTraveledZikaRisk || false,

        isComplete: true,
      };

      await API.post("/user/profile/stage-3/health", payload);
      updateUserStep(3);
      navigate("/onboarding/genetic");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingIcon}></div>
      </div>
    );
  }

  // --- Helper Component for Radio Groups ---
  const RenderRadioGroup = ({ label, value, onChange, yesDetails = null }) => (
    <div className={styles.radioGroupContainer}>
      <p className={styles.radioGroupLabel}>{label}</p>
      <div className={styles.radioOptionsWrapper}>
        <label className={styles.radioLabel}>
          <input
            type="radio"
            checked={value === true}
            onChange={() => onChange(true)}
            className={styles.radioInput}
          />
          <span className={styles.radioText}>Yes</span>
        </label>
        <label className={styles.radioLabel}>
          <input
            type="radio"
            checked={value === false}
            onChange={() => onChange(false)}
            className={styles.radioInput}
          />
          <span className={styles.radioText}>No</span>
        </label>
      </div>

      {/* Conditional Text Area: Displays ONLY if Yes is selected AND details config exists */}
      {value === true && yesDetails && (
        <div className="mt-3 w-full animate-fade-in">
          <textarea
            placeholder={yesDetails.placeholder}
            value={yesDetails.value}
            onChange={(e) => yesDetails.onChange(e.target.value)}
            className={styles.textArea}
            rows={3}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      {/* Privacy Popup */}
      {showPrivacyPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContainer}>
            <h3 className={styles.popupTitle}>Privacy</h3>
            <p className={styles.popupText}>
              All your medical information will always be kept private to you,
              and won't be publicly visible.
            </p>
            <button
              onClick={() => setShowPrivacyPopup(false)}
              className={styles.popupButton}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.progressBarContainer}>
          <div
            className="bg-primary h-full transition-all duration-300"
            style={styles.progressBarFill(50)}
          />
        </div>
        <p className={styles.sectionLabel}>
          Stage 3 of 6 • Personal Health History
        </p>
      </div>

      {/* Error Box */}
      {error && (
        <div className="w-full max-w-lg mx-auto px-6 mt-4">
          <div className={styles.errorBox}>{error}</div>
        </div>
      )}

      {/* Main Content: Single Scrollable Area */}
      <main className={styles.contentContainer}>
        <h1 className={styles.heading}>Personal Health History</h1>
        <p className={styles.subHeading}>
          Please answer the following questions about your personal medical
          history.
        </p>

        {/* --- Privacy Toggle --- */}
        <div className={styles.privacyWrapper}>
          <span className={styles.privacyLabel}>Always Private</span>
          <div
            className={styles.privacySwitchBase}
            onClick={handlePrivacyToggle}
          >
            <span
              className={`${styles.privacySwitchKnob} translate-x-0`}
            ></span>
          </div>
        </div>

        {/* --- 1. Chronic Conditions --- */}
        <div className="mb-8">
          <p className="font-medium text-gray-800 mb-4 text-sm">
            Have you ever been diagnosed by a doctor with any of the following
            chronic conditions?
          </p>

          <div className="space-y-4">
            {CHRONIC_CONDITIONS.map((cond) => (
              <div key={cond.id}>
                <label className={styles.checkboxLabel}>
                  <div
                    className={styles.checkboxBox(
                      formData.chronicConditions.includes(cond.id)
                    )}
                  >
                    {formData.chronicConditions.includes(cond.id) && (
                      <span className={styles.checkboxCheck}>✓</span>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={formData.chronicConditions.includes(cond.id)}
                    onChange={() => handleConditionToggle(cond.id)}
                  />
                  <span className={styles.checkboxText}>{cond.label}</span>
                </label>

                {/* Conditional "Please Specify" for Other */}
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
                      className={`${styles.inputField} mt-3 ml-1`}
                    />
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* --- 2. Surgeries --- */}
        <RenderRadioGroup
          label="Have you had any major surgeries?"
          value={formData.hasMajorSurgeries}
          onChange={(val) =>
            setFormData({ ...formData, hasMajorSurgeries: val })
          }
          yesDetails={{
            placeholder: "Please Specify",
            value: formData.surgeryDetails,
            onChange: (v) => setFormData({ ...formData, surgeryDetails: v }),
          }}
        />

        {/* --- 3. Allergies (No text area per request) --- */}
        <RenderRadioGroup
          label="Do you have any known allergies (medications, food, environmental)?"
          value={formData.hasAllergies}
          onChange={(val) => setFormData({ ...formData, hasAllergies: val })}
        />

        {/* --- 4. CMV Status --- */}
        <div className="mb-6">
          <p className={styles.radioGroupLabel}>What is your CMV Status?</p>
          <div className={styles.toggleContainer}>
            {[
              { label: "Positive", value: "POSITIVE" },
              { label: "Negative", value: "NEGATIVE" },
              { label: "Not Sure", value: "NOT_SURE" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, cmvStatus: opt.value })
                }
                className={styles.toggleButton(
                  formData.cmvStatus === opt.value
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- 5. Prescription Medications --- */}
        <RenderRadioGroup
          label="Are you currently taking any prescription medications?"
          value={formData.hasPrescriptionMeds}
          onChange={(val) =>
            setFormData({ ...formData, hasPrescriptionMeds: val })
          }
          yesDetails={{
            placeholder: "Please list them",
            value: formData.prescriptionMedsList,
            onChange: (v) =>
              setFormData({ ...formData, prescriptionMedsList: v }),
          }}
        />

        {/* --- 6. Mental Health --- */}
        <RenderRadioGroup
          label="Have you ever been diagnosed with or received treatment for a significant mental health condition (e.g., depression, anxiety disorder, bipolar disorder, schizophrenia)?"
          value={formData.hasMentalHealthCondition}
          onChange={(val) =>
            setFormData({ ...formData, hasMentalHealthCondition: val })
          }
          yesDetails={{
            placeholder: "Please specify the condition",
            value: formData.mentalHealthDetails,
            onChange: (v) =>
              setFormData({ ...formData, mentalHealthDetails: v }),
          }}
        />

        {/* --- 7. Reproductive Questions (Role Based) --- */}
        <div className="mt-4">
          {role === "donor" ? (
            /* Male / Sperm Donor Flow */
            <>
              <RenderRadioGroup
                label="Have you fathered any children (biologically)?"
                value={formData.hasBiologicalChildren}
                onChange={(v) =>
                  setFormData({ ...formData, hasBiologicalChildren: v })
                }
              />
              <RenderRadioGroup
                label="Have you ever been diagnosed with any reproductive health issues (e.g., low sperm count, varicocele)?"
                value={formData.hasReproductiveIssues}
                onChange={(v) =>
                  setFormData({ ...formData, hasReproductiveIssues: v })
                }
              />
            </>
          ) : (
            /* Female / Egg Donor Flow */
            <>
              <RenderRadioGroup
                label="Are your menstrual cycles regular?"
                value={formData.hasRegularCycles}
                onChange={(v) =>
                  setFormData({ ...formData, hasRegularCycles: v })
                }
              />
              <RenderRadioGroup
                label="Have you ever been pregnant or given birth?"
                value={formData.hasBeenPregnant}
                onChange={(v) =>
                  setFormData({ ...formData, hasBeenPregnant: v })
                }
              />
              <RenderRadioGroup
                label="Have you ever been diagnosed with any reproductive health conditions (e.g., PCOS, endometriosis, fibroids)?"
                value={formData.hasReproductiveConds}
                onChange={(v) =>
                  setFormData({ ...formData, hasReproductiveConds: v })
                }
              />
            </>
          )}
        </div>

        {/* --- 8. Lifestyle (Backend Compatibility) --- */}
        {/* These ensure the data payload is complete for the backend validation */}
        <div className="mt-4 space-y-1">
          <RenderRadioGroup
            label="Have you ever tested positive for HIV, Hepatitis B, or Hepatitis C?"
            value={formData.hasTestedPositiveHIVHep}
            onChange={(v) =>
              setFormData({ ...formData, hasTestedPositiveHIVHep: v })
            }
          />
          <RenderRadioGroup
            label="Have you ever used a needle to take a drug, steroid, or anything not prescribed by a doctor?"
            value={formData.hasUsedNeedles}
            onChange={(v) => setFormData({ ...formData, hasUsedNeedles: v })}
          />
          <RenderRadioGroup
            label="Have you received a blood transfusion or organ transplant?"
            value={formData.hasReceivedTransfusion}
            onChange={(v) =>
              setFormData({ ...formData, hasReceivedTransfusion: v })
            }
          />
          <RenderRadioGroup
            label="In the last 3 years, have you traveled to an area with a known risk for malaria?"
            value={formData.hasTraveledMalariaRisk}
            onChange={(v) =>
              setFormData({ ...formData, hasTraveledMalariaRisk: v })
            }
          />
          <RenderRadioGroup
            label="In the last 6 months, have you traveled to or resided in an area with a known risk for Zika virus transmission?"
            value={formData.hasTraveledZikaRisk}
            onChange={(v) =>
              setFormData({ ...formData, hasTraveledZikaRisk: v })
            }
          />
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <button
            onClick={() => navigate("/onboarding/background")}
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

export default HealthForm;
