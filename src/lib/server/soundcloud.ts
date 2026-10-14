import { z } from 'zod';
import { reportFailure, errorMessage } from './report';

// Client-safe constants/types live outside `$lib/server/` so browser components
// can import them; re-export here so server-side callers keep one import site.
export { PROFILE_URL, type FeaturedMix } from '$lib/music/soundcloud';
import type { FeaturedMix } from '$lib/music/soundcloud';

/** The curated values to swap when featuring different mixes (track permalinks). */
export const GUEST_MIX_URL = 'https://soundcloud.com/missymidwest/split-astral-radio';
export const FEATURED_MIX_URL = 'https://soundcloud.com/missymidwest/january-minimix-2025';

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
export async function getFeaturedMix(url: string = FEATURED_MIX_URL): Promise<FeaturedMix | null> {
	const hit = cache.get(url);
	if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;

	try {
		const endpoint = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`;
		const res = await fetch(endpoint);
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
