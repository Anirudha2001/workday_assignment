import type { FieldType, WorkdayField } from '../types/resume';
import { collectOptionsFromField, getNearestLabelText, getTextContent, isWorkdayPage } from './workdayUtils';

const getFieldType = (element: HTMLElement): FieldType => {
  const tag = element.tagName.toLowerCase();
  const inputType = (element as HTMLInputElement).type?.toLowerCase();

  if (tag === 'select') return 'dropdown';
  if (inputType === 'date') return 'date';
  if (inputType === 'file') return 'file';
  if (inputType === 'radio') return 'radio';
  if (inputType === 'checkbox') return 'checkbox';
  if (tag === 'textarea' || inputType === 'text' || inputType === 'email' || inputType === 'tel') return 'text';
  if (element.querySelector('input, select, textarea')) return 'repeatable';
  return 'unknown';
};

const getRequiredState = (element: HTMLElement): boolean => {
  const required = element.hasAttribute('required') || element.getAttribute('aria-required') === 'true';
  const text = (element.closest('div, section, li, fieldset')?.textContent ?? '').toLowerCase();
  return required || text.includes('required');
};

export const detectField = (element: HTMLElement): WorkdayField | null => {
  if (!isWorkdayPage()) return null;

  const tag = element.tagName.toLowerCase();
  const candidateTypes = ['input', 'select', 'textarea', 'button'];
  if (!candidateTypes.includes(tag) && !element.querySelector('input,select,textarea')) return null;

  const input = element.matches('input, select, textarea') ? element as HTMLInputElement | HTMLSelectElement : element.querySelector('input, select, textarea') as HTMLElement | null;
  if (!input) return null;

  const labelText = getNearestLabelText(input);
  const descriptionText = input.closest('[data-automation-id]')?.textContent || '';
  const value = (input as HTMLInputElement).value ?? (input as HTMLSelectElement).value ?? '';

  const field: WorkdayField = {
    id: input.id || `${Math.random().toString(36).slice(2)}-${Date.now()}`,
    label: labelText || input.getAttribute('aria-label') || input.getAttribute('name') || getTextContent(input.closest('label')) || 'Untitled field',
    description: descriptionText || undefined,
    type: getFieldType(input),
    required: getRequiredState(input),
    currentValue: value,
    options: collectOptionsFromField(input),
    element: input,
    placeholder: (input as HTMLInputElement).placeholder || undefined,
    accessibleName: input.getAttribute('aria-label') || undefined,
    valuePath: input.getAttribute('name') || undefined
  };

  return field;
};

export const detectWorkdayFields = (root: ParentNode = document): WorkdayField[] => {
  if (!isWorkdayPage()) return [];

  const selectors = [
    'input:not([type="hidden"])',
    'select',
    'textarea',
    'button',
    '[role="button"]',
    '[aria-label]',
    '[aria-labelledby]'
  ];

  const fields: WorkdayField[] = [];
  const seen = new Set<string>();

  selectors.forEach((selector) => {
    root.querySelectorAll(selector).forEach((item) => {
      const element = item as HTMLElement;
      const field = detectField(element);
      if (!field) return;
      const cacheKey = `${field.label}-${field.type}-${field.currentValue}-${field.valuePath || ''}`;
      if (!seen.has(cacheKey)) {
        seen.add(cacheKey);
        fields.push(field);
      }
    });
  });

  return fields.filter((field) => field.label && field.label !== 'Untitled field' || field.type !== 'unknown');
};
