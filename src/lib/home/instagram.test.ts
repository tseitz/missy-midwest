import { describe, it, expect } from 'vitest';
import { parseFeed } from './instagram';
import { beholdFeedFixture } from './instagram.fixture';

describe('parseFeed', () => {
	it('maps a real-shape Behold payload into render-ready posts', () => {
		const { posts, error } = parseFeed(beholdFeedFixture);
		expect(error).toBeUndefined();
		expect(posts).toHaveLength(2);

		const [first] = posts;
		expect(first.id).toBe('18109217260910500');
		expect(first.permalink).toBe('https://www.instagram.com/reel/DY7uK1Rk6BU/');
		expect(first.isVideo).toBe(true);
		// Prefers the largest sized still over the raw thumbnail.
		expect(first.imageUrl).toBe('https://scontent.cdninstagram.com/large-1.jpg');
		// Prefers the pruned caption.
		expect(first.caption).toBe('like hello???');
	});

	it('falls back to thumbnailUrl when sized images are all null', () => {
		const { posts } = parseFeed(beholdFeedFixture);
		expect(posts[1].imageUrl).toBe('https://scontent.cdninstagram.com/v/t51/thumb-2.jpg');
	});

	it('returns an error and no posts for a non-object payload', () => {
		expect(parseFeed(null)).toEqual({ posts: [], error: expect.any(String) });
		expect(parseFeed('nope').error).toBeDefined();
	});

	it('returns no posts (no error) when the feed is legitimately empty', () => {
		expect(parseFeed({ posts: [] })).toEqual({ posts: [] });
	});

	it('skips individual malformed posts but keeps the valid ones', () => {
		const result = parseFeed({
			posts: [
				{ id: 'ok', permalink: 'https://instagram.com/p/ok/', thumbnailUrl: 'https://x/t.jpg' },
				{ id: 'missing-permalink', thumbnailUrl: 'https://x/t.jpg' },
				{ permalink: 'https://instagram.com/p/no-id/', thumbnailUrl: 'https://x/t.jpg' }
			]
		});
		expect(result.error).toBeUndefined();
		expect(result.posts).toHaveLength(1);
		expect(result.posts[0].id).toBe('ok');
	});

	it('drops a video post that has no usable still image', () => {
		const result = parseFeed({
			posts: [
				{
					id: 'v',
					permalink: 'https://instagram.com/reel/v/',
					mediaType: 'VIDEO',
					mediaUrl: 'https://x/v.mp4'
				}
			]
		});
		// Posts were present but none were renderable → schema-drift signal.
		expect(result.posts).toHaveLength(0);
		expect(result.error).toBeDefined();
	});

	it('flags probable schema drift when every post fails validation', () => {
		const result = parseFeed({ posts: [{ wrong: 'shape' }, { also: 'wrong' }] });
		expect(result.posts).toHaveLength(0);
		expect(result.error).toMatch(/schema drift/i);
	});
});
