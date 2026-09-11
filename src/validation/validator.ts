import type { ValidationResult, WorkdayField } from '../types/resume';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateFieldValue = (field: WorkdayField, value: string): string[] => {
  const errors: string[] = [];

  if (field.required && !value?.trim()) {
    errors.push(`${field.label || 'This field'} is required.`);
  }

  if (field.type === 'dropdown' && field.required && !value?.trim()) {
    errors.push(`Select a value for ${field.label || 'this dropdown'}.`);
  }

  if (field.label.toLowerCase().includes('email') && value && !emailPattern.test(value)) {
    errors.push('Email format is invalid.');
  }

  if (field.label.toLowerCase().includes('phone') && value && value.replace(/\D/g, '').length < 10) {
    errors.push('Phone number format is invalid.');
  }

  return errors;
};

export const validateFields = (fields: WorkdayField[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  fields.forEach((field) => {
    const fieldErrors = validateFieldValue(field, field.currentValue);
    errors.push(...fieldErrors);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};
