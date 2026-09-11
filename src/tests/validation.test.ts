import { describe, expect, it } from 'vitest';
import { validateFields } from '../validation/validator';
import type { WorkdayField } from '../types/resume';

describe('Validation logic', () => {
  it('flags invalid email inputs', () => {
    const fields: WorkdayField[] = [{
      id: 'email',
      label: 'Email Address',
      type: 'text',
      required: true,
      currentValue: 'bad-email'
    }];

    const result = validateFields(fields);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
