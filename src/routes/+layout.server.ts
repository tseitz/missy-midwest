import { getUpcomingEvents } from '$lib/server/calendar';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const { events } = await getUpcomingEvents();
	return { events };
};
