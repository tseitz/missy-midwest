import { describe, it, expect } from 'vitest';
import { formatDuration } from './format-duration';

describe('formatDuration', () => {
	it('formats sub-minute durations', () => expect(formatDuration(44000)).toBe('0:44'));
	it('pads the seconds', () => expect(formatDuration(64000)).toBe('1:04'));
	it('formats durations under an hour as m:ss', () =>
		expect(formatDuration(3540000)).toBe('59:00'));
	it('formats an hour as h:mm:ss', () => expect(formatDuration(3600000)).toBe('1:00:00'));
	it('pads minutes and seconds past an hour', () =>
		expect(formatDuration(3730000)).toBe('1:02:10'));
	it('handles multi-hour durations', () => expect(formatDuration(7384000)).toBe('2:03:04'));
});
