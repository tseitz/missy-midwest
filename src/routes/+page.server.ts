import { google } from 'googleapis';
import { MISSY_CALENDAR_CLIENT_EMAIL, MISSY_CALENDAR_PRIVATE_KEY } from '$env/static/private';

const calendar = google.calendar('v3');

export const load = async () => {
	console.log(MISSY_CALENDAR_CLIENT_EMAIL, MISSY_CALENDAR_PRIVATE_KEY);
	const client = new google.auth.JWT(
		MISSY_CALENDAR_CLIENT_EMAIL,
		null,
		MISSY_CALENDAR_PRIVATE_KEY.replace(/\\n/g, '\n'),
		['https://www.googleapis.com/auth/calendar.readonly']
	);

	try {
		const response = await calendar.events.list({
			auth: client,
			calendarId: 'missy.midwestofficial@gmail.com', // or the specific calendar ID you want to access
			timeMin: new Date().toISOString(),
			maxResults: 10, // adjust as needed
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
			body: error.message
		};
	}
};
