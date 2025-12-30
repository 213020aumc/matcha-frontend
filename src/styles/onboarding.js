// --- STYLES FOR PHASE 1: INITIAL WIZARD (Splash, Gender, Role Selection) ---
export const initialStyles = {
  // Containers
  pageContainer: "min-h-screen bg-gray-50 flex flex-col",
  loadingContainer:
    "min-h-screen flex flex-col items-center justify-center bg-gray-50",
  splashContainer:
    "min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 p-6 text-center",
  contentContainer: "flex-1 p-6 w-full max-w-lg mx-auto relative",

  // Header & Footer (Wizard Specific)
  header: "p-4 flex items-center gap-4 border-b bg-white sticky top-0 z-10",
  footer: "p-4 border-t bg-white sticky bottom-0 z-20",
  footerInner: "max-w-lg mx-auto",

  // Typography
  heading: "text-2xl font-bold text-gray-900 mb-2",
  subHeading: "text-gray-500 mb-6",
  splashHeading: "text-3xl font-bold text-gray-900 mb-3",
  splashText: "text-gray-600 max-w-md mb-8",

  // Components
  splashIcon: "w-16 h-16 text-primary mb-6",
  loadingIcon: "w-12 h-12 text-primary animate-spin mb-4",

  // Navigation
  backButton:
    "p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer",

  // Progress Bar (Wizard Style)
  progressContainer: "w-full bg-gray-200 rounded-full h-2",
  progressBar: "bg-primary h-2 rounded-full transition-all duration-300",
  progressFill: (percentage) => ({ width: `${percentage}%` }),

  // Buttons (Wizard Style)
  primaryButton: `
    bg-primary text-white font-semibold py-3 px-10 rounded-full shadow-lg 
    hover:bg-primary/90 transition-all cursor-pointer
  `,
  actionButton: `
    w-full bg-primary text-white font-semibold py-3 px-6 rounded-xl shadow-md 
    hover:bg-primary/90 transition-all 
    disabled:opacity-50 disabled:cursor-not-allowed 
    flex items-center justify-center gap-2 cursor-pointer
  `,

  // Cards (Selection Logic)
  optionCard: (isSelected, isDisabled) => `
    w-full p-4 rounded-xl border-2 text-left transition-all
    flex items-center gap-4
    ${
      isSelected
        ? "border-primary bg-primary/5 shadow-md"
        : "border-gray-200 bg-white hover:border-gray-300"
    }
    ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
  `,
  multiSelectBox: (isSelected) => `
    w-6 h-6 rounded border-2 flex items-center justify-center transition-all 
    ${isSelected ? "bg-primary border-primary" : "border-gray-300"}
  `,
};

