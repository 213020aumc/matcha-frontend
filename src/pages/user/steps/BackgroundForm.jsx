import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { apiClient } from "../../../services/api";
import { PHYSICAL_ATTRIBUTES } from "../../../constants/onboarding";

const SUB_STEPS = {
  PHYSICAL: 0,
  BACKGROUND: 1,
  BIO: 2,
};

export const BackgroundForm = () => {
  const navigate = useNavigate();
  const { user, updateUserStep } = useAuthStore();

  const [subStep, setSubStep] = useState(SUB_STEPS.PHYSICAL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    // Physical Attributes
    height: "",
    weight: "",
    bodyBuild: "",
    hairColor: "",
    eyeColor: "",
    race: "",
    orientation: "",
    // Background
    education: "",
    occupation: "",
    nationality: "",
    diet: "",
    // Bio
    bio: "",
  });

  // Fetch existing data on mount
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        setIsLoading(true);
        const { data } = await apiClient.get(
          "/user/profile/stage-2/background"
        );

        if (data?.data) {
          const b = data.data;
          setFormData({
            height: b.height?.toString() || "",
            weight: b.weight?.toString() || "",
            bodyBuild: b.bodyBuild || "",
            hairColor: b.hairColor || "",
            eyeColor: b.eyeColor || "",
            race: b.race || "",
            orientation: b.orientation || "",
            education: b.education || "",
            occupation: b.occupation || "",
            nationality: b.nationality || "",
            diet: b.diet || "",
            bio: b.bio || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch background data:", err);
        if (err.response?.status !== 404) {
          setError("Failed to load saved data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(null);
    setFormData({ ...formData, [name]: value });
  };

  const handleSelect = (key, value) => {
    setError(null);
    setFormData({ ...formData, [key]: value });
  };

  const handleNext = async () => {
    setError(null);

    if (subStep < SUB_STEPS.BIO) {
      setSubStep(subStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.education.trim()) {
      setError("Please enter your education level.");
      return;
    }
    if (!formData.occupation.trim()) {
      setError("Please enter your occupation.");
      return;
    }

    // Validate height/weight for surrogacy
    if (user?.serviceType === "SURROGACY_SERVICES") {
      if (!formData.height) {
        setError("Height is required for surrogacy candidates.");
        return;
      }
      if (!formData.weight) {
        setError("Weight is required for surrogacy candidates.");
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        // Physical - only send if not empty
        height: formData.height ? parseInt(formData.height) : null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        bodyBuild: formData.bodyBuild || null,
        hairColor: formData.hairColor || null,
        eyeColor: formData.eyeColor || null,
        race: formData.race || null,
        orientation: formData.orientation || null,
        // Background
        education: formData.education,
        occupation: formData.occupation,
        nationality: formData.nationality || null,
        diet: formData.diet || null,
        // Bio
        bio: formData.bio || null,
        // Mark as complete
        isComplete: true,
      };

      console.log("Submitting payload:", payload);

      const response = await apiClient.post(
        "/user/profile/stage-2/background",
        payload
      );

      console.log("Stage 2 response:", response.data);
      console.log("Stage 2 Complete! Navigating to Stage 3...");

      // Update local state
      updateUserStep(2);

      // Navigate to next stage
      navigate("/onboarding/health");
    } catch (err) {
      console.error("Failed to save background:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to save. Please try again.";
      setError(errorMessage);

      // If the error is about dob, redirect to basics
      if (errorMessage.includes("dob")) {
        setError("Date of birth is missing. Please complete Stage 1 first.");
        setTimeout(() => {
          navigate("/onboarding/basics");
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setError(null);
    if (subStep > 0) {
      setSubStep(subStep - 1);
    } else {
      navigate("/onboarding/basics");
    }
  };

  // Calculate progress
  const stageProgress = ((subStep + 1) / 3) * 100;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#483d8b]"></div>
      </div>
    );
  }

  // Custom Select Component - defined outside render for better performance
  const CustomSelect = ({
    label,
    name,
    placeholder,
    options,
    value,
    required,
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 bg-gray-50 rounded-xl flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {value
              ? options?.find((o) => o.id === value)?.label || value
              : placeholder}
          </span>
          <span className="text-gray-400">▼</span>
        </div>

        {isOpen && options && options.length > 0 && (
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <div
                key={opt.id}
                className={`p-3 hover:bg-gray-50 cursor-pointer text-gray-700 text-sm ${
                  value === opt.id
                    ? "bg-[#483d8b]/10 text-[#483d8b] font-medium"
                    : ""
                }`}
                onClick={() => {
                  handleSelect(name, opt.id);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans relative">
      {/* Header */}
      <div className="pt-6 px-6">
        <div className="w-full bg-gray-200 h-1 mb-6">
          <div
            className="bg-[#483d8b] h-1 transition-all duration-300"
            style={{ width: `${stageProgress}%` }}
          ></div>
        </div>
        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
          Stage 2 of 6 • Step {subStep + 1} of 3
        </p>
      </div>

      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <main className="flex-1 px-6 pb-24 overflow-y-auto">
        {/* SUB-STEP 1: Physical Attributes */}
        {subStep === SUB_STEPS.PHYSICAL && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Physical Attributes
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              This information helps others find compatible matches.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">
                    Height (cm){" "}
                    {user?.serviceType === "SURROGACY_SERVICES" && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <input
                    name="height"
                    type="number"
                    placeholder="175"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#483d8b]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">
                    Weight (kg){" "}
                    {user?.serviceType === "SURROGACY_SERVICES" && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <input
                    name="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#483d8b]"
                  />
                </div>
              </div>

              <CustomSelect
                label="Body Build"
                name="bodyBuild"
                placeholder="Select One"
                options={PHYSICAL_ATTRIBUTES?.BODY_BUILD}
                value={formData.bodyBuild}
              />

              <CustomSelect
                label="Hair Color"
                name="hairColor"
                placeholder="Select One"
                options={PHYSICAL_ATTRIBUTES?.HAIR_COLORS}
                value={formData.hairColor}
              />

              <CustomSelect
                label="Eye Color"
                name="eyeColor"
                placeholder="Select One"
                options={PHYSICAL_ATTRIBUTES?.EYE_COLORS}
                value={formData.eyeColor}
              />

              <CustomSelect
                label="Race/Ethnicity"
                name="race"
                placeholder="Select One"
                options={PHYSICAL_ATTRIBUTES?.RACE}
                value={formData.race}
              />

              <CustomSelect
                label="Orientation"
                name="orientation"
                placeholder="Select One"
                options={PHYSICAL_ATTRIBUTES?.ORIENTATION}
                value={formData.orientation}
              />
            </div>
          </div>
        )}

        {/* SUB-STEP 2: Background */}
        {subStep === SUB_STEPS.BACKGROUND && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your Background
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Share a bit about your education and lifestyle.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">
                  Education <span className="text-red-500">*</span>
                </label>
                <input
                  name="education"
                  placeholder="e.g., Bachelor's in Biology"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#483d8b]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">
                  Occupation <span className="text-red-500">*</span>
                </label>
                <input
                  name="occupation"
                  placeholder="e.g., Software Engineer"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#483d8b]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">
                  Nationality
                </label>
                <input
                  name="nationality"
                  placeholder="e.g., American"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#483d8b]"
                />
              </div>

              <CustomSelect
                label="Diet"
                name="diet"
                placeholder="Select One"
                options={PHYSICAL_ATTRIBUTES?.DIETS}
                value={formData.diet}
              />
            </div>
          </div>
        )}

        {/* SUB-STEP 3: Bio */}
        {subStep === SUB_STEPS.BIO && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              In your own words...
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Write a short bio to introduce yourself. What are your passions?
              What are you looking for in this journey?
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">
                Bio
              </label>
              <textarea
                name="bio"
                placeholder="Tell potential matches about yourself, your hobbies, and what motivates you..."
                value={formData.bio}
                onChange={handleChange}
                className="w-full h-48 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#483d8b] outline-none resize-none text-gray-900"
                maxLength={500}
              />
              <p className="text-right text-xs text-gray-400 mt-2">
                {formData.bio.length}/500
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 bg-white flex justify-between items-center border-t shadow-lg">
        <button
          onClick={handleBack}
          className="px-8 py-3 rounded-full border border-[#483d8b] text-[#483d8b] font-semibold"
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
            : subStep === SUB_STEPS.BIO
            ? "Complete Stage 2"
            : "Continue"}
        </button>
      </footer>
    </div>
  );
};

export default BackgroundForm;
