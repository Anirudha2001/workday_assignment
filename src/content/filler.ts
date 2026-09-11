import type { ResumeData, WorkdayField } from '../types/resume';
import { logger } from '../utils/logger';

const setNativeValue = (element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string) => {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (valueSetter && prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else {
    (element as HTMLInputElement).value = value;
  }
};

export const fillFieldValue = (field: WorkdayField, value: string): boolean => {
  const element = field.element as HTMLElement | undefined;
  if (!element) return false;

  const current = (element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value ?? '';
  if (current && current.trim() && !/\bN\/A\b|\bUnknown\b/i.test(current)) {
    return false;
  }

  try {
    if (field.type === 'dropdown' || (element instanceof HTMLSelectElement)) {
      const select = element as HTMLSelectElement;
      const option = Array.from(select.options).find((opt) => opt.textContent?.toLowerCase().includes(value.toLowerCase()));
      if (option) {
        select.value = option.value || value;
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }

    if (field.type === 'radio') {
      const input = element as HTMLInputElement;
      if (input && input.type === 'radio') {
        input.checked = true;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }

    if (field.type === 'checkbox') {
      const input = element as HTMLInputElement;
      if (input && input.type === 'checkbox') {
        input.checked = Boolean(value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }

    if (field.type === 'date') {
      const input = element as HTMLInputElement;
      if (input && input.type === 'date') {
        setNativeValue(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      setNativeValue(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    if (element instanceof HTMLElement) {
      element.setAttribute('value', value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Failed to fill field', field.label, error);
    return false;
  }
};

export const autofillResumeIntoField = (field: WorkdayField, value: string): boolean => {
  if (!value || !field.element) return false;
  return fillFieldValue(field, value);
};

export const fillResumeFields = (fields: WorkdayField[], resume: ResumeData, mappings: Record<string, string>): number => {
  let filled = 0;

  fields.forEach((field) => {
    const mappedValue = mappings[field.label] || mappings[field.id];
    if (!mappedValue) return;
    const success = autofillResumeIntoField(field, mappedValue);
    if (success) filled += 1;
  });

  return filled;
};