export const formStyles = {
  // --- Containers ---
  pageContainer: "flex-1 flex flex-col min-h-full bg-gray-50",
  contentContainer: "flex-1 p-6 w-full max-w-lg mx-auto",
  loadingContainer:
    "flex-1 flex flex-col items-center justify-center bg-gray-50",

  // --- Header & Footer ---
  header: "pt-8 px-6 w-full max-w-lg mx-auto",
  footer: "sticky bottom-0 z-10 w-full bg-white border-t border-gray-200",
  footerInner:
    "w-full max-w-lg mx-auto flex justify-between items-center p-4 md:p-6",

  // --- Typography ---
  heading: "text-2xl font-bold text-gray-900 mb-2",
  subHeading: "text-gray-500 text-sm mb-6",
  sectionLabel: "text-gray-400 text-xs uppercase tracking-wide mb-1",

  // --- Modal / Popup Styles ---
  popupOverlay:
    "absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-6 animate-fade-in",
  popupContainer:
    "bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center",
  popupTitle: "text-lg font-bold text-gray-900 mb-2",
  popupText: "text-gray-600 text-sm mb-6 leading-relaxed",
  popupButton:
    "w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors cursor-pointer",

  // --- Photo Upload Card (Specific to Stage 2 Photos) ---
  photoUploadCard: `
    border border-gray-200 rounded-2xl h-32 flex flex-col items-center justify-center 
    cursor-pointer hover:bg-gray-50 transition-colors
  `,
  photoUploadIcon: "text-2xl text-primary mb-2",
  photoUploadText: "text-sm font-medium text-gray-600",

  // --- Section Headers within forms ---
  subSectionTitle:
    "text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block",
  subSectionDesc: "text-xs text-gray-400 mb-3",

  // --- Custom Switch (Privacy Toggle) ---
  privacySwitchBase:
    "relative inline-block w-10 h-6 transition duration-200 ease-in-out bg-primary rounded-full cursor-pointer",
  privacySwitchKnob:
    "absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow",
  privacyLabel: "text-gray-700 font-medium text-sm",

  // --- Custom Checkbox (Chronic Conditions) ---
  checkboxLabel: "flex items-start gap-3 cursor-pointer group",
  checkboxBox: (isChecked) => `
    w-6 h-6 rounded border flex items-center justify-center mt-0.5 shrink-0 transition-colors
    ${
      isChecked
        ? "bg-primary border-primary"
        : "border-gray-300 group-hover:border-gray-400"
    }
  `,
  checkboxCheck: "text-white text-xs font-bold",
  checkboxText: "text-gray-600 text-sm leading-snug",

  // --- Radio Inputs ---
  radioGroupContainer: "mb-6 animate-fade-in",
  radioGroupLabel: "text-gray-700 font-medium mb-3 text-sm",
  radioOptionsWrapper: "flex gap-6 mb-3",
  radioLabel: "flex items-center gap-2 cursor-pointer",
  radioInput:
    "w-5 h-5 text-primary border-gray-300 focus:ring-primary cursor-pointer",
  radioText: "text-gray-600 text-sm",

  // --- Form Elements ---
  inputGroup: "space-y-4",
  inputField: `
    w-full p-4 bg-white border border-gray-200 rounded-xl text-gray-900 
    placeholder-gray-400 outline-none transition-all
    focus:ring-2 focus:ring-primary focus:border-transparent
  `,
  textArea: `
    w-full h-auto min-h-[96px] p-4 bg-white border border-gray-200 rounded-xl 
    focus:ring-2 focus:ring-primary focus:border-transparent 
    outline-none resize-none text-gray-900 text-sm mt-3
  `,

  inputLabel: "block text-sm font-medium text-gray-600 mb-1 ml-1",
  requiredStar: "text-red-500",

  charCount: "text-right text-xs text-gray-400 mt-2",

  // --- Privacy Switch ---
  privacyWrapper: "flex items-center gap-2 mb-8",
  privacyLabel: "text-gray-700 font-medium text-sm",
  privacySwitchBase:
    "relative inline-block w-10 h-6 transition duration-200 ease-in-out bg-primary rounded-full cursor-pointer",
  privacySwitchKnob:
    "absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow",

  // --- Modal / Popup ---
  popupOverlay:
    "absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-6 animate-fade-in",
  popupContainer:
    "bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center",
  popupTitle: "text-lg font-bold text-gray-900 mb-2",
  popupText: "text-gray-600 text-sm mb-6 leading-relaxed",
  popupButton:
    "w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors",

  // --- Toggle Buttons (Yes/No/NotSure) ---
  toggleContainer: "flex gap-2 flex-wrap",
  toggleButton: (isActive) => `
    flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all min-w-[80px]
    ${
      isActive
        ? "border-primary bg-primary/5 text-primary"
        : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
    }
  `,

  // --- Toggle Buttons (Driver's License vs Passport) ---
  toggleContainer: "flex gap-3 mt-2",
  toggleButton: (isActive) => `
    flex-1 p-3 rounded-xl border-2 transition-all font-medium text-sm
    ${
      isActive
        ? "border-primary bg-primary/5 text-primary"
        : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
    }
  `,

  // --- NEW: File Upload Areas ---
  uploadLabel: `
    flex flex-col items-center justify-center w-full h-48 
    border-2 border-dashed border-gray-300 bg-gray-50 
    rounded-3xl cursor-pointer hover:bg-white hover:border-primary 
    transition-all overflow-hidden relative mt-2
  `,
  uploadContent: "flex flex-col items-center p-4 text-center",
  uploadIcon: "text-4xl mb-2",
  uploadText: "text-sm text-gray-900 font-medium",
  uploadSubText: "text-xs text-gray-500 mt-1",
  previewImage: "w-full h-full object-cover",

  // Custom Select
  selectButton: (hasValue) => `
    w-full p-4 bg-white border border-gray-200 rounded-xl flex justify-between items-center 
    cursor-pointer hover:bg-gray-50 transition-colors
    ${hasValue ? "text-gray-900" : "text-gray-400"}
  `,
  selectDropdown:
    "absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto",
  selectOption: (isSelected) => `
    p-3 hover:bg-gray-50 cursor-pointer text-gray-700 text-sm
    ${isSelected ? "bg-primary/10 text-primary font-medium" : ""}
  `,

  // --- Search Elements ---
  searchContainer: "relative mb-6",
  searchIcon: "absolute left-4 top-4 text-gray-400",
  searchInput: `
    w-full pl-12 pr-4 py-4 bg-gray-50 rounded-full 
    border-none outline-none text-sm 
    focus:ring-2 focus:ring-primary placeholder-gray-400
  `,
  searchClear:
    "absolute right-4 top-4 text-gray-400 font-bold hover:text-gray-600 cursor-pointer",

  // --- Autocomplete Results ---
  resultsDropdown:
    "absolute left-0 right-0 z-20 bg-white border border-gray-100 shadow-xl rounded-2xl max-h-64 overflow-y-auto mt-1",
  resultItem:
    "p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 flex justify-between items-center",
  noResults: "p-4 text-sm text-gray-400",

  // --- Selected Chips (Tags) ---
  chipContainer: "flex flex-wrap gap-2 mb-6",
  chipLabel: "text-xs font-bold text-gray-500 uppercase mb-3",
  chip: "bg-primary text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-sm shadow-md",
  chipRemove: "text-white/80 hover:text-white cursor-pointer",

  // --- Info / Tip Boxes ---
  infoBox: "mt-6 p-4 bg-gray-50 rounded-xl",
  infoText: "text-gray-600 text-sm",

  // --- File Status Boxes ---
  fileStatusBox: (type) => `
    mb-4 p-3 rounded-lg flex items-center justify-between
    ${
      type === "success"
        ? "bg-green-50 border border-green-200 text-green-700"
        : ""
    }
    ${
      type === "active" ? "bg-blue-50 border border-blue-200 text-blue-700" : ""
    }
  `,

  // --- Genetic Footer Layout ---
  // A vertical stack wrapper for the footer content (Upload Button + Nav Buttons)
  footerStack: "w-full max-w-lg mx-auto flex flex-col gap-4 p-4 md:p-6",

  // The large gray upload button
  secondaryActionButton: `
    w-full py-4 rounded-full bg-gray-100 hover:bg-gray-200 
    text-gray-700 font-semibold flex items-center justify-center gap-2 
    cursor-pointer transition-colors
  `,

  // --- Buttons ---
  backButton:
    "px-8 py-3 rounded-full border border-primary text-primary font-semibold hover:bg-gray-50 transition-colors cursor-pointer",
  nextButton:
    "px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",

  buttonRow: "flex justify-between items-center w-full",

  // --- Feedback ---
  successBox:
    "mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2",

  // --- Common ---
  errorBox:
    "mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm",
  loadingIcon: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary",
  progressBarContainer:
    "w-full bg-gray-200 h-1 mb-6 rounded-full overflow-hidden",
  progressBarFill: (percentage) => ({ width: `${percentage}%` }),
  backButton:
    "px-8 py-3 rounded-full border border-primary text-primary font-semibold hover:bg-gray-50 transition-colors cursor-pointer",
  nextButton:
    "px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",

  // --- Progress Bar ---
  progressBarContainer:
    "w-full bg-gray-200 h-1 mb-6 rounded-full overflow-hidden",
  progressBarFill: (percentage) => ({ width: `${percentage}%` }),

  // --- Toggle Switch (iOS Style) ---
  // Container for the whole toggle row
  toggleRow: "flex items-center gap-3",

  // The label text next to the toggle
  toggleLabel: (isChecked) => `
    text-sm ${!isChecked ? "font-semibold text-gray-900" : "text-gray-400"}
  `,

  // The switch background (pill)
  switchTrack: (isChecked) => `
    relative w-12 h-7 rounded-full transition-colors duration-200 cursor-pointer
    ${isChecked ? "bg-primary" : "bg-gray-300"}
  `,

  // The switch knob (circle)
  switchKnob: (isChecked) => `
    absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
    ${isChecked ? "left-6" : "left-1"}
  `,

  // --- Disclaimer Text ---
  disclaimerBox: "mt-10 text-gray-400 text-xs space-y-2",

  // --- Layout Helper for Bidding Section ---
  biddingSection: "animate-fade-in space-y-6",
  biddingRow: "flex items-center justify-between pt-4 border-t border-gray-100",
  biddingLabel: "text-gray-700 font-medium text-sm",

  // --- Legal / Consent Elements ---
  consentBox:
    "mb-8 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100",
  consentLabel: "flex items-start gap-3 cursor-pointer select-none",
  consentCheckCircle: (isChecked) => `
    mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-all
    ${isChecked ? "bg-primary border-primary" : "border-gray-300"}
  `,
  consentCheckIcon: "text-white text-xs font-bold",
  consentText: "text-sm text-gray-700",
  consentLink:
    "text-primary underline mt-1 font-medium text-xs bg-transparent border-none p-0 cursor-pointer",

  divider: "border-gray-100 mb-8",

  // --- Anonymity Preference Cards ---
  anonymityWrapper: "space-y-6",
  anonymityLabel: "text-gray-500 text-sm font-medium uppercase tracking-wide",

  anonymityCard: (isActive) => `
    flex items-start gap-4 cursor-pointer group p-4 rounded-xl border-2 transition-all 
    ${
      isActive
        ? "border-primary bg-primary/5"
        : "border-gray-200 hover:border-gray-300"
    }
  `,
  anonymityRadio: "mt-1 w-5 h-5 text-primary focus:ring-primary cursor-pointer",
  anonymityTitle: (isActive) => `
    block font-semibold mb-1 
    ${isActive ? "text-primary" : "text-gray-700"}
  `,
  anonymityDesc: "text-gray-500 text-sm leading-snug",

  // --- Success Modal ---
  successModalOverlay:
    "absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-6 animate-fade-in",
  successModalContent:
    "bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm text-center flex flex-col items-center",
  successIconContainer:
    "w-24 h-24 rounded-full bg-primary mb-6 flex items-center justify-center",
  successIcon: "text-white text-4xl",
  successTitle: "text-2xl font-bold text-gray-900 mb-3",
  successText: "text-gray-500 text-sm mb-8 leading-relaxed px-2",
  successButton:
    "w-full py-4 bg-primary text-white rounded-full font-bold text-lg shadow-xl hover:bg-primary/90 transition-all cursor-pointer",

  // --- Buttons (Submit State) ---
  submitButton: (isDisabled) => `
    px-8 py-3 rounded-full font-semibold shadow-lg transition-all
    ${
      isDisabled
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-primary text-white hover:bg-primary/90 cursor-pointer"
    }
  `,
};

