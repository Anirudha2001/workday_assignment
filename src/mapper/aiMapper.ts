import type { ResumeData, WorkdayField } from '../types/resume';
import type { MappingResult } from '../types/resume';

export const aiMapField = async (
  field: WorkdayField,
  resume: ResumeData,
  options?: { threshold?: number; aiService?: (payload: unknown) => Promise<unknown> }
): Promise<MappingResult> => {
  const threshold = options?.threshold ?? 0.68;
  const aiService = options?.aiService ?? null;

  if (!aiService) {
    return {
      matchedField: '',
      value: '',
      confidence: 0,
      reason: 'AI mapping service is unavailable.',
      requiresAttention: true
    };
  }

  try {
    const payload = {
      resume,
      field: {
        label: field.label,
        description: field.description,
        type: field.type,
        options: field.options ?? []
      }
    };

    const result = await aiService(payload) as {
      matchedField?: string;
      value?: string;
      confidence?: number;
      reason?: string;
    };

    const confidence = typeof result?.confidence === 'number' ? result.confidence : 0;
    const value = typeof result?.value === 'string' ? result.value : '';
    const matchedField = typeof result?.matchedField === 'string' ? result.matchedField : '';

    return {
      matchedField,
      value,
      confidence,
      reason: result?.reason ?? 'AI mapping completed.',
      requiresAttention: confidence < threshold || !matchedField || !value
    };
  } catch (error) {
    return {
      matchedField: '',
      value: '',
      confidence: 0,
      reason: error instanceof Error ? error.message : 'AI mapping failed.',
      requiresAttention: true
    };
  }
};
