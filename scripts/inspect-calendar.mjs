import { auth, calendar as calendarApi } from '@googleapis/calendar';

/**
 * inspect-calendar — read-only dump of what the service account actually sees on
 * the Missy calendar, so we can decide how to filter the public shows feed.
 *
 *   node --env-file=.env scripts/inspect-calendar.mjs
 *
 * For every upcoming event it prints the fields that decide visibility:
 *   - status      confirmed | cancelled
 *   - visibility  default | public | private | confidential  (the per-event
 *                 dropdown in Google Calendar; 'default' inherits the calendar)
 *   - self        whether the service account / owner ORGANIZES the event
 *                 (false = a meeting someone else invited the account to)
 *   - organizer   the organizer's email
 *
 * Nothing is written or changed. Use it to answer: are real gigs marked
 * 'public' or 'default', and what does the noise (invites) look like?
 */
const email = process.env.MISSY_CALENDAR_CLIENT_EMAIL;
const key = process.env.MISSY_CALENDAR_PRIVATE_KEY;
if (!email || !key) {
	console.error(
		'MISSY_CALENDAR_CLIENT_EMAIL and MISSY_CALENDAR_PRIVATE_KEY are required.\n' +
			'Run: node --env-file=.env scripts/inspect-calendar.mjs'
	);
	process.exit(1);
}

const client = new auth.JWT({
	email,
	key: key.replace(/\\n/g, '\n'),
	scopes: ['https://www.googleapis.com/auth/calendar.readonly']
});

const calendar = calendarApi('v3');
const { data } = await calendar.events.list({
	auth: client,
	calendarId: 'missy.midwestofficial@gmail.com',
	timeMin: new Date().toISOString(),
	singleEvents: true,
	orderBy: 'startTime',
	maxResults: 50
});

const items = data.items ?? [];
console.log(`\n${items.length} upcoming event(s) the service account can see:\n`);

for (const e of items) {
	const start = e.start?.dateTime ?? e.start?.date ?? '(no start)';
	const status = e.status ?? 'default';
	const visibility = e.visibility ?? 'default';
	const self = e.organizer?.self === true ? 'self' : 'OTHER';
	const organizer = e.organizer?.email ?? '(none)';
	console.log(
		`• ${start}\n` +
			`    status=${status}  visibility=${visibility}  organizer=${self} <${organizer}>\n` +
			`    ${e.summary ?? '(no title)'}\n`
	);
}

const publicCount = items.filter((e) => e.visibility === 'public').length;
const selfCount = items.filter((e) => e.organizer?.self === true).length;
console.log(
	`Summary: ${items.length} total — ${publicCount} marked 'public', ${selfCount} self-organized.\n`
);
