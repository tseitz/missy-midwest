import { getFeaturedMix } from '$lib/server/soundcloud';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const featuredMix = await getFeaturedMix();
	setHeaders({ 'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' });
	return { featuredMix };
};
