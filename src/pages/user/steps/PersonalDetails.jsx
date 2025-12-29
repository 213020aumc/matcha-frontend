import React, { useState } from "react";
import { PHYSICAL_ATTRIBUTES } from "../../constants/onboarding";

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
      // Trigger next stage
    }
  };

  const handleBack = () => {
    if (subStep > 0) setSubStep(subStep - 1);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans">
      {/* Header */}
      <div className="pt-6 px-6">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-sm">9:41</span>
          <span className="text-[#483d8b] font-semibold text-sm underline">
            Skip For Now
          </span>
        </div>
        <div className="w-full bg-gray-200 h-1 mb-6">
          <div className="bg-gray-800 h-1 w-1/4"></div>
        </div>
        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
          Stage 2 of 6
        </p>
      </div>

      <main className="flex-1 px-6 pb-24 overflow-y-auto">
        {/* 2.1 Photos */}
        {subStep === SUB_STEPS.PHOTOS && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Add your photos
            </h1>
            <p className="text-gray-500 text-sm mb-8">
              Please upload both current photos and a baby photo.
            </p>

            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
                Baby Photos
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Visible to all users.
              </p>
              <div className="border border-gray-200 rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                <span className="text-2xl text-[#483d8b] mb-2">☁️</span>
                <span className="text-sm font-medium text-gray-600">
                  Upload Baby Photo
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
                Current Photos
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Visible to Premium users.
              </p>
              <div className="border border-gray-200 rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                <span className="text-2xl text-[#483d8b] mb-2">☁️</span>
                <span className="text-sm font-medium text-gray-600">
                  Upload Current Photo
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2.2 Physical Attributes */}
        {subStep === SUB_STEPS.PHYSICAL && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Tell us about yourself
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              This information helps others find you.
            </p>

            <div className="space-y-4">
              <CustomSelect label="Height" placeholder="Select One" />

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 ml-1">
                  Weight
                </label>
                <input
                  name="weight"
                  placeholder="Enter Weight"
                  className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-300 outline-none"
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              What's your background?
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Share a bit about your life and education.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 ml-1">
                  Education
                </label>
                <input
                  name="education"
                  placeholder="Enter Education"
                  className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-300 outline-none"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 ml-1">
                  Occupation
                </label>
                <input
                  name="occupation"
                  placeholder="Enter Occupation"
                  className="w-full p-4 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-300 outline-none"
                  onChange={handleChange}
                />
              </div>

              <CustomSelect label="Nationality" placeholder="Select One" />

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              In your own words...
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Write a short bio to introduce yourself. What are your passions?
              What are you looking for in this journey?
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 ml-1">
                Bio
              </label>
              <textarea
                name="bio"
                placeholder="Enter Here"
                className="w-full h-40 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#483d8b] outline-none resize-none text-gray-900"
                onChange={handleChange}
              />
              <p className="text-right text-xs text-gray-400 mt-2">(450/500)</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 bg-white flex justify-between items-center">
        <button
          onClick={handleBack}
          className="px-8 py-3 rounded-full border border-[#483d8b] text-[#483d8b] font-semibold"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-3 rounded-full bg-[#483d8b] text-white font-semibold shadow-lg shadow-indigo-100"
        >
          Continue
        </button>
      </footer>
    </div>
  );
};

// Helper: Custom Select Component with Chips support if needed
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
      <label className="block text-sm font-medium text-gray-500 mb-1 ml-1">
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-gray-50 rounded-xl flex justify-between items-center cursor-pointer"
      >
        <span className={value ? "text-gray-900" : "text-gray-300"}>
          {value
            ? options.find((o) => o.id === value)?.label || value
            : placeholder}
        </span>
        <span className="text-gray-400">⌄</span>
      </div>

      {/* Dropdown / Chips Area - Simplified for this demo */}
      {isOpen && options.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 max-h-60 overflow-y-auto">
          {/* If you want chips (like in screen 1.6 for Hair Color), utilize flex-wrap here */}
          <div className="flex flex-col">
            {options.map((opt) => (
              <div
                key={opt.id}
                className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer text-gray-700 text-sm"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalDetails;
