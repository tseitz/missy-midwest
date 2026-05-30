import { getNextEvents } from '$lib/server/calendar';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { events } = await getNextEvents(4);
	return { nextShows: events };
};
