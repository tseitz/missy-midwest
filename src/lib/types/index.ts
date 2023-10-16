export interface GigDate {
	title: string;
	dateTime: string;
	dateString?: string;
	parsedDateTime?: Date;
	localeDate: string;
	localeTime: string;
	venue: string;
	address: string | null;
	image: string;
	imageClasses?: string[];
	displayHistorical: boolean;
	featured?: boolean;
}

export interface CalendarEvent {
	attachments?: Attachment[];
	kind: string;
	etag: string;
	id: string;
	status: string;
	htmlLink: string;
	created: string;
	updated: string;
	summary: string;
	description: string;
	location: string;
	creator: Creator;
	organizer: Creator;
	start: StartEnd;
	end: StartEnd;
	iCalUID: string;
	sequence: number;
	reminders: Reminders;
	eventType: string;
}

export interface Attachment {
	fileId: string;
	fileUrl: string;
	iconLink: string;
	mimeType: string; // should make more specific later
	title: string;
}

export interface Creator {
	email: string;
	self: boolean;
}

export interface StartEnd {
	date?: string;
	dateTime?: string;
	timeZone?: string;
}

export interface Reminders {
	useDefault: boolean;
}
