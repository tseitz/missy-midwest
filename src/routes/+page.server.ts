import { getNextEvents } from '$lib/server/calendar';
import { listGroups } from '$lib/server/catalog';
import { getInstagramFeed } from '$lib/server/instagram';
import { SHOP_ENABLED } from '$lib/shop/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
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
