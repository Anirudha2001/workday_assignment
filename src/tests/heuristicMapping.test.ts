import { describe, expect, it } from 'vitest';
import { heuristicMapField } from '../mapper/heuristicMapper';
import type { ResumeData, WorkdayField } from '../types/resume';

describe('Heuristic mapping', () => {
  it('matches common Workday labels to resume data', () => {
    const resume: ResumeData = {
      name: { fullName: 'Jane Doe', firstName: 'Jane', lastName: 'Doe' },
      email: 'jane@example.com',
      phone: '+1 (415) 555-0101',
      location: 'San Francisco, CA',
      experience: [{ company: 'Acme', title: 'Senior Engineer' }],
      education: [{ institution: 'UCLA', degree: 'B.S. Computer Science' }],
      skills: ['React', 'TypeScript'],
      certifications: ['AWS'],
      links: { linkedin: 'https://linkedin.com/in/jane', github: 'https://github.com/jane' }
    };

    const field: WorkdayField = {
      id: 'first-name',
      label: 'First Name',
      type: 'text',
      required: true,
      currentValue: ''
    };

    const result = heuristicMapField(field, resume);
    expect(result.matchedField).toBe('firstName');
    expect(result.value).toBe('Jane');
  });
});
