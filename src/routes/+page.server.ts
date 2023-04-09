import type { PageServerLoad } from './$types';
import dateData from '$lib/data/dates.json';
import type { GigDate } from '$lib/types/index';

type GigDateData = {
	dates: GigDate[];
};
export const load = (() => {
	const { dates }: GigDateData = dateData;
	const upcomingDates: GigDate[] = [];
	let pastDates: GigDate[] = [];
	const featuredDates: GigDate[] = [];
	const now = new Date();

	dates.sort(sortAsc);

	dates.forEach((gig: GigDate) => {
		gig.parsedDateTime = new Date(gig.dateTime);
		gig.localeDate = gig.parsedDateTime.toLocaleDateString();
		gig.localeTime = gig.parsedDateTime.toLocaleTimeString();
		if (gig.featured) {
			featuredDates.push(gig);
		} else if (gig.parsedDateTime > now) {
			upcomingDates.push(gig);
		} else {
			pastDates.push(gig);
		}
	});

	pastDates.reverse();

	return {
		featuredDates,
		upcomingDates,
		pastDates
	};
}) satisfies PageServerLoad;

function sortAsc(a: GigDate, b: GigDate) {
	return new Date(a.dateTime) - new Date(b.dateTime);
}
