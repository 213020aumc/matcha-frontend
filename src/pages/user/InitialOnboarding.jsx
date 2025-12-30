import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  GENDER_OPTIONS,
  SERVICE_OPTIONS,
  DONOR_ROLES,
  SURROGACY_ROLES,
  GAMETE_OPTIONS,
  PAIRING_OPTIONS,
} from "../../constants/onboarding";
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";

// IMPORT THE STYLES HERE
import { initialStyles as styles } from "../../styles/onboarding";

// Updated steps
const LOCAL_STEPS = {
  SPLASH: 0,
  GENDER: 1,
  SERVICE: 2,
  DONOR_ROLE: 3,
  SURROGACY_ROLE: 4,
  INTERESTED_IN: 5,
  PAIRING_TYPES: 6,
};

export const InitialOnboarding = () => {
  const navigate = useNavigate();
  const { user, submitOnboarding } = useAuthStore();

  const [step, setStep] = useState(LOCAL_STEPS.SPLASH);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    gender: null,
    serviceType: null,
    role: null,
    interestedIn: null,
    pairingTypes: [],
  });

  // Fetch existing onboarding data
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        setIsLoading(true);
        if (user) {
          const existingData = {
            gender: user.gender || null,
            serviceType: user.serviceType || null,
            role: user.role || null,
            interestedIn: user.interestedIn || null,
            pairingTypes: user.pairingTypes || [],
          };

          if (existingData.gender) {
            setFormData(existingData);

            if (existingData.pairingTypes?.length > 0) {
              navigate("/onboarding/basics");
              return;
            } else if (existingData.interestedIn) {
              setStep(LOCAL_STEPS.PAIRING_TYPES);
            } else if (existingData.role) {
              existingData.serviceType === "DONOR_SERVICES"
                ? setStep(LOCAL_STEPS.INTERESTED_IN)
                : setStep(LOCAL_STEPS.PAIRING_TYPES);
            } else if (existingData.serviceType) {
              existingData.serviceType === "DONOR_SERVICES"
                ? setStep(LOCAL_STEPS.DONOR_ROLE)
                : setStep(LOCAL_STEPS.SURROGACY_ROLE);
            } else {
              setStep(LOCAL_STEPS.SERVICE);
            }
          }
        }
      } catch (err) {
        console.error("Failed to process onboarding data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingData();
  }, [user, navigate]);

  // --- Handlers ---
  const handleSelect = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePairingToggle = (pairingId) => {
    setFormData((prev) => {
      const current = prev.pairingTypes || [];
      if (current.includes(pairingId)) {
        return {
          ...prev,
          pairingTypes: current.filter((id) => id !== pairingId),
        };
      } else {
        return { ...prev, pairingTypes: [...current, pairingId] };
      }
    });
  };

  const handleNext = async () => {
    if (step === LOCAL_STEPS.SPLASH) {
      setStep(LOCAL_STEPS.GENDER);
      return;
    }
    if (step === LOCAL_STEPS.GENDER) {
      if (!formData.gender) return alert("Please select a gender.");
      setStep(LOCAL_STEPS.SERVICE);
      return;
    }
    if (step === LOCAL_STEPS.SERVICE) {
      if (!formData.serviceType) return alert("Please select a service type.");
      formData.serviceType === "DONOR_SERVICES"
        ? setStep(LOCAL_STEPS.DONOR_ROLE)
        : setStep(LOCAL_STEPS.SURROGACY_ROLE);
      return;
    }
    if (step === LOCAL_STEPS.DONOR_ROLE) {
      if (!formData.role) return alert("Please select your role.");
      setStep(LOCAL_STEPS.INTERESTED_IN);
      return;
    }
    if (step === LOCAL_STEPS.SURROGACY_ROLE) {
      if (!formData.role) return alert("Please select your role.");
      setStep(LOCAL_STEPS.PAIRING_TYPES);
      return;
    }
    if (step === LOCAL_STEPS.INTERESTED_IN) {
      if (!formData.interestedIn)
        return alert("Please select what you're interested in.");
      setStep(LOCAL_STEPS.PAIRING_TYPES);
      return;
    }
    if (step === LOCAL_STEPS.PAIRING_TYPES) {
      if (formData.pairingTypes.length === 0)
        return alert("Please select at least one pairing preference.");

      setIsSubmitting(true);
      try {
        await submitOnboarding({
          termsAccepted: true,
          ...formData,
        });
        navigate("/onboarding/basics");
      } catch (error) {
        console.error("Onboarding submission failed:", error);
        alert("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step === LOCAL_STEPS.GENDER) setStep(LOCAL_STEPS.SPLASH);
    else if (step === LOCAL_STEPS.SERVICE) setStep(LOCAL_STEPS.GENDER);
    else if (
      step === LOCAL_STEPS.DONOR_ROLE ||
      step === LOCAL_STEPS.SURROGACY_ROLE
    )
      setStep(LOCAL_STEPS.SERVICE);
    else if (step === LOCAL_STEPS.INTERESTED_IN)
      setStep(LOCAL_STEPS.DONOR_ROLE);
    else if (step === LOCAL_STEPS.PAIRING_TYPES) {
      formData.serviceType === "DONOR_SERVICES"
        ? setStep(LOCAL_STEPS.INTERESTED_IN)
        : setStep(LOCAL_STEPS.SURROGACY_ROLE);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.loadingIcon} />
        <p className="text-gray-500">Loading your progress...</p>
      </div>
    );
  }

  // --- Render: Splash Screen ---
  if (step === LOCAL_STEPS.SPLASH) {
    return (
      <div className={styles.splashContainer}>
        <Sparkles className={styles.splashIcon} />
        <h1 className={styles.splashHeading}>Welcome to Your Journey</h1>
        <p className={styles.splashText}>
          Let's get to know you a little better so we can personalize your
          experience.
        </p>
        <button onClick={handleNext} className={styles.primaryButton}>
          Get Started
        </button>
      </div>
    );
  }

  // --- Render: Step Content ---
  const renderStepContent = () => {
    const renderSection = (title, subtitle, options, key, isMulti = false) => (
      <>
        <h2 className={styles.heading}>{title}</h2>
        <p className={styles.subHeading}>{subtitle}</p>
        <div className="space-y-3">
          {options.map((opt) => (
            <OptionCard
              key={opt.id}
              icon={opt.icon}
              title={opt.label}
              desc={opt.desc}
              isSelected={
                isMulti
                  ? formData[key].includes(opt.id)
                  : formData[key] === opt.id
              }
              onClick={() =>
                isMulti
                  ? handlePairingToggle(opt.id)
                  : handleSelect(key, opt.id)
              }
              isMultiSelect={isMulti}
            />
          ))}
        </div>
      </>
    );

    switch (step) {
      case LOCAL_STEPS.GENDER:
        return renderSection(
          "How do you identify?",
          "Select the option that best describes you.",
          GENDER_OPTIONS,
          "gender"
        );
      case LOCAL_STEPS.SERVICE:
        return renderSection(
          "What are you looking for?",
          "Choose the service that fits your needs.",
          SERVICE_OPTIONS,
          "serviceType"
        );
      case LOCAL_STEPS.DONOR_ROLE:
      case LOCAL_STEPS.SURROGACY_ROLE:
        return renderSection(
          "What is your role?",
          "Select your role in this journey.",
          step === LOCAL_STEPS.DONOR_ROLE ? DONOR_ROLES : SURROGACY_ROLES,
          "role"
        );
      case LOCAL_STEPS.INTERESTED_IN:
        return renderSection(
          "What type of donation?",
          "Select the type of gamete you're interested in.",
          GAMETE_OPTIONS,
          "interestedIn"
        );
      case LOCAL_STEPS.PAIRING_TYPES:
        return renderSection(
          "What type of arrangement?",
          "Select all that apply.",
          PAIRING_OPTIONS,
          "pairingTypes",
          true
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              style={styles.progressFill(
                (step / Object.keys(LOCAL_STEPS).length) * 100
              )}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className={styles.contentContainer}>{renderStepContent()}</main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className={styles.actionButton}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : step === LOCAL_STEPS.PAIRING_TYPES ? (
              <>
                <span>Complete Setup</span>
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

// Reusable Option Component
const OptionCard = ({
  icon,
  title,
  desc,
  isSelected,
  isDisabled,
  onClick,
  isMultiSelect,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={styles.optionCard(isSelected, isDisabled)}
    >
      <span className="text-3xl">{icon}</span>
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        {desc && <p className="text-sm text-gray-500 mt-0.5">{desc}</p>}
      </div>
      {isMultiSelect && (
        <div className={styles.multiSelectBox(isSelected)}>
          {isSelected && (
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      )}
    </button>
  );
};

export default InitialOnboarding;
