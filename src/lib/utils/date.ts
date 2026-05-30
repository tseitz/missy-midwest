/** Ordinal suffix for a day of month (1 -> "st", 11 -> "th"). */
export function getOrdinalSuffix(day: number): string {
	if (day > 3 && day < 21) return 'th';
	switch (day % 10) {
		case 1:
			return 'st';
		case 2:
			return 'nd';
		case 3:
			return 'rd';
		default:
			return 'th';
	}
}

/**
 * Format a date as "Month Day{ordinal} Year".
 * Date-only strings (YYYY-MM-DD) are parsed as LOCAL midnight to avoid the
 * UTC off-by-one that affects timezones behind UTC.
 */
export function formatDate(dateString: string): string {
	const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
	let date: Date;
	if (isDateOnly) {
		const [y, m, d] = dateString.split('-').map(Number);
		date = new Date(y, m - 1, d);
	} else {
		date = new Date(dateString);
	}
	const month = date.toLocaleDateString('en-US', { month: 'long' });
	const day = date.getDate();
	const year = date.getFullYear();
	return `${month} ${day}${getOrdinalSuffix(day)} ${year}`;
}

/** Format the time portion of a datetime as "h:mm AM/PM". */
export function formatTime(dateTimeString: string): string {
	return new Date(dateTimeString).toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});
}

/** Format a full datetime as "Month Day{ordinal} Year at h:mm AM/PM". */
export function formatDateTime(dateTimeString: string): string {
	return `${formatDate(dateTimeString)} at ${formatTime(dateTimeString)}`;
}

/** The start (or end) shape of a Google Calendar event: timed or all-day. */
export interface EventDateParts {
	date?: string;
	dateTime?: string;
}

/**
 * Resolve an event's start to a local Date. A timed `dateTime` is parsed as an
 * absolute instant; a date-only `date` (YYYY-MM-DD) is parsed as LOCAL midnight
 * to avoid the UTC off-by-one. Returns null when neither field is present.
 */
export function eventStartDate(start: EventDateParts): Date | null {
	if (start.dateTime) return new Date(start.dateTime);
	if (start.date) {
		const [y, m, d] = start.date.split('-').map(Number);
		return new Date(y, m - 1, d);
	}
	return null;
}

/** Short uppercase weekday, e.g. "FRI". */
export function formatWeekdayShort(date: Date): string {
	return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
}

/** Month-and-year label used for grouping, e.g. "June 2026". */
export function formatMonthYear(date: Date): string {
	return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** A contiguous run of events that share the same month-year. */
export interface EventMonthGroup<T> {
	label: string;
	events: T[];
}

/**
 * Group events into month-year buckets keyed by `formatMonthYear`, preserving
 * the input order (which the calendar feed already sorts ascending by start).
 * Events whose start can't be resolved are skipped.
 */
export function groupEventsByMonth<T>(
	events: T[],
	getStart: (event: T) => EventDateParts
): EventMonthGroup<T>[] {
	const buckets = new Map<string, T[]>();
	for (const event of events) {
		const date = eventStartDate(getStart(event));
		if (!date) continue;
		const label = formatMonthYear(date);
		const existing = buckets.get(label);
		if (existing) {
			existing.push(event);
		} else {
			buckets.set(label, [event]);
		}
	}
	return [...buckets.entries()].map(([label, grouped]) => ({ label, events: grouped }));
}
