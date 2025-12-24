// src/pages/user/InitialOnboarding.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/Button";

export const InitialOnboarding = () => {
  const navigate = useNavigate();
  const { fetchMe } = useAuthStore();
  const [formData, setFormData] = useState({
    role: "DONOR",
    termsAccepted: false,
  });

  const handleSubmit = async () => {
    try {
      await apiClient.post("/user/onboarding/submit", {
        ...formData,
        // Add other fields like serviceType, gender if needed
      });

      // Refresh user state to update 'termsAccepted' flag
      await fetchMe();
      navigate("/onboarding/basics");
    } catch (error) {
      console.error(error);
      alert("Failed to submit onboarding");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Welcome to Helix</h1>
      <p className="mb-6 text-gray-600">Let's get you set up.</p>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-2">I am joining as a:</label>
          <select
            className="w-full border rounded p-2"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="DONOR">Donor</option>
            <option value="ASPIRING_PARENT">Aspiring Parent</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-indigo-600"
            checked={formData.termsAccepted}
            onChange={(e) =>
              setFormData({ ...formData, termsAccepted: e.target.checked })
            }
          />
          <label className="ml-2 text-sm text-gray-700">
            I accept the Terms & Conditions
          </label>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!formData.termsAccepted}
          className="w-full"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};
