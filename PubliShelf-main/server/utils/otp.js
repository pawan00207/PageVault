export const generateNumericOtp = (length = 6) => {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
};

export const normalizeEmail = (email) => String(email || "").trim().toLowerCase();