// client/src/pages/buyer/profile/profileValidation.js

// Validation Rules
export const firstnameRules = {
  required: "First name is required",
  pattern: {
    value: /^[A-Za-z\s]+$/,
    message: "Only alphabets and spaces allowed"
  },
  validate: {
    noEdgeSpaces: v => v.trim() === v || "No spaces at start or end"
  }
};

export const lastnameRules = {
  required: "Last name is required",
  pattern: {
    value: /^[A-Za-z\s]+$/,
    message: "Only alphabets and spaces allowed"
  },
  validate: {
    noEdgeSpaces: v => v.trim() === v || "No spaces at start or end"
  }
};

export const emailRules = {
  required: "Email is required",
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Invalid email address"
  },
  validate: {
    lowercaseOnly: v => v === v.toLowerCase() || "Uppercase not allowed",
    noEdgeSpaces: v => v.trim() === v || "No spaces at start or end"
  }
};

export const currentPasswordRules = {
  required: "Current password is required",
  minLength: { 
    value: 3, 
    message: "Minimum 3 characters required" 
  }
};

export const newPasswordRules = {
  minLength: { 
    value: 3, 
    message: "Minimum 3 characters required" 
  }
};

export const confirmPasswordRules = (newPassword) => ({
  validate: v => {
    if (!newPassword) return true; // Skip if no new password
    return v === newPassword || "Passwords do not match";
  }
});

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
