// Shared validation utilities for auth forms (React Hook Form rules)
// Each function returns an object usable directly in register(..., rules)

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailRules = {
  required: 'Email is required.',
  pattern: { value: emailRegex, message: 'Please enter a valid email address.' },
  validate: {
    lowercaseOnly: v => v === v.toLowerCase() || 'Uppercase letters are not allowed.',
    noEdgeSpaces: v => v.trim() === v || 'Email cannot contain leading or trailing spaces.'
  }
};

export const basicNameRules = (fieldLabel) => ({
  required: `${fieldLabel} is required.`,
  validate: {
    notEmpty: v => v.trim() !== '' || `${fieldLabel} cannot be empty.`,
    alphabetsOnly: v => /^[A-Za-z\s]+$/.test(v) || 'Only alphabets and spaces allowed.'
  }
});

export const publishingHouseRules = {
  required: 'Publishing house name is required.',
  validate: {
    notEmpty: v => v.trim() !== '' || 'Publishing house name cannot be empty.',
    allowedChars: v => /^[A-Za-z0-9\s]+$/.test(v) || 'Only alphanumeric and spaces allowed.'
  }
};

export const passwordRules = {
  required: 'Password is required.',
  minLength: { value: 3, message: 'Password must be at least 3 characters long.' },
  validate: {
    noEdgeSpaces: v => v.trim() === v || 'Password cannot start or end with spaces.'
  }
};

export const confirmPasswordRules = (getPassword) => ({
  required: 'Please confirm your password.',
  validate: v => v === getPassword() || 'Passwords do not match.'
});

export const termsRules = {
  required: 'You must agree to the Terms and Privacy Policy.'
};

export const trimPayload = (data, fields) => {
  const out = { ...data };
  fields.forEach(f => { if (typeof out[f] === 'string') out[f] = out[f].trim(); });
  return out;
};
