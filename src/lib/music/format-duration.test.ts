import { describe, it, expect } from 'vitest';
import { formatDuration } from './format-duration';

describe('formatDuration', () => {
	it('formats sub-minute durations', () => expect(formatDuration(44000)).toBe('0:44'));
	it('pads the seconds', () => expect(formatDuration(64000)).toBe('1:04'));
	it('handles durations over an hour as minutes', () =>
		expect(formatDuration(3730000)).toBe('62:10'));
});
