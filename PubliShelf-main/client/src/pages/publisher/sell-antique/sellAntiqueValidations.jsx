// Allowed authentication document + image types
export const AUTH_FILE_EXTENSIONS = [
  "pdf", "jpg", "jpeg", "png", "webp", "heic", "doc", "docx", "txt"
];

export const AUTH_FILE_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
];

// Max file size 10 MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
// Max number of authentication documents allowed
export const MAX_AUTH_DOCS = 5;

// Common regex
export const alphabetsOnlyRegex = /^[A-Za-z\s]+$/;
export const descriptionRegex = /^[\p{L}\p{N}\p{P}\p{Zs}]+$/u;
export const notOnlyDigits = /[^\d]/;

// Validate authentication file
export function validateAuthFile(file) {
  if (!file) return "Authentication document is required.";

  const ext = file.name.split(".").pop().toLowerCase();
  if (!AUTH_FILE_EXTENSIONS.includes(ext)) {
    return "Unsupported file format. Allowed: PDF, JPG, PNG, WebP, HEIC, DOC, DOCX, TXT.";
  }

  if (!AUTH_FILE_MIME.includes(file.type)) {
    return "Invalid file type.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File size exceeds 10MB.";
  }

  return null;
}

// Validate multiple authentication files
export function validateAuthFiles(files, maxCount = MAX_AUTH_DOCS) {
  if (!files || files.length === 0) return "At least one authentication document is required.";
  if (files.length > maxCount) return `You can upload up to ${maxCount} authentication documents.`;
  for (const file of files) {
    const err = validateAuthFile(file);
    if (err) return err;
  }
  return null;
}

// Validate item image (must be actual image)
export function validateItemImage(file) {
  if (!file) return "Item image is required.";

  if (!file.type.startsWith("image/")) {
    return "Only image formats are allowed for item image.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File size exceeds 10MB.";
  }

  return null;
}
