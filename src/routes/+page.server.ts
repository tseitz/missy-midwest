import { getNextEvents } from '$lib/server/calendar';
import { listGroups } from '$lib/server/catalog';
import { getInstagramFeed } from '$lib/server/instagram';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [shows, catalog, instagram] = await Promise.all([
		getNextEvents(4),
		listGroups(),
		getInstagramFeed()
	]);
	return {
		nextShows: shows.events,
		shopGroups: catalog.groups.slice(0, 3),
		instagramPosts: instagram.posts
	};
};
