import { describe, expect, it } from 'vitest';
import { parseResumeText } from '../parser/resumeParser';

describe('Resume parsing normalization', () => {
  it('extracts candidate fields from text', () => {
    const text = `
      Jane Doe
      jane@example.com
      +1 (415) 555-0101
      San Francisco, CA
      Skills: React, TypeScript, Node.js
      LinkedIn: https://www.linkedin.com/in/janedoe
      GitHub: https://github.com/janedoe
    `;

    const result = parseResumeText(text);
    expect(result.data.name.fullName).toContain('Jane');
    expect(result.data.email).toContain('jane@example.com');
    expect(result.data.phone).toContain('415');
    expect(result.data.skills.some((skill) => skill.toLowerCase().includes('react'))).toBeTruthy();
  });
});