export const statusStyles = {
  // --- Layout ---
  container: "max-w-4xl mx-auto px-4 py-12 min-h-screen",

  // --- Header Area
  headerRow: "flex justify-between items-center mb-8",
  pageTitle: "text-2xl font-bold text-gray-900",
  logoutButton:
    "flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors cursor-pointer",

  // --- Status Banner ---
  banner: (status) => {
    const colors = {
      PENDING_REVIEW: "bg-yellow-50 border-yellow-200 text-yellow-800",
      ACTIVE: "bg-green-50 border-green-200 text-green-800",
      REJECTED: "bg-red-50 border-red-200 text-red-800",
    };
    return `p-6 rounded-xl border ${
      colors[status] || colors.PENDING_REVIEW
    } mb-8 flex items-start gap-4 shadow-sm`;
  },
  iconWrapper: "mt-1 flex-shrink-0",
  bannerContent: "flex-1",
  bannerTitle: "text-lg font-bold mb-1",
  bannerText: "text-sm opacity-90 leading-relaxed",

  // --- Dashboard Grid ---
  sectionTitle: "text-xl font-bold text-gray-900 mb-6",
  grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",

  // --- Action Cards ---
  card: "bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col",
  cardIcon:
    "h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center text-primary mb-4",
  cardTitle: "font-semibold text-gray-900 mb-2",
  cardText: "text-sm text-gray-500 mb-6 flex-1",
  cardLink:
    "text-sm font-medium text-primary flex items-center gap-1 hover:underline mt-auto",
  fullWidthButton: "w-full text-sm",
};
