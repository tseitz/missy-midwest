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

/** Format a full datetime as "Month Day{ordinal} Year at h:mm AM/PM". */
export function formatDateTime(dateTimeString: string): string {
	const date = new Date(dateTimeString);
	const time = date.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});
	return `${formatDate(dateTimeString)} at ${time}`;
}
