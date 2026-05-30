import { describe, it, expect } from 'vitest';
import { getOrdinalSuffix, formatDate, formatDateTime } from './date';

describe('getOrdinalSuffix', () => {
	it('handles 1/2/3 and teens', () => {
		expect(getOrdinalSuffix(1)).toBe('st');
		expect(getOrdinalSuffix(2)).toBe('nd');
		expect(getOrdinalSuffix(3)).toBe('rd');
		expect(getOrdinalSuffix(11)).toBe('th');
		expect(getOrdinalSuffix(21)).toBe('st');
		expect(getOrdinalSuffix(4)).toBe('th');
	});
});

describe('formatDate', () => {
	it('parses a date-only string as local (no UTC off-by-one)', () => {
		// June 14, 2026 must not roll back to the 13th in negative-UTC zones
		expect(formatDate('2026-06-14')).toBe('June 14th 2026');
	});
});

describe('formatDateTime', () => {
	it('includes the time portion', () => {
		const out = formatDateTime('2026-06-14T20:30:00-05:00');
		expect(out).toContain('June 14th 2026 at');
	});
});
