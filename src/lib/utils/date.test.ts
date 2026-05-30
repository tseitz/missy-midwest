import { describe, it, expect } from 'vitest';
import {
	getOrdinalSuffix,
	formatDate,
	formatDateTime,
	eventStartDate,
	formatWeekdayShort,
	formatMonthYear,
	formatTime,
	groupEventsByMonth
} from './date';

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

describe('eventStartDate', () => {
	it('parses a timed start from its dateTime', () => {
		const date = eventStartDate({ dateTime: '2026-06-14T13:00:00' });
		expect(date?.getFullYear()).toBe(2026);
		expect(date?.getDate()).toBe(14);
	});

	it('parses a date-only start as local midnight (no UTC off-by-one)', () => {
		const date = eventStartDate({ date: '2026-06-14' });
		expect(date?.getDate()).toBe(14);
		expect(date?.getMonth()).toBe(5); // June (0-indexed)
	});

	it('returns null when no start is present', () => {
		expect(eventStartDate({})).toBeNull();
	});
});

describe('formatWeekdayShort', () => {
	it('returns the uppercase three-letter weekday', () => {
		// 2026-01-01 is a Thursday
		expect(formatWeekdayShort(new Date(2026, 0, 1))).toBe('THU');
	});
});

describe('formatMonthYear', () => {
	it('returns the full month and year', () => {
		expect(formatMonthYear(new Date(2026, 5, 14))).toBe('June 2026');
	});
});

describe('formatTime', () => {
	it('returns a 12-hour time with meridiem', () => {
		// Local (offset-free) datetime is tz-stable: 13:00 -> 1:00 PM everywhere
		expect(formatTime('2026-06-14T13:00:00')).toBe('1:00 PM');
	});
});

describe('groupEventsByMonth', () => {
	const events = [
		{ start: { date: '2026-06-05' } },
		{ start: { date: '2026-06-11' } },
		{ start: { dateTime: '2026-07-02T20:00:00' } }
	];

	it('buckets sorted events into contiguous month-year groups', () => {
		const groups = groupEventsByMonth(events, (e) => e.start);
		expect(groups).toHaveLength(2);
		expect(groups[0].label).toBe('June 2026');
		expect(groups[0].events).toHaveLength(2);
		expect(groups[1].label).toBe('July 2026');
		expect(groups[1].events).toHaveLength(1);
	});

	it('skips events without a resolvable start', () => {
		const groups = groupEventsByMonth([{ start: {} }, ...events], (e) => e.start);
		expect(groups).toHaveLength(2);
		expect(groups[0].events).toHaveLength(2);
	});
});
