/**
 * Validation utilities for user inputs
 */

const MAX_NAME_LENGTH = 255;
const VALID_NAME_PATTERN = /^[^\\/:*?"<>|]+$/; // Windows-safe characters

export type ValidationResult = {
  valid: boolean;
  error?: string;
};

/**
 * Validate folder/file name
 */
export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: "Name cannot be empty" };
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: `Name is too long (max ${MAX_NAME_LENGTH} characters)`,
    };
  }

  if (!VALID_NAME_PATTERN.test(trimmed)) {
    return {
      valid: false,
      error: 'Names cannot contain: \\ / : * ? " < > |',
    };
  }

  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(
  size: number,
  maxSize: number
): ValidationResult {
  if (size > maxSize) {
    const maxMB = Math.round(maxSize / 1024 / 1024);
    return { valid: false, error: `File is too large (max ${maxMB}MB)` };
  }
  return { valid: true };
}

/**
 * Validate file type
 */
export function validateFileType(
  type: string,
  allowedTypes: string[]
): ValidationResult {
  if (!allowedTypes.includes(type)) {
    return {
      valid: false,
      error: "Only PDF files are supported",
    };
  }
  return { valid: true };
}
