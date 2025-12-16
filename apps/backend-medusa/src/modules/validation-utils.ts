/**
 * Shared Validation Utilities for B2B Modules
 *
 * Provides common validation functions for input validation across
 * all B2B module services.
 *
 * @packageDocumentation
 */

/**
 * Custom validation error with field information
 */
export class ValidationError extends Error {
  public readonly field: string;
  public readonly code: string;

  constructor(message: string, field: string, code = "VALIDATION_ERROR") {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.code = code;
  }
}

/**
 * Validates that a value is provided (not undefined, null, or empty string).
 *
 * @param value - The value to validate
 * @param fieldName - The field name for error messages
 * @throws ValidationError if the value is not provided
 */
export function validateRequired(value: unknown, fieldName: string): void {
  if (value === undefined || value === null || value === "") {
    throw new ValidationError(`${fieldName} is required`, fieldName, "REQUIRED");
  }
}

/**
 * Validates that a string is not empty and within length bounds.
 *
 * @param value - The string to validate
 * @param fieldName - The field name for error messages
 * @param minLength - Minimum length (default: 1)
 * @param maxLength - Maximum length (default: 200)
 * @throws ValidationError if the string is invalid
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  minLength = 1,
  maxLength = 200
): void {
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`, fieldName, "INVALID_TYPE");
  }

  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} character(s)`,
      fieldName,
      "TOO_SHORT"
    );
  }

  if (trimmed.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${maxLength} characters`,
      fieldName,
      "TOO_LONG"
    );
  }
}

/**
 * Validates that a value is a valid email format.
 *
 * @param email - The email to validate
 * @param fieldName - The field name for error messages (default: "email")
 * @throws ValidationError if the email format is invalid
 */
export function validateEmail(email: string, fieldName = "email"): void {
  if (typeof email !== "string") {
    throw new ValidationError(`${fieldName} must be a string`, fieldName, "INVALID_TYPE");
  }

  // Standard email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new ValidationError(`Invalid ${fieldName} format`, fieldName, "INVALID_EMAIL");
  }
}

/**
 * Validates that a value is a positive number (> 0).
 *
 * @param value - The number to validate
 * @param fieldName - The field name for error messages
 * @throws ValidationError if the value is not a positive number
 */
export function validatePositive(value: number, fieldName: string): void {
  if (typeof value !== "number" || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number`, fieldName, "INVALID_TYPE");
  }

  if (value <= 0) {
    throw new ValidationError(`${fieldName} must be a positive number`, fieldName, "NOT_POSITIVE");
  }
}

/**
 * Validates that a value is a non-negative number (>= 0).
 *
 * @param value - The number to validate
 * @param fieldName - The field name for error messages
 * @throws ValidationError if the value is negative
 */
export function validateNonNegative(value: number, fieldName: string): void {
  if (typeof value !== "number" || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number`, fieldName, "INVALID_TYPE");
  }

  if (value < 0) {
    throw new ValidationError(`${fieldName} must be non-negative`, fieldName, "NEGATIVE");
  }
}

/**
 * Validates that a value is within a range (inclusive).
 *
 * @param value - The number to validate
 * @param fieldName - The field name for error messages
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @throws ValidationError if the value is out of range
 */
export function validateRange(
  value: number,
  fieldName: string,
  min: number,
  max: number
): void {
  if (typeof value !== "number" || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number`, fieldName, "INVALID_TYPE");
  }

  if (value < min || value > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max}`,
      fieldName,
      "OUT_OF_RANGE"
    );
  }
}

/**
 * Validates that an array is not empty.
 *
 * @param array - The array to validate
 * @param fieldName - The field name for error messages
 * @throws ValidationError if the array is empty or not an array
 */
export function validateNonEmptyArray(array: unknown[], fieldName: string): void {
  if (!Array.isArray(array)) {
    throw new ValidationError(`${fieldName} must be an array`, fieldName, "INVALID_TYPE");
  }

  if (array.length === 0) {
    throw new ValidationError(`${fieldName} must not be empty`, fieldName, "EMPTY_ARRAY");
  }
}

/**
 * Validates that a date is in the future.
 *
 * @param date - The date to validate
 * @param fieldName - The field name for error messages
 * @throws ValidationError if the date is not in the future
 */
export function validateFutureDate(date: Date | string, fieldName: string): void {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date`, fieldName, "INVALID_DATE");
  }

  if (dateObj <= new Date()) {
    throw new ValidationError(`${fieldName} must be a future date`, fieldName, "NOT_FUTURE");
  }
}

/**
 * Validates a phone number format (basic validation).
 * Allows digits, spaces, dashes, parentheses, and plus sign.
 *
 * @param phone - The phone number to validate
 * @param fieldName - The field name for error messages (default: "phone")
 * @throws ValidationError if the phone format is invalid
 */
export function validatePhone(phone: string, fieldName = "phone"): void {
  if (typeof phone !== "string") {
    throw new ValidationError(`${fieldName} must be a string`, fieldName, "INVALID_TYPE");
  }

  // Basic phone validation: allows +, digits, spaces, dashes, parentheses
  // Minimum 6 digits for a valid phone number
  const phoneRegex = /^[+]?[\d\s\-().]{6,}$/;
  const digitsOnly = phone.replace(/\D/g, "");

  if (!phoneRegex.test(phone) || digitsOnly.length < 6) {
    throw new ValidationError(`Invalid ${fieldName} format`, fieldName, "INVALID_PHONE");
  }
}

/**
 * Validates an optional field only if it's provided.
 *
 * @param value - The value to validate (may be undefined)
 * @param validator - The validation function to apply if value is provided
 */
export function validateOptional<T>(
  value: T | undefined | null,
  validator: (val: T) => void
): void {
  if (value !== undefined && value !== null && value !== "") {
    validator(value);
  }
}
