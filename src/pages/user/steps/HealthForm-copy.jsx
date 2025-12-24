// src/pages/user/steps/HealthForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../services/api";
import { useAuthStore } from "../../../store/authStore";
import { Button } from "../../../components/ui/Button";

export const HealthForm = () => {
  const navigate = useNavigate();
  const { updateUserStep } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // State for form fields
  const [data, setData] = useState({
    diabetes: false,
    allergies: false,
    allergiesDetails: "",
    // ... initialize other fields
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
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Health History</h2>

      {/* Form Fields */}
      <div className="grid grid-cols-1 gap-4">
        <label className="flex items-center space-x-3 p-4 border rounded hover:bg-gray-50">
          <input
            type="checkbox"
            checked={data.diabetes}
            onChange={(e) => setData({ ...data, diabetes: e.target.checked })}
            className="h-5 w-5 text-indigo-600"
          />
          <span className="text-gray-700">Do you have Diabetes?</span>
        </label>

        {/* ... More inputs ... */}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="secondary"
          onClick={() => handleSubmit(false)}
          isLoading={loading}
        >
          Save Draft
        </Button>
        <Button
          variant="primary"
          onClick={() => handleSubmit(true)}
          isLoading={loading}
        >
          Next: Genetic
        </Button>
      </div>
    </div>
  );
};
