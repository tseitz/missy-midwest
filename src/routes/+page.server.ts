import { google } from 'googleapis';
import { MISSY_CALENDAR_CLIENT_EMAIL, MISSY_CALENDAR_PRIVATE_KEY } from '$env/static/private';

const calendar = google.calendar('v3');

export const load = async () => {
	const client = new google.auth.JWT(
		MISSY_CALENDAR_CLIENT_EMAIL,
		undefined,
		MISSY_CALENDAR_PRIVATE_KEY.replace(/\\n/g, '\n'),
		['https://www.googleapis.com/auth/calendar.readonly']
	);

	try {
		const response = await calendar.events.list({
			auth: client,
			calendarId: 'missy.midwestofficial@gmail.com',
			timeMin: new Date().toISOString(),
			// maxResults: 20,
			singleEvents: true,
			orderBy: 'startTime'
		});

		return {
			body: response.data.items
		};
	} catch (error) {
		console.log(error);
		return {
			status: 500,
			body: error instanceof Error ? error.message : 'Unknown error'
		};
	}
};
