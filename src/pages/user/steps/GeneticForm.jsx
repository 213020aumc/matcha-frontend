import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GENETIC_MARKERS } from "../../../constants/onboarding";
import API from "../../../services/api";
import { useAuthStore } from "../../../store/authStore";
import { formStyles as styles } from "../../../styles/onboarding";

export const GeneticForm = () => {
  const navigate = useNavigate();
  const { updateUserStep } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [geneticReportFile, setGeneticReportFile] = useState(null);
  const [existingReportUrl, setExistingReportUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        setIsLoading(true);
        const { data } = await API.get("/user/profile/stage-4/genetic");

        if (data?.data) {
          const g = data.data;

          // Map carrier conditions back to marker objects
          if (g.carrierConditions && Array.isArray(g.carrierConditions)) {
            const markers = g.carrierConditions
              .map((code) => GENETIC_MARKERS?.find((m) => m.id === code))
              .filter(Boolean);
            setSelectedMarkers(markers);
          }

          if (g.reportFileUrl) {
            setExistingReportUrl(g.reportFileUrl);
          }
        }
      } catch (err) {
        console.error("Failed to fetch genetic data:", err);
        if (err.response?.status !== 404) {
          setError("Failed to load saved data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingData();
  }, []);

  // --- Handlers ---
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setShowResults(e.target.value.length > 0);
  };

  const toggleMarker = (marker) => {
    if (selectedMarkers.find((m) => m.id === marker.id)) {
      setSelectedMarkers(selectedMarkers.filter((m) => m.id !== marker.id));
    } else {
      setSelectedMarkers([...selectedMarkers, marker]);
    }
    setSearchTerm("");
    setShowResults(false);
  };

  const removeMarker = (id) => {
    setSelectedMarkers(selectedMarkers.filter((m) => m.id !== id));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setGeneticReportFile(file);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      const conditions = selectedMarkers.map((m) => m.id);
      formData.append("conditions", JSON.stringify(conditions));

      if (geneticReportFile) {
        formData.append("geneticReport", geneticReportFile);
      }
      formData.append("isComplete", "true");

      await API.post("/user/profile/stage-4/genetic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      updateUserStep(4);
      navigate("/onboarding/compensation");
    } catch (err) {
      console.error("Failed to save genetic data:", err);
      setError(
        err.response?.data?.message || "Failed to save. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/onboarding/health");
  };

  const filteredMarkers =
    GENETIC_MARKERS?.filter(
      (m) =>
        m.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedMarkers.find((selected) => selected.id === m.id)
    ) || [];

  // --- Loading ---
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingIcon}></div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.progressBarContainer}>
          <div
            className="bg-primary h-full transition-all duration-300"
            style={styles.progressBarFill(66)} // Stage 4 approx 66%
          ></div>
        </div>
        <p className={styles.sectionLabel}>Stage 4 of 6 • Genetic Profile</p>
      </div>

      {/* Error Box */}
      {error && (
        <div className="w-full max-w-lg mx-auto px-6 mt-4">
          <div className={styles.errorBox}>{error}</div>
        </div>
      )}

      {/* Main Content */}
      <main className={styles.contentContainer}>
        <h1 className={styles.heading}>Genetic Profile (CGT)</h1>
        <p className={styles.subHeading}>
          Are you a carrier for any genetic conditions?
        </p>

        {/* Search Input */}
        <div className={styles.searchContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search for a condition or gene (e.g. CFTR)"
            value={searchTerm}
            onChange={handleSearch}
            onFocus={() => searchTerm && setShowResults(true)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setShowResults(false);
              }}
              className={styles.searchClear}
            >
              ✕
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {showResults && (
            <div className={styles.resultsDropdown}>
              {filteredMarkers.length > 0 ? (
                filteredMarkers.map((marker) => (
                  <div
                    key={marker.id}
                    onClick={() => toggleMarker(marker)}
                    className={styles.resultItem}
                  >
                    <span className="font-medium">{marker.label}</span>
                    {marker.gene && (
                      <span className="text-gray-400 ml-2">
                        ({marker.gene})
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>
                  No results found for "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Chips */}
        {selectedMarkers.length > 0 && (
          <div className="mb-6">
            <p className={styles.chipLabel}>
              Selected Conditions ({selectedMarkers.length})
            </p>
            <div className={styles.chipContainer}>
              {selectedMarkers.map((marker) => (
                <div key={marker.id} className={styles.chip}>
                  <span>{marker.label}</span>
                  <button
                    onClick={() => removeMarker(marker.id)}
                    className={styles.chipRemove}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Report Status */}
        {existingReportUrl && !geneticReportFile && (
          <div className={styles.fileStatusBox("success")}>
            <span className="text-sm font-medium">
              ✓ Genetic report already uploaded
            </span>
          </div>
        )}

        {/* New File Upload Status */}
        {geneticReportFile && (
          <div className={styles.fileStatusBox("active")}>
            <span className="text-sm font-medium truncate max-w-50px">
              📄 {geneticReportFile.name}
            </span>
            <button
              onClick={() => setGeneticReportFile(null)}
              className="text-blue-600 hover:text-blue-800 text-sm font-bold ml-2"
            >
              Remove
            </button>
          </div>
        )}

        {/* Info Text */}
        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            💡 <strong>Tip:</strong> If you've done carrier genetic testing
            (CGT), you can upload your full report for a more complete profile.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerStack}>
          {/* Secondary Action: Upload */}
          <label className={styles.secondaryActionButton}>
            <span>📤</span>
            <span>
              {geneticReportFile || existingReportUrl
                ? "Replace Genetic Report"
                : "Upload Genetic Report"}
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Navigation Row */}
          <div className={styles.buttonRow}>
            <button
              onClick={handleBack}
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
        </div>
      </footer>
    </div>
  );
};

export default GeneticForm;
