import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../services/api";
import { useAuthStore } from "../../../store/authStore";
import { Button } from "../../../components/ui/Button";
import { formStyles, cardStyles } from "../../../styles/theme";

// Web-Specific Styles
const styles = {
  grid: "grid grid-cols-1 md:grid-cols-2 gap-6", // 2 Columns on Desktop
  sectionTitle: "text-lg font-semibold text-gray-900 mb-4 mt-8 pb-2 border-b",
  fullWidth: "col-span-1 md:col-span-2",
};

export const HealthForm = () => {
  const navigate = useNavigate();
  const { updateUserStep } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    diabetes: false,
    heart: false,
    allergies: false,
    allergiesDetails: "",
    majorSurgeries: "",
  });

  // Load existing data on mount
  useEffect(() => {
    apiClient.get("/user/profile/health").then((res) => {
      if (res.data.data) {
        // Map backend booleans correctly
        setData(res.data.data);
      }
    });
  }, []);

  const handleSubmit = async (isComplete) => {
    setLoading(true);
    try {
      await apiClient.put("/user/profile/health", {
        ...data,
        isComplete, // <--- EXPLICIT STATE FLAG
      });

      if (isComplete) {
        updateUserStep(3); // Optimistically update store to Step 3 (Genetic)
        navigate("/onboarding/genetic");
      } else {
        alert("Draft saved!");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving health data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cardStyles.wrapper}>
      <div className={cardStyles.header}>
        <h2 className="text-xl font-bold text-gray-800">Health History</h2>
        <p className="text-sm text-gray-500">
          Your privacy is our priority. This data is encrypted.
        </p>
      </div>

      <div className={cardStyles.body}>
        {/* SECTION 1: Conditions */}
        <h3 className={styles.sectionTitle}>Chronic Conditions</h3>
        <div className={styles.grid}>
          {/* Card-like Checkbox */}
          <label className={formStyles.checkboxWrapper}>
            <input
              type="checkbox"
              className={formStyles.checkbox}
              checked={data.diabetes}
              onChange={(e) => setData({ ...data, diabetes: e.target.checked })}
            />
            <div>
              <span className={formStyles.checkboxLabel}>Diabetes</span>
              <span className={formStyles.checkboxSub}>Type 1 or Type 2</span>
            </div>
          </label>

          <label className={formStyles.checkboxWrapper}>
            <input
              type="checkbox"
              className={formStyles.checkbox}
              checked={data.heart}
              onChange={(e) => setData({ ...data, heart: e.target.checked })}
            />
            <div>
              <span className={formStyles.checkboxLabel}>Heart Condition</span>
              <span className={formStyles.checkboxSub}>
                Arrhythmia, murmur, etc.
              </span>
            </div>
          </label>
        </div>

        {/* SECTION 2: Details */}
        <h3 className={styles.sectionTitle}>Detailed History</h3>
        <div className={styles.grid}>
          {/* Full Width Text Area */}
          <div className={styles.fullWidth}>
            <label className={formStyles.label}>Major Surgeries</label>
            <textarea
              className={formStyles.input}
              rows={3}
              placeholder="List any major surgeries and dates..."
              value={data.majorSurgeries}
              onChange={(e) =>
                setData({ ...data, majorSurgeries: e.target.value })
              }
            />
          </div>

          {/* Conditional Input */}
          <label className={formStyles.checkboxWrapper}>
            <input
              type="checkbox"
              className={formStyles.checkbox}
              checked={data.allergies}
              onChange={(e) =>
                setData({ ...data, allergies: e.target.checked })
              }
            />
            <span className={formStyles.checkboxLabel}>
              Do you have allergies?
            </span>
          </label>

          {data.allergies && (
            <div>
              <label className={formStyles.label}>Allergy Details</label>
              <input
                type="text"
                className={formStyles.input}
                placeholder="e.g. Peanuts, Penicillin"
                value={data.allergiesDetails}
                onChange={(e) =>
                  setData({ ...data, allergiesDetails: e.target.value })
                }
              />
            </div>
          )}
        </div>
      </div>

      <div className={cardStyles.footer}>
        <Button variant="secondary" onClick={() => handleSubmit(false)}>
          Save Draft
        </Button>
        <Button variant="primary" onClick={() => handleSubmit(true)}>
          Next Step
        </Button>
      </div>
    </div>
  );
};
