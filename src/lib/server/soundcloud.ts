import { z } from 'zod';
import { reportFailure, errorMessage } from './report';

// Client-safe constants/types live outside `$lib/server/` so browser components
// can import them; re-export here so server-side callers keep one import site.
export { PROFILE_URL, type FeaturedMix } from '$lib/music/soundcloud';
import type { FeaturedMix } from '$lib/music/soundcloud';

/** The one curated value to swap when featuring a different mix (a track permalink). */
export const FEATURED_MIX_URL =
	'https://soundcloud.com/missymidwest/full-tree-house-set-at-franky-louies-may-2025';

/** oEmbed gives us far more than we need; validate + keep only title + thumbnail. */
const oembedSchema = z.object({
	title: z.string(),
	thumbnail_url: z.string().url()
});

const CACHE_TTL_MS = 60 * 60 * 1000;
let cache: { at: number; value: FeaturedMix | null } | null = null;

/** Test-only: reset the in-memory cache. */
export function __clearFeaturedMixCache(): void {
	cache = null;
}

/**
 * Resolve the curated highlighted-mix cover + title via SoundCloud's keyless oEmbed
 * endpoint (server-side, cached). Returns null on any failure — the page falls
 * back to a brand cover — and alerts via reportFailure, matching the boundary
 * pattern in calendar.ts / drive.ts.
 */
export async function getFeaturedMix(): Promise<FeaturedMix | null> {
	if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;

	try {
		const endpoint = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(FEATURED_MIX_URL)}`;
		const res = await fetch(endpoint);
		if (!res.ok) throw new Error(`oEmbed responded ${res.status}`);

		const parsed = oembedSchema.parse(await res.json());
		const value: FeaturedMix = {
			title: parsed.title,
			artworkUrl: parsed.thumbnail_url.replace(/-t\d+x\d+\./, '-t500x500.'),
			permalinkUrl: FEATURED_MIX_URL
		};
		cache = { at: Date.now(), value };
		return value;
	} catch (error) {
		reportFailure('SoundCloud featured mix', errorMessage(error));
		cache = { at: Date.now(), value: null };
		return null;
	}
}
