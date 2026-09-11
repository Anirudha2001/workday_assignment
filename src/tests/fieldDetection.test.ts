import { describe, expect, it } from 'vitest';
import { normalizeFieldLabel } from '../mapper/heuristicMapper';

describe('Field label normalization', () => {
  it('normalizes common labels', () => {
    expect(normalizeFieldLabel('First Name')).toContain('first');
    expect(normalizeFieldLabel('Email Address')).toContain('email');
    expect(normalizeFieldLabel('LinkedIn Profile')).toContain('linkedin');
  });
});
