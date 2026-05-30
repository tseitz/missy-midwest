import { google } from 'googleapis';
import { MISSY_CALENDAR_CLIENT_EMAIL, MISSY_CALENDAR_PRIVATE_KEY } from '$env/static/private';
import type { CalendarEvent, UpcomingEventsResult } from '$lib/types/index';

const calendar = google.calendar('v3');
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { at: number; result: UpcomingEventsResult } | null = null;

/** Test-only: reset the in-memory cache. */
export function __clearCalendarCache(): void {
	cache = null;
}

/** Fetch upcoming events from Google Calendar (cached for 5 minutes). */
export async function getUpcomingEvents(): Promise<UpcomingEventsResult> {
	if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
		return cache.result;
	}

	try {
		const client = new google.auth.JWT(
			MISSY_CALENDAR_CLIENT_EMAIL,
			undefined,
			MISSY_CALENDAR_PRIVATE_KEY.replace(/\\n/g, '\n'),
			['https://www.googleapis.com/auth/calendar.readonly']
		);

		const response = await calendar.events.list({
			auth: client,
			calendarId: 'missy.midwestofficial@gmail.com',
			timeMin: new Date().toISOString(),
			singleEvents: true,
			orderBy: 'startTime'
		});

		const result: UpcomingEventsResult = {
			events: (response.data.items ?? []) as CalendarEvent[]
		};
		cache = { at: Date.now(), result };
		return result;
	} catch (error) {
		console.error('Calendar API error:', error);
		return {
			events: [],
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/** Return at most `n` upcoming events (for the Home teaser). */
export async function getNextEvents(n: number): Promise<UpcomingEventsResult> {
	const result = await getUpcomingEvents();
	return { events: result.events.slice(0, n), error: result.error };
}
