import { getNextEvents } from '$lib/server/calendar';
import { listGroups } from '$lib/server/catalog';
import { getInstagramFeed } from '$lib/server/instagram';
import { SHOP_ENABLED } from '$lib/shop/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	// Serve the home document from Netlify's edge: visitors get a cached copy
	// instantly instead of waiting on the Calendar + Instagram round trips that
	// run on a cold serverless start. `max-age=0` keeps browsers revalidating,
	// while `s-maxage` lets the shared CDN hold it for 5 min (matching the
	// calendar feed's own TTL) and `stale-while-revalidate` refreshes in the
	// background so no user ever pays the SSR latency. The page carries no
	// per-user data, so a shared/public cache is safe.
	setHeaders({
		'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
	});
	const [shows, instagram, catalog] = await Promise.all([
		getNextEvents(4),
		getInstagramFeed(),
		SHOP_ENABLED ? listGroups() : Promise.resolve({ groups: [] })
	]);
	return {
		nextShows: shows.events,
		shopGroups: catalog.groups.slice(0, 3),
		instagramPosts: instagram.posts
	};
};
