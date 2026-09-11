export type FieldType = 'text' | 'dropdown' | 'date' | 'file' | 'radio' | 'checkbox' | 'repeatable' | 'unknown';

export interface Experience {
  company?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Education {
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

export interface ResumeData {
  name: {
    fullName: string;
    firstName: string;
    lastName: string;
  };
  email: string;
  phone: string;
  location: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: string[];
  links: {
    linkedin?: string;
    github?: string;
  };
}

export interface WorkdayField {
  id: string;
  label: string;
  description?: string;
  type: FieldType;
  required: boolean;
  currentValue: string;
  options?: string[];
  element?: HTMLElement;
  placeholder?: string;
  accessibleName?: string;
  valuePath?: string;
}

export interface FieldMapping {
  source: string;
  target: string;
  confidence: number;
  reason: string;
}

export interface MappingResult {
  matchedField: string;
  value: string;
  confidence: number;
  reason: string;
  requiresAttention: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export type AutomationStep =
  | 'idle'
  | 'loading'
  | 'detecting'
  | 'mapping'
  | 'filling'
  | 'validating'
  | 'review'
  | 'awaiting-confirmation'
  | 'submitted'
  | 'stopped';

export interface AutomationState {
  step: AutomationStep;
  status: string;
  fieldsDetected: number;
  fieldsMapped: number;
  fieldsFilled: number;
  fieldsRequiringAttention: number;
  isRunning: boolean;
  isAuthenticated: boolean;
  startedAt?: number;
}

export interface QuestionAnswer {
  questionId: string;
  question: string;
  answer?: string;
  source: 'auto' | 'user' | 'unknown';
  confidence: number;
  requiresAttention: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: 'yes-no' | 'multiple-choice' | 'free-text' | 'voluntary' | 'eeo' | 'custom';
  required?: boolean;
  options?: string[];
  answer?: QuestionAnswer;
}

export interface ResumeParseResult {
  data: ResumeData;
  errors: string[];
  warnings: string[];
  rawText?: string;
}
