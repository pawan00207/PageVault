// checkoutValidations.js
// Centralized validation rules for Checkout.jsx (React Hook Form)

// --------------------------
//  ADDRESS VALIDATIONS
// --------------------------

// Full name validation aligned with auth basicNameRules (alphabets + spaces only)
export const nameRules = {
  required: "Full name is required.",
  validate: {
    notEmpty: (v) => v.trim() !== "" || "Full name cannot be empty.",
    alphabetsOnly: (v) => /^[A-Za-z\s]+$/.test(v) || "Only alphabets and spaces allowed.",
    minLen: (v) => v.trim().length >= 3 || "Full name must be at least 3 characters.",
  },
};

export const phoneRules = {
  required: "Phone number is required.",
  pattern: {
    value: /^\+?[0-9]{10}$/,
    message: "Phone number must be exactly 10 digits.",
  },
};

export const longAddressRules = {
  required: "Address is required.",
  validate: {
    min10: (v) =>
      v.trim().length >= 10 || "Address must be at least 10 characters long.",
  },
};

export const cityStateRules = (label) => ({
  required: `${label} is required.`,
  validate: {
    alphaOnly: (v) =>
      /^[A-Za-z\s]+$/.test(v) ||
      `${label} must contain only alphabets and spaces.`,
  },
});

export const postalCodeRules = {
  required: "Postal code is required.",
  pattern: {
    // Indian PIN code: 6 digits, cannot start with 0
    value: /^[1-9][0-9]{5}$/,
    message: "Postal code must be a valid 6-digit PIN.",
  },
  validate: {
    notAllSame: (v) => !/^([0-9])\1{5}$/.test(v) || "Postal code cannot be all identical digits.",
    noSequential: (v) =>
      !/(012345|123456|234567|345678|456789|987654|876543|765432|654321)/.test(v) ||
      "Postal code appears invalid (sequential digits).",
  },
};

// --------------------------
//  CARD VALIDATIONS
// --------------------------

/** Luhn algorithm for card validation */
export const validateLuhn = (num) => {
  let sum = 0;
  let shouldDouble = false;

  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

export const cardNumberRules = {
  required: "Card number is required.",
  pattern: { value: /^[0-9]{16}$/, message: "Card number must be 16 digits." },
  validate: {
    luhnCheck: (v) => validateLuhn(v) || "Invalid card number.",
  },
};

export const expiryRules = {
  required: "Expiry date is required.",
  pattern: {
    value: /^(0[1-9]|1[0-2])\/[0-9]{2}$/,
    message: "Expiry date must be in MM/YY format.",
  },
  validate: {
    futureDate: (v) => {
      const [mm, yy] = v.split("/").map(Number);
      const now = new Date();
      const exp = new Date(2000 + yy, mm - 1);

      return exp >= new Date(now.getFullYear(), now.getMonth())
        ? true
        : "Card has expired.";
    },
  },
};

export const cvvRules = {
  required: "CVV is required.",
  pattern: { value: /^[0-9]{3}$/, message: "CVV must be exactly 3 digits." },
};

// --------------------------
//  UPI VALIDATION
// --------------------------

export const upiRules = {
  required: "UPI ID is required.",
  pattern: {
    value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/,
    message: "Enter a valid UPI ID (example: username@bank).",
  },
  validate: {
    lowercase: (v) =>
      v === v.toLowerCase() || "UPI ID must be lowercase (auto-convert allowed).",
  },
};

// --------------------------
//  UTIL: TRIMMER
// --------------------------

export const trimCheckoutPayload = (data, fields) => {
  const out = { ...data };
  fields.forEach((f) => {
    if (typeof out[f] === "string") out[f] = out[f].trim();
  });
  return out;
};
