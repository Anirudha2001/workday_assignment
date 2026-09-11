import type { ResumeData, WorkdayField } from '../types/resume';
import type { FieldMapping, MappingResult } from '../types/resume';

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const synonymMap: Record<string, string> = {
  firstname: 'firstName',
  givenname: 'firstName',
  first: 'firstName',
  lastname: 'lastName',
  familyname: 'lastName',
  surname: 'lastName',
  emailaddress: 'email',
  email: 'email',
  phone: 'phone',
  mobilenumber: 'phone',
  phonenumber: 'phone',
  linkedin: 'linkedin',
  linkedinprofile: 'linkedin',
  github: 'github',
  githubprofile: 'github',
  city: 'location',
  location: 'location',
  currentlocation: 'location',
  role: 'title',
  workexperience: 'experience',
  education: 'education',
  school: 'education'
};

const MATCH_RULES = [
  { key: 'firstName', patterns: ['given name', 'first name'] },
  { key: 'lastName', patterns: ['family name', 'last name', 'surname'] },
  { key: 'email', patterns: ['email', 'email address'] },
  { key: 'phone', patterns: ['phone', 'mobile', 'telephone', 'cell'] },
  { key: 'location', patterns: ['location', 'city', 'current location'] },
  { key: 'linkedin', patterns: ['linkedin', 'linkedin profile'] },
  { key: 'github', patterns: ['github', 'github profile'] },
  { key: 'experience', patterns: ['experience', 'work experience'] },
  { key: 'education', patterns: ['school', 'education', 'degree'] }
];

export const normalizeFieldLabel = (label: string): string => normalize(label);

export const heuristicMapField = (field: WorkdayField, resume: ResumeData): MappingResult => {
  const normalized = normalize(field.label || field.description || field.accessibleName || '');
  const matched = MATCH_RULES.find((rule) => rule.patterns.some((pattern) => normalized.includes(pattern)));

  if (matched) {
    const value = getResumeValueForField(matched.key, resume);
    return {
      matchedField: matched.key,
      value,
      confidence: value ? 0.92 : 0.35,
      reason: `Heuristic match based on normalized label '${field.label}'.`,
      requiresAttention: !value
    };
  }

  const labelKey = synonymMap[normalized.replace(/\s+/g, '')] ?? '';
  if (labelKey) {
    const value = getResumeValueForField(labelKey, resume);
    return {
      matchedField: labelKey,
      value,
      confidence: value ? 0.86 : 0.26,
      reason: `Normalized synonym mapping for '${field.label}'.`,
      requiresAttention: !value
    };
  }

  return {
    matchedField: '',
    value: '',
    confidence: 0,
    reason: 'No heuristic match found.',
    requiresAttention: true
  };
};

export const getResumeValueForField = (key: string, resume: ResumeData): string => {
  switch (key) {
    case 'firstName':
      return resume.name.firstName;
    case 'lastName':
      return resume.name.lastName;
    case 'email':
      return resume.email;
    case 'phone':
      return resume.phone;
    case 'location':
      return resume.location;
    case 'linkedin':
      return resume.links.linkedin ?? '';
    case 'github':
      return resume.links.github ?? '';
    case 'experience':
      return resume.experience[0]?.title ?? '';
    case 'education':
      return resume.education[0]?.degree ?? '';
    default:
      return '';
  }
};

export const createFieldMapping = (source: string, target: string, confidence: number, reason: string): FieldMapping => ({
  source,
  target,
  confidence,
  reason
});
