import {
	BAD_BITCH_BASS_TRACK_URLS,
	BAD_BITCH_BASS_URL,
	GUEST_MIX_URL,
	getFeaturedMix,
	getFeaturedPlaylist
} from '$lib/server/soundcloud';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const [featuredPlaylist, guestMix] = await Promise.all([
		getFeaturedPlaylist(BAD_BITCH_BASS_URL, BAD_BITCH_BASS_TRACK_URLS),
		getFeaturedMix(GUEST_MIX_URL)
	]);
	setHeaders({ 'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' });
	return { featuredPlaylist, guestMix };
};
