import { z } from 'zod';
import { reportFailure, errorMessage } from './report';

// Client-safe constants/types live outside `$lib/server/` so browser components
// can import them; re-export here so server-side callers keep one import site.
export {
	PROFILE_URL,
	BAD_BITCH_BASS_URL,
	type FeaturedMix,
	type FeaturedPlaylist
} from '$lib/music/soundcloud';
import type { FeaturedMix, FeaturedPlaylist, PlaylistTrack } from '$lib/music/soundcloud';

/** The curated values to swap when featuring different mixes (track permalinks). */
export const GUEST_MIX_URL = 'https://soundcloud.com/missymidwest/split-astral-radio';

/** oEmbed has no track list, so the playlist's tracks are curated here, in playlist order. */
export const BAD_BITCH_BASS_TRACK_URLS = [
	'https://soundcloud.com/missymidwest/what-them-girls-like-missy',
	'https://soundcloud.com/missymidwest/get-money-girl-missy-midwest',
	'https://soundcloud.com/missymidwest/yeah-i-said-it-missy-midwest',
	'https://soundcloud.com/missymidwest/go-girl-missy-midwest-remix'
];

const ARTIST_SUFFIX = / by Missy Midwest$/;

/** oEmbed gives us far more than we need; validate + keep only title + thumbnail. */
const oembedSchema = z.object({
	title: z.string(),
	thumbnail_url: z.string().url()
});

const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { at: number; value: FeaturedMix | null }>();

/** Test-only: reset the in-memory cache. */
export function __clearFeaturedMixCache(): void {
	cache.clear();
}

/**
 * Resolve the curated highlighted-mix cover + title via SoundCloud's keyless oEmbed
 * endpoint (server-side, cached). Returns null on any failure — the page falls
 * back to a brand cover — and alerts via reportFailure, matching the boundary
 * pattern in calendar.ts / drive.ts.
 */
export async function getFeaturedMix(url: string): Promise<FeaturedMix | null> {
	const hit = cache.get(url);
	if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;

	try {
		const endpoint = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`;
		const res = await fetch(endpoint, { signal: AbortSignal.timeout(3000) });
		if (!res.ok) throw new Error(`oEmbed responded ${res.status}`);

		const parsed = oembedSchema.parse(await res.json());
		const value: FeaturedMix = {
			title: parsed.title,
			artworkUrl: parsed.thumbnail_url.replace(/-t\d+x\d+\./, '-t500x500.'),
			permalinkUrl: url
		};
		cache.set(url, { at: Date.now(), value });
		return value;
	} catch (error) {
		reportFailure('SoundCloud featured mix', errorMessage(error));
		cache.set(url, { at: Date.now(), value: null });
		return null;
	}
}

/** Null only if the playlist fails; a failed track is dropped (getFeaturedMix already reported it). */
export async function getFeaturedPlaylist(
	url: string,
	trackUrls: readonly string[]
): Promise<FeaturedPlaylist | null> {
	const [playlist, ...tracks] = await Promise.all([
		getFeaturedMix(url),
		...trackUrls.map((t) => getFeaturedMix(t))
	]);
	if (!playlist) return null;
	return {
		...playlist,
		tracks: tracks
			.filter((t): t is FeaturedMix => t !== null)
			.map(
				(t): PlaylistTrack => ({
					title: t.title.replace(ARTIST_SUFFIX, ''),
					permalinkUrl: t.permalinkUrl
				})
			)
	};
}
