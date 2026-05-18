export const publisherNameRules = (label = "Name") => ({
  required: `${label} is required.`,
  validate: {
    notEmpty: v => v.trim() !== "" || `${label} cannot be empty.`,
    alphabetsOnly: v => /^[A-Za-z\s]+$/.test(v) || "Only alphabets and spaces allowed.",
    noEdgeSpaces: v => v.trim() === v || "No spaces at start or end.",
  },
});

export const publishingHouseRules = {
  required: "Publishing house name is required.",
  validate: {
    notEmpty: v => v.trim() !== "" || "Publishing house cannot be empty.",
    allowedChars: v =>
      /^[A-Za-z0-9\s]+$/.test(v) ||
      "Only alphanumeric characters and spaces allowed.",
    noEdgeSpaces: v => v.trim() === v || "No spaces at start or end.",
  },
};

export const currentPasswordRules = {
  required: "Current password is required to update profile.",
  minLength: { value: 3, message: "Password must be at least 3 characters." },
};

export const newPasswordRules = {
  validate: {
    minLengthIfProvided: v =>
      v === "" || v.length >= 3 || "New password must be at least 3 characters.",
  },
};

export const confirmNewPasswordRules = (getNewPassword) => ({
  validate: {
    matches: v =>
      v === "" ||
      v === getNewPassword() ||
      "Passwords do not match.",
  },
});

export const emailRules = {
  required: "Email is required.",
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Invalid email address.",
  },
  validate: {
    lowercaseOnly: v => v === v.toLowerCase() || "Uppercase not allowed in email.",
    noEdgeSpaces: v => v.trim() === v || "No spaces at start or end.",
  },
};

// Utility function to trim all string fields
export const trimPayload = (data) => {
  const trimmed = {};
  for (const key in data) {
    if (typeof data[key] === 'string') {
      trimmed[key] = data[key].trim();
    } else {
      trimmed[key] = data[key];
    }
  }
  return trimmed;
};
