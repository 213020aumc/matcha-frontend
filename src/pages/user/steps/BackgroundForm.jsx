import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { apiClient } from "../../../services/api";
import { PHYSICAL_ATTRIBUTES } from "../../../constants/onboarding";
import { formStyles as styles } from "../../../styles/onboarding";

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
    height: "",
    weight: "",
    bodyBuild: "",
    hairColor: "",
    eyeColor: "",
    race: "",
    orientation: "",
    education: "",
    occupation: "",
    nationality: "",
    diet: "",
    bio: "",
  });

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
        if (err.response?.status !== 404) setError("Failed to load saved data");
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

  const handleBack = () => {
    setError(null);
    if (subStep > 0) {
      setSubStep(subStep - 1);
    } else {
      navigate("/onboarding/basics");
    }
  };

  const handleSubmit = async () => {
    if (!formData.education.trim())
      return setError("Please enter your education level.");
    if (!formData.occupation.trim())
      return setError("Please enter your occupation.");

    if (user?.serviceType === "SURROGACY_SERVICES") {
      if (!formData.height)
        return setError("Height is required for surrogacy candidates.");
      if (!formData.weight)
        return setError("Weight is required for surrogacy candidates.");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        height: formData.height ? parseInt(formData.height) : null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        bodyBuild: formData.bodyBuild || null,
        hairColor: formData.hairColor || null,
        eyeColor: formData.eyeColor || null,
        race: formData.race || null,
        orientation: formData.orientation || null,
        education: formData.education,
        occupation: formData.occupation,
        nationality: formData.nationality || null,
        diet: formData.diet || null,
        bio: formData.bio || null,
        isComplete: true,
      };

      await apiClient.post("/user/profile/stage-2/background", payload);
      updateUserStep(2);
      navigate("/onboarding/health");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save.";
      setError(msg);
      if (msg.includes("dob"))
        setTimeout(() => navigate("/onboarding/basics"), 2000);
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

  const stageProgress = ((subStep + 1) / 3) * 100;

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.progressBarContainer}>
          <div
            className="bg-primary h-full transition-all duration-300"
            style={styles.progressBarFill(stageProgress)}
          />
        </div>
        <p className={styles.sectionLabel}>
          Stage 2 of 6 • Step {subStep + 1} of 3
        </p>
      </div>

      {error && (
        <div className="max-w-lg mx-auto w-full px-6 mt-4">
          <div className={styles.errorBox}>{error}</div>
        </div>
      )}

      {/* Main Content */}
      <main className={styles.contentContainer}>
        {subStep === SUB_STEPS.PHYSICAL && (
          <div className="animate-fade-in">
            <h1 className={styles.heading}>Physical Attributes</h1>
            <p className={styles.subHeading}>
              This information helps others find compatible matches.
            </p>

            <div className={styles.inputGroup}>
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Height (cm)"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleChange}
                  required={user?.serviceType === "SURROGACY_SERVICES"}
                />
                <InputField
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  required={user?.serviceType === "SURROGACY_SERVICES"}
                />
              </div>

              <CustomSelect
                label="Body Build"
                name="bodyBuild"
                options={PHYSICAL_ATTRIBUTES?.BODY_BUILD}
                value={formData.bodyBuild}
                onChange={handleSelect}
              />
              <CustomSelect
                label="Hair Color"
                name="hairColor"
                options={PHYSICAL_ATTRIBUTES?.HAIR_COLORS}
                value={formData.hairColor}
                onChange={handleSelect}
              />
              <CustomSelect
                label="Eye Color"
                name="eyeColor"
                options={PHYSICAL_ATTRIBUTES?.EYE_COLORS}
                value={formData.eyeColor}
                onChange={handleSelect}
              />
              <CustomSelect
                label="Race/Ethnicity"
                name="race"
                options={PHYSICAL_ATTRIBUTES?.RACE}
                value={formData.race}
                onChange={handleSelect}
              />
              <CustomSelect
                label="Orientation"
                name="orientation"
                options={PHYSICAL_ATTRIBUTES?.ORIENTATION}
                value={formData.orientation}
                onChange={handleSelect}
              />
            </div>
          </div>
        )}

        {subStep === SUB_STEPS.BACKGROUND && (
          <div className="animate-fade-in">
            <h1 className={styles.heading}>Your Background</h1>
            <p className={styles.subHeading}>
              Share a bit about your education and lifestyle.
            </p>

            <div className={styles.inputGroup}>
              <InputField
                label="Education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="e.g., Bachelor's in Biology"
                required
              />
              <InputField
                label="Occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g., Software Engineer"
                required
              />
              <InputField
                label="Nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="e.g., American"
              />
              <CustomSelect
                label="Diet"
                name="diet"
                options={PHYSICAL_ATTRIBUTES?.DIETS}
                value={formData.diet}
                onChange={handleSelect}
              />
            </div>
          </div>
        )}

        {subStep === SUB_STEPS.BIO && (
          <div className="animate-fade-in">
            <h1 className={styles.heading}>In your own words...</h1>
            <p className={styles.subHeading}>
              Write a short bio to introduce yourself. What are your passions?
            </p>

            <div>
              <label className={styles.inputLabel}>Bio</label>
              <textarea
                name="bio"
                placeholder="Tell potential matches about yourself..."
                value={formData.bio}
                onChange={handleChange}
                className={styles.textArea}
                maxLength={500}
              />
              <p className={styles.charCount}>{formData.bio.length}/500</p>
            </div>
          </div>
        )}
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
            onClick={handleNext}
            disabled={isSubmitting}
            className={styles.nextButton}
          >
            {isSubmitting
              ? "Saving..."
              : subStep === SUB_STEPS.BIO
              ? "Complete"
              : "Continue"}
          </button>
        </div>
      </footer>
    </div>
  );
};

// --- Helper Components (Internal) ---

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}) => (
  <div>
    <label className={styles.inputLabel}>
      {label} {required && <span className={styles.requiredStar}>*</span>}
    </label>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={styles.inputField}
    />
  </div>
);

const CustomSelect = ({ label, name, options, value, onChange, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <label className={styles.inputLabel}>
        {label} {required && <span className={styles.requiredStar}>*</span>}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={styles.selectButton(!!value)}
      >
        <span>
          {value
            ? options?.find((o) => o.id === value)?.label || value
            : "Select One"}
        </span>
        <span className="text-gray-400">▼</span>
      </div>
      {isOpen && options && (
        <div className={styles.selectDropdown}>
          {options.map((opt) => (
            <div
              key={opt.id}
              className={styles.selectOption(value === opt.id)}
              onClick={() => {
                onChange(name, opt.id);
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

export default BackgroundForm;
