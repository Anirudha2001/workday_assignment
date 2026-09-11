export interface WorkdayFieldMeta {
  id: string;
  label: string;
  description?: string;
  type: 'text' | 'dropdown' | 'date' | 'file' | 'radio' | 'checkbox' | 'repeatable' | 'unknown';
  required: boolean;
  currentValue: string;
  placeholder?: string;
  accessibleName?: string;
  options?: string[];
  valuePath?: string;
}

export interface AutomationStatusMessage {
  type: 'status' | 'field-detected' | 'mapping' | 'error' | 'review';
  payload?: unknown;
}
