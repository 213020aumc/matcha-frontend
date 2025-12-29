import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { apiClient } from "../../services/api";
import {
  GENDER_OPTIONS,
  SERVICE_OPTIONS,
  DONOR_ROLES,
  SURROGACY_ROLES,
  GAMETE_OPTIONS,
  PAIRING_OPTIONS,
} from "../../constants/onboarding";
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";

// Updated steps to include new required fields
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

  // Fetch existing onboarding data on mount
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        setIsLoading(true);

        // Check if user already has onboarding data from auth store
        if (user) {
          const existingData = {
            gender: user.gender || null,
            serviceType: user.serviceType || null,
            role: user.role || null,
            interestedIn: user.interestedIn || null,
            pairingTypes: user.pairingTypes || [],
          };

          // If user has some data, populate form and skip to appropriate step
          if (existingData.gender) {
            setFormData(existingData);

            // Determine which step to start from based on existing data
            if (existingData.pairingTypes?.length > 0) {
              // All data complete, redirect to next stage
              navigate("/onboarding/basics");
              return;
            } else if (existingData.interestedIn) {
              setStep(LOCAL_STEPS.PAIRING_TYPES);
            } else if (existingData.role) {
              if (existingData.serviceType === "DONOR_SERVICES") {
                setStep(LOCAL_STEPS.INTERESTED_IN);
              } else {
                setStep(LOCAL_STEPS.PAIRING_TYPES);
              }
            } else if (existingData.serviceType) {
              if (existingData.serviceType === "DONOR_SERVICES") {
                setStep(LOCAL_STEPS.DONOR_ROLE);
              } else {
                setStep(LOCAL_STEPS.SURROGACY_ROLE);
              }
            } else {
              setStep(LOCAL_STEPS.SERVICE);
            }
          }
        }

        // User data already available from auth store, no need for extra API call
        // The user object from auth store already has all the onboarding fields
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
    // 1. SPLASH -> GENDER
    if (step === LOCAL_STEPS.SPLASH) {
      setStep(LOCAL_STEPS.GENDER);
      return;
    }

    // 2. GENDER -> SERVICE
    if (step === LOCAL_STEPS.GENDER) {
      if (!formData.gender) return alert("Please select a gender.");
      setStep(LOCAL_STEPS.SERVICE);
      return;
    }

    // 3. SERVICE -> ROLE (Donor or Surrogacy)
    if (step === LOCAL_STEPS.SERVICE) {
      if (!formData.serviceType) return alert("Please select a service type.");

      if (formData.serviceType === "DONOR_SERVICES") {
        setStep(LOCAL_STEPS.DONOR_ROLE);
      } else if (formData.serviceType === "SURROGACY_SERVICES") {
        setStep(LOCAL_STEPS.SURROGACY_ROLE);
      }
      return;
    }

    // 4. DONOR_ROLE -> INTERESTED_IN
    if (step === LOCAL_STEPS.DONOR_ROLE) {
      if (!formData.role) return alert("Please select your role.");
      setStep(LOCAL_STEPS.INTERESTED_IN);
      return;
    }

    // 5. SURROGACY_ROLE -> PAIRING_TYPES (skip interestedIn for surrogacy)
    if (step === LOCAL_STEPS.SURROGACY_ROLE) {
      if (!formData.role) return alert("Please select your role.");
      setStep(LOCAL_STEPS.PAIRING_TYPES);
      return;
    }

    // 6. INTERESTED_IN -> PAIRING_TYPES
    if (step === LOCAL_STEPS.INTERESTED_IN) {
      if (!formData.interestedIn)
        return alert("Please select what you're interested in.");
      setStep(LOCAL_STEPS.PAIRING_TYPES);
      return;
    }

    // 7. PAIRING_TYPES -> SUBMIT
    if (step === LOCAL_STEPS.PAIRING_TYPES) {
      if (formData.pairingTypes.length === 0) {
        return alert("Please select at least one pairing preference.");
      }

      setIsSubmitting(true);
      try {
        await submitOnboarding({
          termsAccepted: true,
          gender: formData.gender,
          serviceType: formData.serviceType,
          role: formData.role,
          interestedIn: formData.interestedIn,
          pairingTypes: formData.pairingTypes,
        });
        navigate("/onboarding/basics");
      } catch (error) {
        console.error("Onboarding submission failed:", error);
        alert("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
  };

  const handleBack = () => {
    if (step === LOCAL_STEPS.GENDER) setStep(LOCAL_STEPS.SPLASH);
    else if (step === LOCAL_STEPS.SERVICE) setStep(LOCAL_STEPS.GENDER);
    else if (step === LOCAL_STEPS.DONOR_ROLE) setStep(LOCAL_STEPS.SERVICE);
    else if (step === LOCAL_STEPS.SURROGACY_ROLE) setStep(LOCAL_STEPS.SERVICE);
    else if (step === LOCAL_STEPS.INTERESTED_IN) {
      if (formData.serviceType === "DONOR_SERVICES") {
        setStep(LOCAL_STEPS.DONOR_ROLE);
      } else {
        setStep(LOCAL_STEPS.SURROGACY_ROLE);
      }
    } else if (step === LOCAL_STEPS.PAIRING_TYPES) {
      if (formData.serviceType === "DONOR_SERVICES") {
        setStep(LOCAL_STEPS.INTERESTED_IN);
      } else {
        setStep(LOCAL_STEPS.SURROGACY_ROLE);
      }
    }
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Loading your progress...</p>
      </div>
    );
  }

  // --- Render: Splash Screen ---
  if (step === LOCAL_STEPS.SPLASH) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-primary/10 to-purple-100 p-6 text-center">
        <Sparkles className="w-16 h-16 text-primary mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to Your Journey
        </h1>
        <p className="text-gray-600 max-w-md mb-8">
          Let's get to know you a little better so we can personalize your
          experience.
        </p>
        <button
          onClick={handleNext}
          className="bg-primary text-white font-semibold py-3 px-10 rounded-full shadow-lg hover:bg-primary/90 transition-all"
        >
          Get Started
        </button>
      </div>
    );
  }

  // --- Render: Step Content ---
  const renderStepContent = () => {
    switch (step) {
      case LOCAL_STEPS.GENDER:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              How do you identify?
            </h2>
            <p className="text-gray-500 mb-6">
              Select the option that best describes you.
            </p>
            <div className="space-y-3">
              {GENDER_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  icon={opt.icon}
                  title={opt.label}
                  isSelected={formData.gender === opt.id}
                  onClick={() => handleSelect("gender", opt.id)}
                />
              ))}
            </div>
          </>
        );

      case LOCAL_STEPS.SERVICE:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              What are you looking for?
            </h2>
            <p className="text-gray-500 mb-6">
              Choose the service that fits your needs.
            </p>
            <div className="space-y-3">
              {SERVICE_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  icon={opt.icon}
                  title={opt.label}
                  desc={opt.desc}
                  isSelected={formData.serviceType === opt.id}
                  onClick={() => handleSelect("serviceType", opt.id)}
                />
              ))}
            </div>
          </>
        );

      case LOCAL_STEPS.DONOR_ROLE:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              What is your role?
            </h2>
            <p className="text-gray-500 mb-6">
              Are you a donor or looking for one?
            </p>
            <div className="space-y-3">
              {DONOR_ROLES.map((opt) => (
                <OptionCard
                  key={opt.id}
                  icon={opt.icon}
                  title={opt.label}
                  desc={opt.desc}
                  isSelected={formData.role === opt.id}
                  onClick={() => handleSelect("role", opt.id)}
                />
              ))}
            </div>
          </>
        );

      case LOCAL_STEPS.SURROGACY_ROLE:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              What is your role?
            </h2>
            <p className="text-gray-500 mb-6">
              Are you a surrogate or looking for one?
            </p>
            <div className="space-y-3">
              {SURROGACY_ROLES.map((opt) => (
                <OptionCard
                  key={opt.id}
                  icon={opt.icon}
                  title={opt.label}
                  desc={opt.desc}
                  isSelected={formData.role === opt.id}
                  onClick={() => handleSelect("role", opt.id)}
                />
              ))}
            </div>
          </>
        );

      case LOCAL_STEPS.INTERESTED_IN:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              What type of donation?
            </h2>
            <p className="text-gray-500 mb-6">
              Select the type of gamete you're interested in.
            </p>
            <div className="space-y-3">
              {GAMETE_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  icon={opt.icon}
                  title={opt.label}
                  desc={opt.desc}
                  isSelected={formData.interestedIn === opt.id}
                  onClick={() => handleSelect("interestedIn", opt.id)}
                />
              ))}
            </div>
          </>
        );

      case LOCAL_STEPS.PAIRING_TYPES:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              What type of arrangement?
            </h2>
            <p className="text-gray-500 mb-6">
              Select all that apply. You can choose multiple options.
            </p>
            <div className="space-y-3">
              {PAIRING_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.id}
                  icon={opt.icon}
                  title={opt.label}
                  desc={opt.desc}
                  isSelected={formData.pairingTypes.includes(opt.id)}
                  onClick={() => handlePairingToggle(opt.id)}
                  isMultiSelect
                />
              ))}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // --- Main Layout for Steps ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Back Button */}
      <header className="p-4 flex items-center gap-4 border-b bg-white sticky top-0 z-10">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(step / Object.keys(LOCAL_STEPS).length) * 100}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 max-w-lg mx-auto w-full">
        {renderStepContent()}
      </main>

      {/* Footer with Next Button */}
      <footer className="p-4 border-t bg-white sticky bottom-0">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      className={`
        w-full p-4 rounded-xl border-2 text-left transition-all
        flex items-center gap-4
        ${
          isSelected
            ? "border-primary bg-primary/5 shadow-md"
            : "border-gray-200 bg-white hover:border-gray-300"
        }
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span className="text-3xl">{icon}</span>
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        {desc && <p className="text-sm text-gray-500 mt-0.5">{desc}</p>}
      </div>
      {isMultiSelect && (
        <div
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
            isSelected ? "bg-primary border-primary" : "border-gray-300"
          }`}
        >
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
