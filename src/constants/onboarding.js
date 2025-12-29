// src/constants/onboarding.js

// Matches Prisma Enum: UserRole
export const USER_ROLES = {
  ADMIN: "ADMIN",
  DONOR: "DONOR",
  ASPIRING_PARENT: "ASPIRING_PARENT",
  SURROGATE: "SURROGATE", // Added to match Surrogacy flow
};

export const ONBOARDING_STEPS = {
  0: "BASICS",
  1: "BACKGROUND",
  2: "HEALTH",
  3: "GENETIC",
  4: "COMPENSATION",
  5: "LEGAL",
  6: "REVIEW",
};

export const STEP_ROUTES = {
  BASICS: "/onboarding/basics",
  BACKGROUND: "/onboarding/background",
  HEALTH: "/onboarding/health",
  GENETIC: "/onboarding/genetic",
  COMPENSATION: "/onboarding/compensation",
  LEGAL: "/onboarding/legal",
  REVIEW: "/profile/status",
};

// --- New Onboarding UI Constants ---

export const STEPS = {
  SPLASH: 0,
  GENDER: 1,
  SERVICE: 2,
  DONOR_ROLE: 3,
  SURROGACY_ROLE: 4,
};

// Matches Prisma Enum: Gender
export const GENDER_OPTIONS = [
  { id: "WOMAN", label: "Woman", icon: "♀️" },
  { id: "MAN", label: "Man", icon: "♂️" },
  { id: "OTHER", label: "Other (Trans, Agender...)", icon: "⚧️" },
];

// Matches Prisma Enum: ServiceType
export const SERVICE_OPTIONS = [
  {
    id: "DONOR_SERVICES", // ✅ Must match Prisma enum
    label: "Donor Services",
    desc: "Find a sperm or egg donor, or become a donor yourself",
    icon: "🧬",
  },
  {
    id: "SURROGACY_SERVICES", // ✅ Must match Prisma enum
    label: "Surrogacy Services",
    desc: "Find a surrogate carrier or offer to carry a pregnancy.",
    icon: "🤰",
  },
];

// NEW: Donor Role Options (Matches Prisma Enum: UserRole)
export const DONOR_ROLES = [
  {
    id: "DONOR",
    label: "I am a Donor",
    desc: "I want to donate sperm, eggs, or embryos",
    icon: "🧬",
  },
  {
    id: "ASPIRING_PARENT",
    label: "I am looking for a Donor",
    desc: "I want to find a sperm, egg, or embryo donor",
    icon: "👨‍👩‍👧",
  },
];

// NEW: Surrogacy Role Options (Matches Prisma Enum: UserRole)
export const SURROGACY_ROLES = [
  {
    id: "SURROGATE",
    label: "I am a Surrogate",
    desc: "I want to carry a pregnancy for someone else",
    icon: "🤰",
  },
  {
    id: "ASPIRING_PARENT",
    label: "I am looking for a Surrogate",
    desc: "I want to find a surrogate to carry my child",
    icon: "👨‍👩‍👧",
  },
];

// NEW: Add Gamete Options for interestedIn field
export const GAMETE_OPTIONS = [
  {
    id: "SPERM",
    label: "Sperm Donor",
    desc: "Looking for or offering sperm donation",
    icon: "🔬",
  },
  {
    id: "EGG",
    label: "Egg Donor",
    desc: "Looking for or offering egg donation",
    icon: "🥚",
  },
  {
    id: "EMBRYO",
    label: "Embryo Donor",
    desc: "Looking for or offering embryo donation",
    icon: "🧬",
  },
];

// NEW: Add Pairing Options for pairingTypes field
export const PAIRING_OPTIONS = [
  {
    id: "DONOR_BANK",
    label: "Donor Bank",
    desc: "Traditional anonymous donation through a clinic",
    icon: "🏥",
  },
  {
    id: "PRIVATE_DONATION_ONLY",
    label: "Private Donation Only",
    desc: "Direct donation without further involvement",
    icon: "🤝",
  },
  {
    id: "PRIVATE_CO_PARENTING",
    label: "Co-Parenting",
    desc: "Share parenting responsibilities together",
    icon: "👨‍👩‍👧",
  },
  {
    id: "PRIVATE_RELATIONSHIP",
    label: "Open to Relationship",
    desc: "Potential for a romantic relationship",
    icon: "💑",
  },
  {
    id: "PRIVATE_MARRIAGE",
    label: "Open to Marriage",
    desc: "Seeking a committed marriage partnership",
    icon: "💍",
  },
  {
    id: "PRIVATE_SURROGATE",
    label: "Surrogate Arrangement",
    desc: "Surrogacy-specific pairing",
    icon: "🤰",
  },
];

