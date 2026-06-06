export interface UpcomingEventsResult {
	events: CalendarEvent[];
	error?: string;
}

/**
 * The projected shape every event consumer depends on — deliberately a small
 * subset of Google's calendar event. `getUpcomingEvents` validates and projects
 * to exactly this (see `src/lib/server/calendar.ts`), so Google's bulky extras
 * (etag, organizer, reminders, attachment metadata, …) never reach the client
 * or bloat the SSR hydration payload.
 */
export interface CalendarEvent {
	id: string;
	summary: string;
	start: EventStart;
	htmlLink?: string;
	location?: string;
	attachments?: Attachment[];
}

export interface EventStart {
	date?: string;
	dateTime?: string;
}

export interface Attachment {
	fileId: string;
}
