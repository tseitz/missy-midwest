import type { PageServerLoad } from './$types';
import dateData from '$lib/data/dates.json';
import type { GigDate } from '$lib/types/index';

type GigDateData = {
	dates: GigDate[];
};
export const load = (() => {
	const { dates }: GigDateData = dateData;
	const upcomingDates: GigDate[] = [];
	const pastDates: GigDate[] = [];
	const now = new Date();

	dates.forEach((gig: GigDate) => {
		const parsedDate = new Date(gig.dateTime);
		if (parsedDate > now) {
			upcomingDates.push(gig);
		} else {
			pastDates.push(gig);
		}
	});

	upcomingDates.sort((a, b) => {
		return new Date(a.dateTime) - new Date(b.dateTime);
	});
	pastDates.sort((a, b) => {
		return new Date(b.dateTime) - new Date(a.dateTime);
	});

	return {
		upcomingDates,
		pastDates
	};
}) satisfies PageServerLoad;
