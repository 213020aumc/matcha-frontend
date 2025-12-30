import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { apiClient } from "../../../services/api";
import { formStyles as styles } from "../../../styles/onboarding";

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
    docType: "",
    babyPhoto: null,
    currentPhoto: null,
  });

  const [babyPhotoPreview, setBabyPhotoPreview] = useState(null);
  const [currentPhotoPreview, setCurrentPhotoPreview] = useState(null);
  const [existingIdDoc, setExistingIdDoc] = useState(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        setIsLoading(true);
        const [basicRes, photosRes, identityRes] = await Promise.allSettled([
          apiClient.get("/user/profile/stage-1/basics"),
          apiClient.get("/user/profile/stage-1/photos"),
          apiClient.get("/user/profile/stage-1/identity"),
        ]);

        if (basicRes.status === "fulfilled" && basicRes.value.data?.data) {
          const d = basicRes.value.data.data;
          setFormData((prev) => ({
            ...prev,
            fullName: d.legalName || "",
            dob: d.dob?.split("T")[0] || "",
            phone: d.phoneNumber || "",
            address: d.address || "",
          }));
        }

        if (photosRes.status === "fulfilled" && photosRes.value.data?.data) {
          const d = photosRes.value.data.data;
          if (d.babyPhotoUrl) setBabyPhotoPreview(d.babyPhotoUrl);
          if (d.currentPhotoUrl) setCurrentPhotoPreview(d.currentPhotoUrl);
        }

        if (
          identityRes.status === "fulfilled" &&
          identityRes.value.data?.data?.hasIdentityDoc
        ) {
          setExistingIdDoc(identityRes.value.data.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExistingData();
  }, []);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setError(null);

    if (files && files[0]) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });

      if (name === "babyPhoto") setBabyPhotoPreview(URL.createObjectURL(file));
      else if (name === "currentPhoto")
        setCurrentPhotoPreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNext = async () => {
    setError(null);

    // Validation Steps
    if (subStep === SUB_STEPS.PERSONAL) {
      if (!formData.fullName.trim())
        return setError("Please enter your full name.");
      if (!formData.dob) return setError("Please enter your date of birth.");
      setSubStep(SUB_STEPS.CONTACT);
      return;
    }

    if (subStep === SUB_STEPS.CONTACT) {
      if (!formData.email.trim()) return setError("Please enter your email.");
      setSubStep(SUB_STEPS.IDENTITY);
      return;
    }

    if (subStep === SUB_STEPS.IDENTITY) {
      setSubStep(SUB_STEPS.PHOTOS);
      return;
    }

    // Submission Step
    if (subStep === SUB_STEPS.PHOTOS) {
      if (!formData.currentPhoto && !currentPhotoPreview) {
        return setError("Please upload a current photo of yourself.");
      }

      setIsSubmitting(true);
      try {
        // 1. Save Basics
        await apiClient.post("/user/profile/stage-1/basics", {
          legalName: formData.fullName,
          dob: formData.dob,
          phoneNumber: formData.phone,
          address: formData.address,
          isComplete: true,
        });

        // 2. Save Identity (if new file)
        if (formData.idDocument) {
          const docData = new FormData();
          docData.append("document", formData.idDocument);
          docData.append("type", formData.docType);
          await apiClient.post("/user/profile/stage-1/identity", docData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        // 3. Save Photos (if new files)
        if (formData.babyPhoto || formData.currentPhoto) {
          const photoData = new FormData();
          if (formData.babyPhoto) photoData.append("baby", formData.babyPhoto);
          if (formData.currentPhoto)
            photoData.append("current", formData.currentPhoto);
          photoData.append("isComplete", "true");

          await apiClient.post("/user/profile/stage-1/photos", photoData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        updateUserStep(1);
        navigate("/onboarding/background");
      } catch (err) {
        console.error(err);
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

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingIcon}></div>
      </div>
    );
  }

  const progressPercent = ((subStep + 1) / 4) * 100;

  return (
    <div className={styles.pageContainer}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.progressBarContainer}>
          <div
            className="bg-primary h-full transition-all duration-300"
            style={styles.progressBarFill(progressPercent)}
          ></div>
        </div>
        <p className={styles.sectionLabel}>
          Stage 1 of 6 • Step {subStep + 1} of 4
        </p>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="w-full max-w-lg mx-auto px-6 mt-4">
          <div className={styles.errorBox}>{error}</div>
        </div>
      )}

      {/* CONTENT */}
      <main className={styles.contentContainer}>
        {/* --- STEP 1: PERSONAL --- */}
        {subStep === SUB_STEPS.PERSONAL && (
          <div className="animate-fade-in">
            <h1 className={styles.heading}>Let's start with the basics</h1>
            <p className={styles.subHeading}>
              Please use the information that appears on your government-issued
              ID.
            </p>

            <div className={styles.inputGroup}>
              <div>
                <label className={styles.inputLabel}>Full Legal Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  className={styles.inputField}
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={styles.inputLabel}>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  className={styles.inputField}
                  value={formData.dob}
                  onChange={handleChange}
                  max={getMaxDate()}
                />
                <p className="text-xs text-gray-400 mt-1 ml-1">
                  You must be at least 18 years old
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: CONTACT --- */}
        {subStep === SUB_STEPS.CONTACT && (
          <div className="animate-fade-in">
            <h1 className={styles.heading}>Contact Information</h1>
            <p className={styles.subHeading}>How can we reach you?</p>

            <div className={styles.inputGroup}>
              <div>
                <label className={styles.inputLabel}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  className={styles.inputField}
                  value={formData.email}
                  disabled // Disabled style handled in onboarding.js
                />
                <p className="text-xs text-gray-400 mt-1 ml-1">
                  Email from your account
                </p>
              </div>
              <div>
                <label className={styles.inputLabel}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="(555) 123-4567"
                  className={styles.inputField}
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={styles.inputLabel}>Current Address</label>
                <textarea
                  name="address"
                  placeholder="Enter your full address"
                  className={styles.textArea}
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 3: IDENTITY --- */}
        {subStep === SUB_STEPS.IDENTITY && (
          <div className="animate-fade-in">
            <h1 className={styles.heading}>Verify Your Identity</h1>
            <p className={styles.subHeading}>
              Upload a clear photo of your government-issued ID.
            </p>

            {existingIdDoc && (
              <div className={styles.successBox}>
                <span>✓</span> Identity document uploaded ({existingIdDoc.type})
              </div>
            )}

            <div className={styles.inputGroup}>
              <div>
                <label className={styles.inputLabel}>Document Type</label>
                <div className={styles.toggleContainer}>
                  {["DRIVER_LICENSE", "PASSPORT"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, docType: type })
                      }
                      className={styles.toggleButton(formData.docType === type)}
                    >
                      {type === "DRIVER_LICENSE"
                        ? "Driver's License"
                        : "Passport"}
                    </button>
                  ))}
                </div>
              </div>

              <label className={styles.uploadLabel}>
                <div className={styles.uploadContent}>
                  <span className={styles.uploadIcon}>📄</span>
                  <p className={styles.uploadText}>
                    {formData.idDocument
                      ? formData.idDocument.name
                      : "Click to Upload Document"}
                  </p>
                  <p className={styles.uploadSubText}>
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
          </div>
        )}

        {/* --- STEP 4: PHOTOS --- */}
        {subStep === SUB_STEPS.PHOTOS && (
          <div className="animate-fade-in">
            <h1 className={styles.heading}>Add Your Photos</h1>
            <p className={styles.subHeading}>
              Help others get to know you better.
            </p>

            <div className={styles.inputGroup}>
              {/* Current Photo */}
              <div>
                <label className={styles.inputLabel}>
                  Current Photo <span className={styles.requiredStar}>*</span>
                </label>
                <label className={styles.uploadLabel}>
                  {currentPhotoPreview ? (
                    <img
                      src={currentPhotoPreview}
                      alt="Current"
                      className={styles.previewImage}
                    />
                  ) : (
                    <div className={styles.uploadContent}>
                      <span className={styles.uploadIcon}>📷</span>
                      <p className={styles.uploadText}>Upload Current Photo</p>
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

              {/* Baby Photo */}
              <div>
                <label className={styles.inputLabel}>
                  Baby Photo (Optional)
                </label>
                <label className={styles.uploadLabel}>
                  {babyPhotoPreview ? (
                    <img
                      src={babyPhotoPreview}
                      alt="Baby"
                      className={styles.previewImage}
                    />
                  ) : (
                    <div className={styles.uploadContent}>
                      <span className={styles.uploadIcon}>👶</span>
                      <p className={styles.uploadText}>Upload Baby Photo</p>
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

      {/* FOOTER */}
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
              : subStep === SUB_STEPS.PHOTOS
              ? "Complete Stage 1"
              : "Continue"}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default BasicsForm;
