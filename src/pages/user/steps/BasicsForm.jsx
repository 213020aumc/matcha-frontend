import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../services/api";
import { useAuthStore } from "../../../store/authStore";
import { Button } from "../../../components/ui/Button";
import { cardStyles, formStyles } from "../../../styles/theme";

const styles = {
  grid: "grid grid-cols-1 md:grid-cols-2 gap-6",
  fullWidth: "col-span-1 md:col-span-2",
  section: "space-y-6",
};

export const BasicsForm = () => {
  const navigate = useNavigate();
  const { updateUserStep } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    legalName: "",
    dob: "",
    phoneNumber: "",
    address: "",
  });

  // Fetch existing data
  useEffect(() => {
    apiClient.get("/user/profile/basics").then((res) => {
      if (res.data.data) {
        // Format Date for Input (YYYY-MM-DD)
        const formattedData = { ...res.data.data };
        if (formattedData.dob) {
          formattedData.dob = new Date(formattedData.dob)
            .toISOString()
            .split("T")[0];
        }
        setData(formattedData);
      }
    });
  }, []);

  const handleSubmit = async (isComplete) => {
    setLoading(true);
    try {
      await apiClient.put("/user/profile/basics", {
        ...data,
        isComplete,
      });

      if (isComplete) {
        // Note: Stage 1 also involves Photos & ID, usually.
        // If 'Basics' is just Step 0.1, you might route to '/onboarding/photos' next.
        // Assuming strictly linear 1 -> 2 based on your previous 'Step 1' definition:
        updateUserStep(1);
        navigate("/onboarding/background"); // Or next sub-step
      } else {
        alert("Draft saved!");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save basic info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cardStyles.wrapper}>
      <div className={cardStyles.header}>
        <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
        <p className="text-sm text-gray-500">
          Let's start with your legal identity details.
        </p>
      </div>

      <div className={cardStyles.body}>
        <form className={styles.section}>
          <div className={styles.grid}>
            {/* Legal Name */}
            <div className={styles.fullWidth}>
              <label className={formStyles.label}>Full Legal Name</label>
              <input
                type="text"
                className={formStyles.input}
                placeholder="As it appears on your ID"
                value={data.legalName}
                onChange={(e) =>
                  setData({ ...data, legalName: e.target.value })
                }
              />
            </div>

            {/* DOB */}
            <div>
              <label className={formStyles.label}>Date of Birth</label>
              <input
                type="date"
                className={formStyles.input}
                value={data.dob}
                onChange={(e) => setData({ ...data, dob: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div>
              <label className={formStyles.label}>Phone Number</label>
              <input
                type="tel"
                className={formStyles.input}
                placeholder="+1 (555) 000-0000"
                value={data.phoneNumber}
                onChange={(e) =>
                  setData({ ...data, phoneNumber: e.target.value })
                }
              />
            </div>

            {/* Address */}
            <div className={styles.fullWidth}>
              <label className={formStyles.label}>Residential Address</label>
              <textarea
                rows={3}
                className={formStyles.input}
                placeholder="Street address, City, State, Zip"
                value={data.address}
                onChange={(e) => setData({ ...data, address: e.target.value })}
              />
            </div>
          </div>
        </form>
      </div>

      <div className={cardStyles.footer}>
        <Button
          variant="secondary"
          onClick={() => handleSubmit(false)}
          isLoading={loading}
        >
          Save Draft
        </Button>
        <Button onClick={() => handleSubmit(true)} isLoading={loading}>
          Next Step
        </Button>
      </div>
    </div>
  );
};
