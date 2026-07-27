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

/**
 * Behold bills per *feed request* — one GET here is one "view", whatever the
 * post count, since the images themselves come from Instagram's CDN and never
 * touch Behold. The free tier allows 1,200 views/month (~40/day) and pauses the
 * account with a 402 past the cap, so the TTL — not our traffic — is what sets
 * the bill: a warm instance spends 24h/TTL views a day even with zero visitors.
 * At 6h that's 4/day, leaving generous headroom for serverless instance churn
 * (the cache is per-Lambda, so cold starts multiply it). The account posts a few
 * times a week, so 6h costs us nothing in freshness, and it stays well inside
 * the few-day expiry on the signed Instagram CDN image URLs.
 */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

/**
 * Failures are cached too, or a paused/broken feed re-fetches on *every* render
 * — burning views, adding latency to the home page, and flooding Sentry with a
 * duplicate report per request. An hour bounds all three while still recovering
 * promptly once the feed comes back (a month-long free-tier pause self-heals at
 * the start of the next UTC month; we just stop hammering it in the meantime).
 */
const FAILURE_CACHE_TTL_MS = 60 * 60 * 1000;

export interface InstagramFeedResult {
	posts: InstagramPost[];
	error?: string;
}

let cache: { at: number; ttl: number; result: InstagramFeedResult } | null = null;

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

	if (cache && Date.now() - cache.at < cache.ttl) {
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

		// A parse error means Behold's payload shape drifted — retry on the short
		// TTL like any other failure so a fix lands promptly, not six hours later.
		return remember({ posts, error }, error ? FAILURE_CACHE_TTL_MS : CACHE_TTL_MS);
	} catch (error) {
		const message = errorMessage(error);
		reportFailure(FAILURE_CONTEXT, message);
		return remember({ posts: [], error: message }, FAILURE_CACHE_TTL_MS);
	}
}

/** Store a result under the given TTL and hand it back to the caller. */
function remember(result: InstagramFeedResult, ttl: number): InstagramFeedResult {
	cache = { at: Date.now(), ttl, result };
	return result;
}
