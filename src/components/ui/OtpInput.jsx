import { useRef, useEffect } from "react";

export const OtpInput = ({ length = 6, value, onChange, disabled }) => {
  const inputRefs = useRef([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (index, e) => {
    const val = e.target.value;
    if (isNaN(val)) return; // Only allow numbers

    const newOtp = [...value.split("")];
    // Allow only last entered character
    newOtp[index] = val.substring(val.length - 1);

    // Call parent onChange
    const combined = newOtp.join("");
    onChange(combined);

    // Auto focus next input
    if (val && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle Backspace
    if (
      e.key === "Backspace" &&
      !value[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .slice(0, length)
      .replace(/\D/g, "");
    if (pastedData) onChange(pastedData);
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength={1}
          value={value[index] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
        />
      ))}
    </div>
  );
};
