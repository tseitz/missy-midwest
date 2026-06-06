import { getUpcomingEvents } from '$lib/server/calendar';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const { events } = await getUpcomingEvents();

	// The feed is identical for everyone and changes infrequently, so let the
	// Netlify edge serve the rendered HTML without re-invoking the function (and
	// re-hitting Google) on every visit. s-maxage matches the calendar cache TTL;
	// stale-while-revalidate keeps responses instant while a fresh copy warms.
	setHeaders({
		'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600'
	});

	return { events };
};
