import { env } from '$env/dynamic/private';
import { parseFeed, type InstagramPost } from '$lib/home/instagram';
import { reportFailure, errorMessage } from './report';

/**
 * Server-side fetcher for the Behold Instagram JSON feed.
 *
 * Behold serves the feed publicly at `https://feeds.behold.so/<id>`. We fetch it
 * here (not in the browser) so posts arrive in the server-rendered HTML — better
 * LCP/SEO and no third-party script. The signed Instagram CDN image URLs expire
 * within days, so we cache on a short TTL to keep them fresh rather than pinning.
 */
const FEED_BASE = 'https://feeds.behold.so';
const CACHE_TTL_MS = 30 * 60 * 1000;

export interface InstagramFeedResult {
	posts: InstagramPost[];
	error?: string;
}

let cache: { at: number; result: InstagramFeedResult } | null = null;

/** Test-only: reset the in-memory cache. */
export function __clearInstagramCache(): void {
	cache = null;
}

const FAILURE_CONTEXT = 'Instagram feed failure';

/** Fetch + validate the Behold feed (cached for 30 minutes). */
export async function getInstagramFeed(): Promise<InstagramFeedResult> {
	const feedId = env.BEHOLD_FEED_ID;
	// Not configured → render the placeholder grid, no error.
	if (!feedId) return { posts: [] };

	if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
		return cache.result;
	}

	try {
		const response = await fetch(`${FEED_BASE}/${feedId}`);
		if (!response.ok) {
			throw new Error(`Behold responded ${response.status} ${response.statusText}`);
		}
		const raw: unknown = await response.json();
		const { posts, error } = parseFeed(raw);
		if (error) reportFailure(FAILURE_CONTEXT, error);

		const result: InstagramFeedResult = { posts, error };
		cache = { at: Date.now(), result };
		return result;
	} catch (error) {
		const message = errorMessage(error);
		reportFailure(FAILURE_CONTEXT, message);
		return { posts: [], error: message };
	}
}
