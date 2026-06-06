/**
 * Instagram feed types + a Zod-validated parser for the Behold JSON feed.
 *
 * Behold (https://behold.so) re-syncs with Instagram on a schedule, so the raw
 * JSON updates on its own as new posts land. The media URLs it returns are
 * *signed, expiring* Instagram CDN links — so the server fetcher caches on a
 * short TTL rather than pinning them (see `$lib/server/instagram`).
 *
 * This module has no server-only imports so both the fetcher and the component
 * can share the `InstagramPost` type, and the parser stays unit-testable.
 *
 * Validation is deliberately strict at this trust boundary: Instagram/Behold
 * can change their payload shape without notice. A single odd post is skipped,
 * but a wholesale shape change surfaces as an `error` so we can alert on it
 * instead of silently rendering an empty feed.
 */
import { z } from 'zod';

/** A single feed post, reduced to what the Home grid actually renders. */
export interface InstagramPost {
	id: string;
	/** Canonical instagram.com link for the post — the grid opens this. */
	permalink: string;
	/** A still image URL for the grid tile (video posts use their thumbnail). */
	imageUrl: string;
	/** Short, human-friendly caption (falls back to the full caption). */
	caption: string;
	/** True for reels/videos, so the tile can show a play affordance. */
	isVideo: boolean;
}

export interface ParsedFeed {
	posts: InstagramPost[];
	/** Set when the payload shape is unusable — a signal to alert on. */
	error?: string;
}

const sizeSchema = z.object({ mediaUrl: z.string().nullish() }).nullish();

/** The subset of Behold's post shape we depend on; extra fields are ignored. */
const rawPostSchema = z.object({
	id: z.string().min(1),
	permalink: z.string().min(1),
	mediaType: z.string().nullish(),
	isReel: z.boolean().nullish(),
	mediaUrl: z.string().nullish(),
	thumbnailUrl: z.string().nullish(),
	caption: z.string().nullish(),
	prunedCaption: z.string().nullish(),
	sizes: z.record(z.string(), sizeSchema).nullish()
});

type RawPost = z.infer<typeof rawPostSchema>;

const feedSchema = z.object({ posts: z.array(z.unknown()).default([]) });

/**
 * Choose the best still image for a tile, preferring sized images and falling
 * back to the post thumbnail. For non-video posts the raw `mediaUrl` (the photo
 * itself) is an acceptable last resort; for videos it is an `.mp4` we must skip.
 */
function pickImageUrl(post: RawPost, isVideo: boolean): string | null {
	const sizes = post.sizes ?? {};
	const sized = [sizes.large, sizes.medium, sizes.small]
		.map((size) => size?.mediaUrl)
		.find((url): url is string => typeof url === 'string' && url.length > 0);
	if (sized) return sized;
	if (post.thumbnailUrl) return post.thumbnailUrl;
	if (!isVideo && post.mediaUrl) return post.mediaUrl;
	return null;
}

function toPost(post: RawPost): InstagramPost | null {
	const isVideo = post.mediaType === 'VIDEO' || post.isReel === true;
	const imageUrl = pickImageUrl(post, isVideo);
	if (!imageUrl) return null;
	return {
		id: post.id,
		permalink: post.permalink,
		imageUrl,
		caption: post.prunedCaption || post.caption || '',
		isVideo
	};
}

/**
 * Validate and reduce a raw Behold feed payload into render-ready posts.
 *
 * - Bad envelope (not an object / no `posts` array) → `error`, empty posts.
 * - Individual malformed posts are skipped.
 * - If posts were present but *none* validated, that's treated as schema drift
 *   and reported via `error` so an empty render doesn't pass silently.
 */
export function parseFeed(raw: unknown): ParsedFeed {
	const envelope = feedSchema.safeParse(raw);
	if (!envelope.success) {
		return { posts: [], error: `Unexpected Behold feed shape: ${envelope.error.message}` };
	}

	const rawPosts = envelope.data.posts;
	const posts: InstagramPost[] = [];
	for (const entry of rawPosts) {
		const parsed = rawPostSchema.safeParse(entry);
		if (!parsed.success) continue;
		const post = toPost(parsed.data);
		if (post) posts.push(post);
	}

	if (rawPosts.length > 0 && posts.length === 0) {
		return {
			posts,
			error: `All ${rawPosts.length} Behold post(s) failed validation — possible schema drift`
		};
	}
	return { posts };
}
