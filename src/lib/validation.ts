/**
 * Validation engine utilities for field validation
 */

import type { AgentField } from "@/types/agent";
import type { ParsedField } from "@/types/session";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  value: unknown;
}

/**
 * Validates a field value against its schema
 */
export function validateField(
  field: AgentField,
  value: unknown
): ValidationResult {
  // Handle required fields
  if (field.required) {
    if (value === null || value === undefined || value === '') {
      return {
        valid: false,
        error: `${field.label} is required`,
        value,
      };
    }
  }

  // Type-specific validation
  switch (field.type) {
    case 'email':
      return validateEmail(field, value);
    case 'phone':
      return validatePhone(field, value);
    case 'number':
      return validateNumber(field, value);
    case 'date':
      return validateDate(field, value);
    case 'select':
    case 'multi-select':
      return validateSelect(field, value);
    case 'checkbox':
      return validateCheckbox(field, value);
    case 'file':
      return validateFile(field, value);
    case 'text':
    default:
      return validateText(field, value);
  }
}

function validateEmail(field: AgentField, value: unknown): ValidationResult {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: 'Invalid email format', value };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { valid: false, error: 'Invalid email format', value };
  }

  // Custom regex validation if provided
  if (field.validation?.regex) {
    const regex = new RegExp(field.validation.regex);
    if (!regex.test(value)) {
      return {
        valid: false,
        error: field.validation.regex ? 'Email does not match required format' : 'Invalid email format',
        value,
      };
    }
  }

  return { valid: true, value };
}

function validatePhone(field: AgentField, value: unknown): ValidationResult {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: 'Invalid phone number format', value };
  }

  // Basic phone validation (allows various formats)
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(value)) {
    return { valid: false, error: 'Invalid phone number format', value };
  }

  // Custom regex validation if provided
  if (field.validation?.regex) {
    const regex = new RegExp(field.validation.regex);
    if (!regex.test(value)) {
      return {
        valid: false,
        error: 'Phone number does not match required format',
        value,
      };
    }
  }

  return { valid: true, value };
}

function validateNumber(field: AgentField, value: unknown): ValidationResult {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (typeof numValue !== 'number' || isNaN(numValue)) {
    return { valid: false, error: 'Must be a valid number', value };
  }

  if (field.validation?.min !== undefined && numValue < field.validation.min) {
    return {
      valid: false,
      error: `Must be at least ${field.validation.min}`,
      value,
    };
  }

  if (field.validation?.max !== undefined && numValue > field.validation.max) {
    return {
      valid: false,
      error: `Must be at most ${field.validation.max}`,
      value,
    };
  }

  return { valid: true, value: numValue };
}

function validateDate(_field: AgentField, value: unknown): ValidationResult {
  if (!value) {
    return { valid: false, error: 'Invalid date', value };
  }

  const date = value instanceof Date ? value : new Date(value as string);
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format', value };
  }

  return { valid: true, value: date.toISOString() };
}

function validateSelect(field: AgentField, value: unknown): ValidationResult {
  if (!field.validation?.options) {
    return { valid: true, value };
  }

  const options = field.validation.options.map(opt => opt.value);
  
  if (field.type === 'multi-select') {
    if (!Array.isArray(value)) {
      return { valid: false, error: 'Must be an array of selected values', value };
    }
    
    const invalidValues = value.filter(v => !options.includes(String(v)));
    if (invalidValues.length > 0) {
      return {
        valid: false,
        error: 'Contains invalid selection values',
        value,
      };
    }
  } else {
    if (!options.includes(String(value))) {
      return {
        valid: false,
        error: 'Invalid selection value',
        value,
      };
    }
  }

  return { valid: true, value };
}

function validateCheckbox(_field: AgentField, value: unknown): ValidationResult {
  if (typeof value !== 'boolean') {
    return { valid: false, error: 'Must be a boolean value', value };
  }

  return { valid: true, value };
}

function validateFile(_field: AgentField, value: unknown): ValidationResult {
  if (!value) {
    return { valid: false, error: 'File is required', value };
  }

  // File validation would typically happen on the server
  // This is a basic check
  if (value instanceof File) {
    return { valid: true, value };
  }

  if (typeof value === 'string') {
    // Assume it's a file URL or ID
    return { valid: true, value };
  }

  return { valid: false, error: 'Invalid file', value };
}

function validateText(field: AgentField, value: unknown): ValidationResult {
  // field is used in validation checks below
  if (typeof value !== 'string') {
    return { valid: false, error: 'Must be text', value };
  }

  // Custom regex validation
  if (field.validation?.regex) {
    const regex = new RegExp(field.validation.regex);
    if (!regex.test(value)) {
      return {
        valid: false,
        error: 'Text does not match required format',
        value,
      };
    }
  }

  // Length validation
  if (field.validation?.min !== undefined && value.length < field.validation.min) {
    return {
      valid: false,
      error: `Must be at least ${field.validation.min} characters`,
      value,
    };
  }

  if (field.validation?.max !== undefined && value.length > field.validation.max) {
    return {
      valid: false,
      error: `Must be at most ${field.validation.max} characters`,
      value,
    };
  }

  return { valid: true, value };
}

/**
 * Validates all parsed fields against their field schemas
 */
export function validateParsedFields(
  fields: AgentField[],
  parsedFields: ParsedField[]
): ParsedField[] {
  return parsedFields.map((parsedField) => {
    const field = fields.find((f) => f.id === parsedField.field_id);
    if (!field) {
      return parsedField;
    }

    const validation = validateField(field, parsedField.value);
    return {
      ...parsedField,
      validated: validation.valid,
      validation_error: validation.error,
      value: validation.value as string | string[] | boolean | number,
    };
  });
}

/**
 * Checks if all required fields are collected and validated
 */
export function areAllRequiredFieldsCollected(
  fields: AgentField[],
  parsedFields: ParsedField[]
): boolean {
  const requiredFields = fields.filter((f) => f.required);
  
  return requiredFields.every((field) => {
    const parsed = parsedFields.find((pf) => pf.field_id === field.id);
    return parsed && parsed.validated;
  });
}
