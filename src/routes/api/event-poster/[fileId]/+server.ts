import { redirect } from '@sveltejs/kit';
import { asset } from '$app/paths';
import { getUpcomingEvents } from '$lib/server/calendar';
import { getPosterImage } from '$lib/server/drive';
import type { RequestHandler } from './$types';

/** Branded fallback when an event has no readable poster (matches UpcomingDates). */
const DEFAULT_POSTER = '/shows/default-event.webp';

/**
 * Serve an event's poster image, proxied from Google Drive through the
 * read-only service account so the file never has to be public. We only serve
 * a file id that's actually attached to a current upcoming event — that
 * allowlist keeps this from becoming a general-purpose Drive proxy. Unknown ids
 * and download failures redirect to the branded default rather than erroring.
 */
export const GET: RequestHandler = async ({ params }) => {
	const { fileId } = params;

	const { events } = await getUpcomingEvents();
	const isEventPoster = events.some((event) =>
		event.attachments?.some((attachment) => attachment.fileId === fileId)
	);
	if (!isEventPoster) {
		redirect(302, asset(DEFAULT_POSTER));
	}

	const poster = await getPosterImage(fileId);
	if (!poster) {
		redirect(302, asset(DEFAULT_POSTER));
	}

	return new Response(poster.bytes, {
		headers: {
			'Content-Type': poster.contentType,
			// We're serving third-party bytes from our own origin; don't let the
			// browser sniff a different type than Drive reported.
			'X-Content-Type-Options': 'nosniff',
			// Long edge cache so repeat views are served by the CDN without
			// re-invoking the function; stale-while-revalidate smooths refreshes.
			'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
		}
	});
};
