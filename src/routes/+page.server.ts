import { getNextEvents } from '$lib/server/calendar';
import { listGroups } from '$lib/server/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [shows, catalog] = await Promise.all([getNextEvents(4), listGroups()]);
	return { nextShows: shows.events, shopGroups: catalog.groups.slice(0, 3) };
};
