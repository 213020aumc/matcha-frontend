export const authStyles = {
  // --- Layout ---
  pageContainer: "min-h-screen flex bg-white",

  // Left Side (Branding)
  brandSection:
    "hidden lg:flex lg:w-1/2 bg-primary items-center justify-center relative overflow-hidden",
  brandOverlay:
    "absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-700 opacity-90",
  brandContent: "relative z-10 text-white p-12 max-w-lg",
  brandTitle: "text-4xl font-bold mb-6",
  brandText: "text-lg text-indigo-100 leading-relaxed",

  // Right Side (Form)
  formSection:
    "w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-gray-50",
  card: "w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100",

  // --- Typography ---
  headerTitle: "text-2xl font-bold text-gray-900 tracking-tight text-center",
  headerSubtitle: "mt-2 text-sm text-gray-600 text-center",

  // --- Form Elements ---
  formGroup: "space-y-6",
  inputLabel: "block text-sm font-medium text-gray-700 mb-2",
  inputField: `
    w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
    focus:ring-2 focus:ring-primary focus:border-transparent 
    outline-none transition text-gray-900 placeholder-gray-400
  `,

  // --- OTP Specifics ---
  otpContainer: "flex justify-between gap-2 mb-6",
  otpInput: `
    w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold 
    bg-gray-50 border border-gray-200 rounded-xl 
    focus:ring-2 focus:ring-primary focus:border-transparent 
    outline-none transition caret-primary
  `,

  // --- Buttons ---
  primaryButton: `
    w-full py-4 bg-primary text-white rounded-xl font-semibold 
    hover:bg-primary/90 transition shadow-lg shadow-indigo-100
    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
  `,

  secondaryButton: `
    w-full py-3 text-gray-600 hover:text-gray-900 transition 
    flex items-center justify-center gap-2 cursor-pointer
  `,

  // --- Links & Timers ---
  resendContainer: "text-center mt-6 text-sm",
  resendText: "text-gray-500",
  resendLink: (disabled) => `
    font-semibold ml-1 transition-colors
    ${
      disabled
        ? "text-gray-400 cursor-not-allowed"
        : "text-primary hover:text-primary/80 cursor-pointer"
    }
  `,

  // --- Feedback ---
  errorBox:
    "p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm",
  loadingContainer: "min-h-screen flex items-center justify-center bg-gray-50",
  loadingSpinner:
    "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4",
};
