import { auth } from '@googleapis/calendar';
import { MISSY_CALENDAR_CLIENT_EMAIL, MISSY_CALENDAR_PRIVATE_KEY } from '$env/static/private';

/**
 * Read-only scopes the site's Google service account uses. We list upcoming
 * events from Calendar and download the poster images attached to them from
 * Drive — the same service-account credentials back both APIs. Requesting the
 * Drive scope is harmless until the Drive API is enabled and a poster folder is
 * shared with the account; calendar reads keep working regardless. `auth` is the
 * AuthPlus namespace re-exported by @googleapis/calendar (the same
 * google-auth-library both the calendar and drive clients accept).
 */
export const GOOGLE_SCOPES = [
	'https://www.googleapis.com/auth/calendar.readonly',
	'https://www.googleapis.com/auth/drive.readonly'
] as const;

/**
 * Build a JWT auth client for the calendar service account. The private key is
 * stored with escaped newlines in the environment, so we unescape them here.
 */
export function createGoogleJwt() {
	return new auth.JWT({
		email: MISSY_CALENDAR_CLIENT_EMAIL,
		key: unescapeKey(),
		scopes: [...GOOGLE_SCOPES]
	});
}

function unescapeKey(): string {
	return MISSY_CALENDAR_PRIVATE_KEY.replace(/\\n/g, '\n');
}
