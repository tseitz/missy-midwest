import { google } from 'googleapis';
import { z } from 'zod';
import type { CalendarEvent, UpcomingEventsResult } from '$lib/types/index';
import { createGoogleJwt } from './google-auth';
import { reportFailure, errorMessage } from './report';

const calendar = google.calendar('v3');
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * The fields every event consumer depends on. We validate these at the trust
 * boundary and drop (and alert on) anything that doesn't match, rather than
 * blind-casting Google's payload and letting a malformed event crash a render.
 * Extra fields (location, attachments, htmlLink, …) pass through untouched, so
 * the consumer-facing `CalendarEvent` type is unchanged.
 */
const calendarEventSchema = z.object({
	id: z.string(),
	summary: z.string(),
	start: z.object({
		dateTime: z.string().optional(),
		date: z.string().optional()
	})
});

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
		const response = await calendar.events.list({
			auth: createGoogleJwt(),
			calendarId: 'missy.midwestofficial@gmail.com',
			timeMin: new Date().toISOString(),
			singleEvents: true,
			orderBy: 'startTime'
		});

		const rawItems = response.data.items ?? [];
		const events: CalendarEvent[] = [];
		let dropped = 0;
		for (const item of rawItems) {
			// Validate the shape we depend on, but keep the original item so the
			// extra fields consumers read (location, attachments, htmlLink) survive.
			if (calendarEventSchema.safeParse(item).success) {
				events.push(item as unknown as CalendarEvent);
			} else {
				dropped++;
			}
		}
		if (dropped > 0) {
			reportFailure(
				'Calendar feed validation',
				`${dropped} of ${rawItems.length} event(s) failed validation — possible schema drift`
			);
		}

		const result: UpcomingEventsResult = { events };
		cache = { at: Date.now(), result };
		return result;
	} catch (error) {
		const message = errorMessage(error);
		reportFailure('Calendar API error', message);
		return { events: [], error: message };
	}
}

/** Return at most `n` upcoming events (for the Home teaser). */
export async function getNextEvents(n: number): Promise<UpcomingEventsResult> {
	const result = await getUpcomingEvents();
	return { events: result.events.slice(0, n), error: result.error };
}
