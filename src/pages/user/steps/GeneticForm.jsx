import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GENETIC_MARKERS } from "../../../constants/onboarding";
import API from "../../../services/api";
import { useAuthStore } from "../../../store/authStore";

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

  // Fetch existing genetic data on mount
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
      // Create FormData for file upload
      const formData = new FormData();

      // Add genetic markers (conditions) as JSON array
      const conditions = selectedMarkers.map((m) => m.id);
      formData.append("conditions", JSON.stringify(conditions));

      // Add file if uploaded
      if (geneticReportFile) {
        formData.append("geneticReport", geneticReportFile);
      }

      // Mark as complete
      formData.append("isComplete", "true");

      await API.post("/user/profile/stage-4/genetic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Stage 4 Complete! Navigating to Stage 5...");
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#483d8b]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans relative">
      {/* Header */}
      <div className="pt-6 px-6">
        <div className="w-full bg-gray-200 h-1 mb-6">
          <div className="bg-[#483d8b] h-1 w-2/3 transition-all duration-300"></div>
        </div>
        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
          Stage 4 of 6 • Genetic Profile
        </p>
      </div>

      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <main className="flex-1 px-6 pb-48 overflow-y-auto relative">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Genetic Profile (CGT)
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Are you a carrier for any genetic conditions?
        </p>

        {/* Search Input */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-4 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search for a condition or gene (e.g. CFTR)"
            value={searchTerm}
            onChange={handleSearch}
            onFocus={() => searchTerm && setShowResults(true)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-full border-none outline-none text-sm focus:ring-2 focus:ring-[#483d8b]"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setShowResults(false);
              }}
              className="absolute right-4 top-4 text-gray-400 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Selected Chips */}
        {selectedMarkers.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">
              Selected Conditions ({selectedMarkers.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedMarkers.map((marker) => (
                <div
                  key={marker.id}
                  className="bg-[#483d8b] text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-sm shadow-md"
                >
                  <span>{marker.label}</span>
                  <button
                    onClick={() => removeMarker(marker.id)}
                    className="text-white/80 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Autocomplete Dropdown */}
        {showResults && (
          <div className="absolute left-6 right-6 z-10 bg-white border border-gray-100 shadow-xl rounded-2xl max-h-64 overflow-y-auto">
            {filteredMarkers.length > 0 ? (
              filteredMarkers.map((marker) => (
                <div
                  key={marker.id}
                  onClick={() => toggleMarker(marker)}
                  className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                >
                  <span className="font-medium">{marker.label}</span>
                  {marker.gene && (
                    <span className="text-gray-400 ml-2">({marker.gene})</span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-gray-400">
                No results found for "{searchTerm}"
              </div>
            )}
          </div>
        )}

        {/* Existing Report Status */}
        {existingReportUrl && !geneticReportFile && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">
              ✓ Genetic report already uploaded
            </p>
          </div>
        )}

        {/* New File Upload Status */}
        {geneticReportFile && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <p className="text-blue-700 text-sm">📄 {geneticReportFile.name}</p>
            <button
              onClick={() => setGeneticReportFile(null)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Remove
            </button>
          </div>
        )}

        {/* Info Text */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-gray-600 text-sm">
            💡 <strong>Tip:</strong> If you've done carrier genetic testing
            (CGT), you can upload your full report for a more complete profile.
          </p>
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 p-6 bg-white flex flex-col gap-4 border-t">
        <label className="w-full py-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
          <span>📤</span>
          {geneticReportFile || existingReportUrl
            ? "Replace Genetic Report"
            : "Upload Genetic Report"}
          <input
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <div className="flex justify-between items-center w-full">
          <button
            onClick={handleBack}
            className="px-8 py-3 rounded-full border border-[#483d8b] text-[#483d8b] font-semibold"
            disabled={isSubmitting}
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-full bg-[#483d8b] text-white font-semibold shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default GeneticForm;