export const PHYSICAL_ATTRIBUTES = {
  // Matches Prisma Enum: HairColor
  HAIR_COLORS: [
    { id: "BLACK", label: "Black" },
    { id: "BROWN", label: "Brown" },
    { id: "BLONDE", label: "Blonde" },
    { id: "AUBURN", label: "Auburn" },
    { id: "RED", label: "Red" },
    { id: "GREY", label: "Grey" },
  ],
  // Matches Prisma Enum: EyeColor
  EYE_COLORS: [
    { id: "BLUE", label: "Blue" },
    { id: "BROWN", label: "Brown" },
    { id: "GREEN", label: "Green" },
    { id: "HAZEL", label: "Hazel" },
    { id: "BLACK", label: "Black" },
  ],
  // Matches Prisma Enum: BodyBuild
  BODY_BUILD: [
    { id: "SLIM", label: "Slim" },
    { id: "ATHLETIC", label: "Athletic" },
    { id: "AVERAGE", label: "Average" },
    { id: "CURVY", label: "Curvy" },
    { id: "LARGE", label: "Large" },
  ],
  // Matches Prisma Enum: Diet
  DIETS: [
    { id: "OMNIVORE", label: "Omnivore" },
    { id: "PESCATARIAN", label: "Pescatarian" },
    { id: "VEGETARIAN", label: "Vegetarian" },
    { id: "VEGAN", label: "Vegan" },
    { id: "KOSHER", label: "Kosher" },
    { id: "HALAL", label: "Halal" },
    { id: "GLUTEN_FREE", label: "Gluten-Free" },
  ],
  // Matches Prisma Enum: Ethnicity
  RACE: [
    { id: "ASIAN", label: "Asian" },
    { id: "BLACK", label: "Black/African" },
    { id: "CAUCASIAN", label: "White/Caucasian" },
    { id: "HISPANIC", label: "Hispanic/Latino" },
    { id: "OTHER", label: "Other" },
  ],
  // Matches Prisma Enum: Orientation
  ORIENTATION: [
    { id: "STRAIGHT", label: "Straight" },
    { id: "GAY", label: "Gay" },
    { id: "LESBIAN", label: "Lesbian" },
    { id: "BISEXUAL", label: "Bisexual" },
    { id: "OTHER", label: "Other" },
  ],
};

export const CHRONIC_CONDITIONS = [
  { id: "DIABETES", label: "Diabetes" },
  {
    id: "HEART_CONDITION",
    label: "Heart Condition (e.g., high blood pressure, arrhythmia)",
  },
  { id: "AUTOIMMUNE", label: "Autoimmune Disorder (e.g., Lupus, Crohn's)" },
  { id: "CANCER", label: "Cancer" },
  { id: "NEUROLOGICAL", label: "Neurological Disorder (e.g., Epilepsy, MS)" },
  {
    id: "RESPIRATORY",
    label: "Significant Respiratory Condition (e.g., Cystic Fibrosis)",
  },
  { id: "OTHER", label: "Other" },
];

export const GENETIC_MARKERS = [
  { id: "MKS1", label: "Meckel Syndrome Type 1 (MKS1)" },
  { id: "CFTR", label: "Cystic Fibrosis (CFTR)" },
  { id: "SMA", label: "Spinal Muscular Atrophy (SMN1)" },
  { id: "MCCC1", label: "3-Methylcrotonyl-CoA Carboxylase Deficiency (MCCC1)" },
  { id: "MCCC2", label: "3-Methylcrotonyl-CoA Carboxylase Deficiency (MCCC2)" },
  { id: "OPA3", label: "3-Methylglutaconic Aciduria Type III (OPA3)" },
];
