import { getUpcomingEvents } from '$lib/server/calendar';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { events } = await getUpcomingEvents();
	return { events };
};
