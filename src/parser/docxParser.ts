import * as mammoth from 'mammoth';
import type { ResumeParseResult } from '../types/resume';
import { parseResumeText } from './resumeParser';

export const parseDocxText = async (file: File): Promise<ResumeParseResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value || '';

    if (!text.trim()) {
      throw new Error('No text could be extracted from the DOCX file.');
    }

    return parseResumeText(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown DOCX parsing error';
    return {
      data: {
        name: { fullName: '', firstName: '', lastName: '' },
        email: '',
        phone: '',
        location: '',
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        links: {}
      },
      errors: [message],
      warnings: [],
      rawText: ''
    };
  }
};
