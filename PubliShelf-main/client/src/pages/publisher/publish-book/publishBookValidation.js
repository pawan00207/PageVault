// Shared regex helpers
export const alphabetsOnlyRegex = /^[A-Za-z\s]+$/;
export const descriptionRegex = /^[\p{L}\p{N}\p{P}\p{Zs}]+$/u;

// Acceptable image MIME types
export const IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
];

// Max size: 10MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

// Validate image (cover image)
export function validateBookImage(file) {
  if (!file) return "Please upload a cover image.";

  if (!IMAGE_MIME.includes(file.type)) {
    return "Only JPG, PNG, WebP, HEIC images are allowed.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image size cannot exceed 10MB.";
  }

  return null;
}

// Validate text fields like title/author/description
export function validateAlphaField(value, label, minLength) {
  const trimmed = value.trim();

  if (!trimmed) return `${label} is required.`;
  if (trimmed.length < minLength) return `${label} must be at least ${minLength} characters.`;
  if (!alphabetsOnlyRegex.test(trimmed)) return `${label} must contain only alphabets.`;

  return null;
}

// Validate description (Unicode-safe)
export function validateDescription(value) {
  const trimmed = value.trim();

  if (!trimmed) return "Description is required.";
  if (trimmed.length < 10) return "Description must be at least 10 characters.";
  if (!descriptionRegex.test(trimmed)) return "Description contains invalid characters.";

  return null;
}

// Validate numeric fields
export function validatePrice(price) {
  if (!price?.toString().trim()) return "Price is required.";

  const num = Number(price);

  if (isNaN(num) || num <= 0) return "Price must be a valid number greater than zero.";
  if (num > 100000) return "Price cannot exceed ₹100,000.";

  return null;
}

export function validateQuantity(qty) {
  if (!qty?.toString().trim()) return "Quantity is required.";

  const num = Number(qty);

  if (isNaN(num) || num <= 0) return "Quantity must be at least 1.";
  if (num > 10000) return "Quantity cannot exceed 10,000.";

  return null;
}
