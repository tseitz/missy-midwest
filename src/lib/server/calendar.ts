import { calendar as calendarApi } from '@googleapis/calendar';
import { z } from 'zod';
import type { CalendarEvent, UpcomingEventsResult } from '$lib/types/index';
import { createGoogleJwt } from './google-auth';
import { reportFailure, errorMessage } from './report';

const calendar = calendarApi('v3');
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * The fields every event consumer depends on. We validate these at the trust
 * boundary and *project* to exactly this shape: malformed events are dropped
 * (and alerted on) rather than crashing a render, and the rest of Google's bulky
 * payload (etag, organizer, reminders, attachment metadata, …) is stripped.
 * Zod strips unknown keys on parse, so `safeParse(item).data` is already the
 * clean, minimal `CalendarEvent` — no blind cast, and nothing extra reaches the
 * SSR hydration data. Only `id`, `summary`, and `start` are required; the
 * optional display fields project through when present.
 */
const calendarEventSchema = z.object({
	id: z.string(),
	summary: z.string(),
	start: z.object({
		dateTime: z.string().optional(),
		date: z.string().optional()
	}),
	htmlLink: z.string().optional(),
	location: z.string().optional(),
	attachments: z.array(z.object({ fileId: z.string() })).optional()
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
			// Only surface real, active gigs. Three guards before validation:
			//  - skip cancelled events (a cancelled instance of a recurring series
			//    is still returned, with status 'cancelled', when singleEvents=true);
			//  - skip events organized by someone else — these are personal meeting
			//    invites that merely landed on the account's calendar, not shows.
			//    Self-organized (or unattributed) events are kept, so this can never
			//    hide a gig the account created itself;
			//  - honor the event's Visibility flag: anything the account marks
			//    Private/Confidential in Google Calendar is hidden from the public
			//    feed. Gigs stay on Default (the implicit ~50 we already have) and
			//    show automatically — only personal self-created events need the
			//    explicit Private opt-out.
			if (item.status === 'cancelled') continue;
			if (item.organizer && item.organizer.self !== true) continue;
			if (item.visibility === 'private' || item.visibility === 'confidential') continue;

			// Validate and project in one step: the parsed data is the minimal
			// CalendarEvent (Zod strips Google's extra keys), so nothing bulky leaks
			// into the response or the SSR payload.
			const parsed = calendarEventSchema.safeParse(item);
			if (parsed.success) {
				events.push(parsed.data);
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
