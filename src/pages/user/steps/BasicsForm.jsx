import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { apiClient } from "../../../services/api";

const SUB_STEPS = {
  PERSONAL: 0,
  CONTACT: 1,
  IDENTITY: 2,
  PHOTOS: 3,
};

export const BasicsForm = () => {
  const navigate = useNavigate();
  const { user, updateUserStep } = useAuthStore();

  const [subStep, setSubStep] = useState(SUB_STEPS.PERSONAL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    email: user?.email || "",
    phone: "",
    address: "",
    idDocument: null,
    docType: "DRIVER_LICENSE",
    babyPhoto: null,
    currentPhoto: null,
  });

  const [babyPhotoPreview, setBabyPhotoPreview] = useState(null);
  const [currentPhotoPreview, setCurrentPhotoPreview] = useState(null);
  const [existingIdDoc, setExistingIdDoc] = useState(null);

  // Fetch existing data on mount
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        setIsLoading(true);

        // Fetch basic info
        const { data: basicData } = await apiClient.get(
          "/user/profile/stage-1/basics"
        );

        // Fetch photos
        const { data: photosData } = await apiClient.get(
          "/user/profile/stage-1/photos"
        );

        // Fetch identity status
        const { data: identityData } = await apiClient.get(
          "/user/profile/stage-1/identity"
        );

        // Populate form with existing data
        if (basicData?.data) {
          setFormData((prev) => ({
            ...prev,
            fullName: basicData.data.legalName || "",
            dob: basicData.data.dob?.split("T")[0] || "",
            phone: basicData.data.phoneNumber || "",
            address: basicData.data.address || "",
          }));
        }

        if (photosData?.data) {
          if (photosData.data.babyPhotoUrl) {
            setBabyPhotoPreview(photosData.data.babyPhotoUrl);
          }
          if (photosData.data.currentPhotoUrl) {
            setCurrentPhotoPreview(photosData.data.currentPhotoUrl);
          }
        }

        if (identityData?.data?.hasIdentityDoc) {
          setExistingIdDoc(identityData.data);
        }
      } catch (err) {
        console.error("Failed to fetch existing data:", err);
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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setError(null);

    if (files && files[0]) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });

      if (name === "babyPhoto") {
        setBabyPhotoPreview(URL.createObjectURL(file));
      } else if (name === "currentPhoto") {
        setCurrentPhotoPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNext = async () => {
    // Sub-step validation and navigation
    if (subStep === SUB_STEPS.PERSONAL) {
      if (!formData.fullName.trim()) {
        return setError("Please enter your full name.");
      }
      if (!formData.dob) {
        return setError("Please enter your date of birth.");
      }
      setSubStep(SUB_STEPS.CONTACT);
      return;
    }

    if (subStep === SUB_STEPS.CONTACT) {
      if (!formData.email.trim()) {
        return setError("Please enter your email.");
      }
      setSubStep(SUB_STEPS.IDENTITY);
      return;
    }

    if (subStep === SUB_STEPS.IDENTITY) {
      setSubStep(SUB_STEPS.PHOTOS);
      return;
    }

    // Final step - submit all data
    if (subStep === SUB_STEPS.PHOTOS) {
      // Require current photo only if no existing photo
      if (!formData.currentPhoto && !currentPhotoPreview) {
        return setError("Please upload a current photo of yourself.");
      }

      setIsSubmitting(true);
      setError(null);

      try {
        // Step 1: Save basic info
        await apiClient.post("/user/profile/stage-1/basics", {
          legalName: formData.fullName,
          dob: formData.dob,
          phoneNumber: formData.phone,
          address: formData.address,
          isComplete: true,
        });

        // Step 2: Upload identity document if new file provided
        if (formData.idDocument) {
          const docFormData = new FormData();
          docFormData.append("document", formData.idDocument);
          docFormData.append("type", formData.docType);

          await apiClient.post("/user/profile/stage-1/identity", docFormData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        // Step 3: Upload photos if new files provided
        if (formData.babyPhoto || formData.currentPhoto) {
          const photosFormData = new FormData();
          if (formData.babyPhoto) {
            photosFormData.append("baby", formData.babyPhoto);
          }
          if (formData.currentPhoto) {
            photosFormData.append("current", formData.currentPhoto);
          }
          photosFormData.append("isComplete", "true");

          await apiClient.post("/user/profile/stage-1/photos", photosFormData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        // Update local state and navigate
        updateUserStep(1);
        navigate("/onboarding/background");
      } catch (err) {
        console.error("Failed to complete Stage 1:", err);
        setError(
          err.response?.data?.message || "Failed to save. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (subStep > 0) {
      setSubStep(subStep - 1);
      setError(null);
    } else {
      navigate("/onboarding/initial");
    }
  };

  const getMaxDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split("T")[0];
  };

  const getMinDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 100);
    return today.toISOString().split("T")[0];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#483d8b]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white font-sans">
      {/* Header */}
      <div className="pt-6 px-6">
        <div className="w-full bg-gray-200 h-1 mb-6">
          <div
            className="bg-[#483d8b] h-1 transition-all duration-300"
            style={{ width: `${((subStep + 1) / 4) * 100}%` }}
          ></div>
        </div>
        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
          Stage 1 of 6 • Step {subStep + 1} of 4
        </p>
      </div>

      {error && (
        <div className="mx-6 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <main className="flex-1 px-6 pb-24 overflow-y-auto mt-4">
        {/* PERSONAL Sub-step */}
        {subStep === SUB_STEPS.PERSONAL && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Let's start with the basics
            </h1>
            <p className="text-gray-500 text-sm mb-8">
              Please use the information that appears on your government-issued
              ID.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#483d8b] outline-none"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#483d8b] outline-none"
                  value={formData.dob}
                  onChange={handleChange}
                  max={getMaxDate()}
                  min={getMinDate()}
                />
                <p className="text-xs text-gray-400 mt-1">
                  You must be at least 18 years old
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT Sub-step */}
        {subStep === SUB_STEPS.CONTACT && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Contact Information
            </h1>
            <p className="text-gray-500 text-sm mb-8">How can we reach you?</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-[#483d8b] outline-none bg-gray-100"
                  value={formData.email}
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">
                  Email from your account
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="(555) 123-4567"
                  className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#483d8b] outline-none"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Address
                </label>
                <textarea
                  name="address"
                  placeholder="Enter your address"
                  rows="3"
                  className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#483d8b] outline-none resize-none"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* IDENTITY Sub-step */}
        {subStep === SUB_STEPS.IDENTITY && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Identity
            </h1>
            <p className="text-gray-500 text-sm mb-2">
              Upload a clear photo of your government-issued ID for
              verification.
            </p>
            <p className="text-gray-400 text-xs mb-4">
              Accepted: Driver's License, Passport (Optional but recommended)
            </p>

            {existingIdDoc && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">
                  ✓ Identity document already uploaded ({existingIdDoc.type})
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Document Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, docType: "DRIVER_LICENSE" })
                  }
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    formData.docType === "DRIVER_LICENSE"
                      ? "border-[#483d8b] bg-[#483d8b]/5"
                      : "border-gray-200"
                  }`}
                >
                  <span className="text-sm font-medium">Driver's License</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, docType: "PASSPORT" })
                  }
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    formData.docType === "PASSPORT"
                      ? "border-[#483d8b] bg-[#483d8b]/5"
                      : "border-gray-200"
                  }`}
                >
                  <span className="text-sm font-medium">Passport</span>
                </button>
              </div>
            </div>

            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 bg-gray-50 rounded-3xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center">
                <span className="text-4xl text-[#483d8b] mb-2">📄</span>
                <p className="text-sm text-gray-600 font-medium">
                  {formData.idDocument
                    ? formData.idDocument.name
                    : "Upload Document"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG or PDF (max 10MB)
                </p>
              </div>
              <input
                type="file"
                name="idDocument"
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleChange}
              />
            </label>
          </div>
        )}

        {/* PHOTOS Sub-step */}
        {subStep === SUB_STEPS.PHOTOS && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Add Your Photos
            </h1>
            <p className="text-gray-500 text-sm mb-8">
              Help others get to know you better by sharing your photos.
            </p>

            <div className="space-y-6">
              {/* Current Photo - Required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Photo <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  A recent, clear photo of yourself
                </p>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 bg-gray-50 rounded-3xl cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden">
                  {currentPhotoPreview ? (
                    <img
                      src={currentPhotoPreview}
                      alt="Current"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">📷</span>
                      <p className="text-sm text-gray-600 font-medium">
                        Upload Current Photo
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="currentPhoto"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                  />
                </label>
              </div>

              {/* Baby Photo - Optional */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Baby Photo (Optional)
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  A photo of you as a baby or young child
                </p>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 bg-gray-50 rounded-3xl cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden">
                  {babyPhotoPreview ? (
                    <img
                      src={babyPhotoPreview}
                      alt="Baby"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">👶</span>
                      <p className="text-sm text-gray-600 font-medium">
                        Upload Baby Photo
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="babyPhoto"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t flex justify-between items-center max-w-md mx-auto">
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
            : subStep === SUB_STEPS.PHOTOS
            ? "Complete Stage 1"
            : "Continue"}
        </button>
      </footer>
    </div>
  );
};

export default BasicsForm;
