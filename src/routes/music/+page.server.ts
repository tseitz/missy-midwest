import { FEATURED_MIX_URL, GUEST_MIX_URL, getFeaturedMix } from '$lib/server/soundcloud';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const [guestMix, featuredMix] = await Promise.all([
		getFeaturedMix(GUEST_MIX_URL),
		getFeaturedMix(FEATURED_MIX_URL)
	]);
	setHeaders({ 'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' });
	return { guestMix, featuredMix };
};
