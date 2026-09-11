import { describe, expect, it } from 'vitest';
import { parseResumeText } from '../parser/resumeParser';

describe('Real-world resume parsing', () => {
  it('handles contact blocks and education extraction without junk text', () => {
    const text = `Anirudha Chhagan Kurhe SAP MM Consultant | Buyer | Purchase-to-Pay (P2P) (+91) 7498123901 | ac.kurhe42@gmail.com | Mumbai, Maharashtra, India n PROFESSIONAL SUMMARY Procurement professional ... n EDUCATION Bachelor of Technology / B.E. – Sanjivani College of Engineering, Kopargaon, Maharashtra – 2023 n HSC (XIIth), Maharashtra Board – 2019 | SSC (Xth), Maharashtra Board – 2017 n ADDITIONAL INFORMATION`;

    const result = parseResumeText(text);
    expect(result.data.name.fullName).toContain('Anirudha');
    expect(result.data.email).toContain('ac.kurhe42@gmail.com');
    expect(result.data.education[0]?.degree || '').toMatch(/Bachelor|B\.E|B\.Tech/i);
    expect(result.data.education[0]?.institution || '').toMatch(/Sanjivani/i);
  });
});
