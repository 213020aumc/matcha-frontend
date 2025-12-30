import React, { useState } from "react";
import { PHYSICAL_ATTRIBUTES } from "../../constants/onboarding";
import { formStyles as styles } from "../../styles/onboarding";

const SUB_STEPS = {
  PHOTOS: 0,
  PHYSICAL: 1,
  BACKGROUND: 2,
  BIO: 3,
};

const PersonalDetails = ({ onComplete }) => {
  const [subStep, setSubStep] = useState(SUB_STEPS.PHOTOS);
  const [formData, setFormData] = useState({
    // Physical
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

  const handleSelect = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (subStep < SUB_STEPS.BIO) {
      setSubStep(subStep + 1);
    } else {
      console.log("Stage 2 Complete", formData);
      if (onComplete) onComplete();
    }
  };

  const handleBack = () => {
    if (subStep > 0) setSubStep(subStep - 1);
  };

  // Calculate progress for this specific stage (4 sub-steps)
  const progressPercentage = ((subStep + 1) / 4) * 100;

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className="flex justify-between items-center mb-4">
          <span className="text-transparent">.</span>
          <button className="text-primary font-semibold text-sm underline hover:text-primary/80">
            Skip For Now
          </button>
        </div>

        <div className={styles.progressBarContainer}>
          <div
            className="bg-primary h-full transition-all duration-300"
            style={styles.progressBarFill(progressPercentage)}
          />
        </div>
        <p className={styles.sectionLabel}>Stage 2 of 6</p>
      </div>

      {/* Main Content */}
      <main className={styles.contentContainer}>
        {/* 2.1 Photos */}
        {subStep === SUB_STEPS.PHOTOS && (
          <div className="animate-fade-in">
            <h1 className={styles.heading}>Add your photos</h1>
            <p className={styles.subHeading}>
              Please upload both current photos and a baby photo.
            </p>

            <div className="mb-6">
              <label className={styles.subSectionTitle}>Baby Photos</label>
              <p className={styles.subSectionDesc}>Visible to all users.</p>

              <div className={styles.photoUploadCard}>
                <span className={styles.photoUploadIcon}>☁️</span>
                <span className={styles.photoUploadText}>
                  Upload Baby Photo
                </span>
              </div>
            </div>

            <div>
              <label className={styles.subSectionTitle}>Current Photos</label>
              <p className={styles.subSectionDesc}>Visible to Premium users.</p>

              <div className={styles.photoUploadCard}>
                <span className={styles.photoUploadIcon}>☁️</span>
                <span className={styles.photoUploadText}>
                  Upload Current Photo
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2.2 Physical Attributes */}
        {subStep === SUB_STEPS.PHYSICAL && (
          <div className="animate-fade-in">
            <h1 className={styles.heading}>Tell us about yourself</h1>
            <p className={styles.subHeading}>
              This information helps others find you.
            </p>

            <div className={styles.inputGroup}>
              <CustomSelect
                label="Height"
                placeholder="Select One"
                // Add options/logic here
              />

              <div>
                <label className={styles.inputLabel}>Weight</label>
                <input
                  name="weight"
                  placeholder="Enter Weight"
                  className={styles.inputField}
                  onChange={handleChange}
                />
              </div>

              <CustomSelect
                label="Body Build"
                placeholder="Select One"
                options={PHYSICAL_ATTRIBUTES.BODY_BUILD}
                value={formData.bodyBuild}
                onChange={(val) => handleSelect("bodyBuild", val)}
              />

              <CustomSelect
                label="Hair Color"
                placeholder="Select One"
                options={PHYSICAL_ATTRIBUTES.HAIR_COLORS}
                value={formData.hairColor}
                onChange={(val) => handleSelect("hairColor", val)}
              />

              <CustomSelect
                label="Eye Color"
                placeholder="Select One"
                options={PHYSICAL_ATTRIBUTES.EYE_COLORS}
                value={formData.eyeColor}
                onChange={(val) => handleSelect("eyeColor", val)}
              />

              <CustomSelect
                label="Race"
                placeholder="Select One"
                options={PHYSICAL_ATTRIBUTES.RACE}
                value={formData.race}
                onChange={(val) => handleSelect("race", val)}
              />

              <CustomSelect
                label="Orientation"
                placeholder="Select One"
                options={PHYSICAL_ATTRIBUTES.ORIENTATION}
                value={formData.orientation}
                onChange={(val) => handleSelect("orientation", val)}
              />
            </div>
          </div>
        )}

        {/* 2.3 Background */}
        {subStep === SUB_STEPS.BACKGROUND && (
          <div className="animate-fade-in">
            <h1 className={styles.heading}>What's your background?</h1>
            <p className={styles.subHeading}>
              Share a bit about your life and education.
            </p>

            <div className={styles.inputGroup}>
              <div>
                <label className={styles.inputLabel}>Education</label>
                <input
                  name="education"
                  placeholder="Enter Education"
                  className={styles.inputField}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className={styles.inputLabel}>Occupation</label>
                <input
                  name="occupation"
                  placeholder="Enter Occupation"
                  className={styles.inputField}
                  onChange={handleChange}
                />
              </div>

              <CustomSelect
                label="Nationality"
                placeholder="Select One"
                // Add options/logic here
              />

              <CustomSelect
                label="Diet"
                placeholder="Select One"
                options={PHYSICAL_ATTRIBUTES.DIETS}
                value={formData.diet}
                onChange={(val) => handleSelect("diet", val)}
              />
            </div>
          </div>
        )}

        {/* 2.4 Bio */}
        {subStep === SUB_STEPS.BIO && (
          <div className="animate-fade-in">
            <h1 className={styles.heading}>In your own words...</h1>
            <p className={styles.subHeading}>
              Write a short bio to introduce yourself. What are your passions?
              What are you looking for in this journey?
            </p>

            <div>
              <label className={styles.inputLabel}>Bio</label>
              <textarea
                name="bio"
                placeholder="Enter Here"
                className={styles.textArea}
                onChange={handleChange}
                maxLength={500}
              />
              <p className={styles.charCount}>(450/500)</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <button onClick={handleBack} className={styles.backButton}>
            Back
          </button>
          <button onClick={handleNext} className={styles.nextButton}>
            Continue
          </button>
        </div>
      </footer>
    </div>
  );
};

// Helper: Custom Select Component using shared styles
const CustomSelect = ({
  label,
  placeholder,
  options = [],
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className={styles.inputLabel}>{label}</label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={styles.selectButton(!!value)}
      >
        <span>
          {value
            ? options.find((o) => o.id === value)?.label || value
            : placeholder}
        </span>
        <span className="text-gray-400">⌄</span>
      </div>

      {isOpen && options.length > 0 && (
        <div className={styles.selectDropdown}>
          {options.map((opt) => (
            <div
              key={opt.id}
              className={styles.selectOption(value === opt.id)}
              onClick={() => {
                onChange(opt.id);
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

export default PersonalDetails;
