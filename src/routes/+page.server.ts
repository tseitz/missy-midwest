import { getNextEvents } from '$lib/server/calendar';
import { listGroups } from '$lib/server/catalog';
import { getInstagramFeed } from '$lib/server/instagram';
import { SHOP_ENABLED } from '$lib/shop/config';
import type { PageServerLoad } from './$types';

// How many product groups the home teaser features (one card each, in priority
// order). 6 fills the sm:2 / lg:3 grid evenly and reaches past the hats into a
// couple of shirts; raise/lower to feature more or fewer.
const HOME_TEASER_GROUPS = 6;

export const load: PageServerLoad = async ({ setHeaders }) => {
	// Serve the home document from Netlify's edge: visitors get a cached copy
	// instantly instead of waiting on the Calendar + Instagram round trips that
	// run on a cold serverless start. `max-age=0` keeps browsers revalidating,
	// while `s-maxage` lets the shared CDN hold it for 5 min (matching the
	// calendar feed's own TTL) and `stale-while-revalidate` refreshes in the
	// background so no user ever pays the SSR latency. The SWR window is capped
	// at 1h (matching /shows) so a removed or finished event can't linger in the
	// edge cache for a full day. The page carries no per-user data, so a
	// shared/public cache is safe.
	setHeaders({
		'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600'
	});
	const [shows, instagram, catalog] = await Promise.all([
		getNextEvents(4),
		getInstagramFeed(),
		SHOP_ENABLED ? listGroups() : Promise.resolve({ groups: [] })
	]);
	return {
		nextShows: shows.events,
		shopGroups: catalog.groups.slice(0, HOME_TEASER_GROUPS),
		instagramPosts: instagram.posts
	};
};
