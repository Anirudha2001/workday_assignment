import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { ResumeParseResult } from '../types/resume';
import { parseResumeText } from './resumeParser';

GlobalWorkerOptions.workerSrc = pdfWorker;

export const parsePdfText = async (file: File): Promise<ResumeParseResult> => {
  try {
    const bytes = await file.arrayBuffer();
    const loadingTask = getDocument({ data: new Uint8Array(bytes) });
    const pdf = await loadingTask.promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n';
    }

    if (!text.trim()) {
      throw new Error('No text could be extracted from the PDF.');
    }

    return parseResumeText(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown PDF parsing error';
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
