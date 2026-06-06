import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { beholdFeedFixture } from '$lib/home/instagram.fixture';

// vi.mock is hoisted above module init, so the mutable env must be hoisted too.
const { env, captureMessage } = vi.hoisted(() => ({
	env: {} as Record<string, string | undefined>,
	captureMessage: vi.fn()
}));
vi.mock('$env/dynamic/private', () => ({ env }));
vi.mock('@sentry/sveltekit', () => ({ captureMessage }));

import { getInstagramFeed, __clearInstagramCache } from './instagram';

function mockFetch(impl: (url: string) => Partial<Response>) {
	const fn = vi.fn((url: string) => Promise.resolve(impl(url) as Response));
	vi.stubGlobal('fetch', fn);
	return fn;
}

describe('getInstagramFeed', () => {
	beforeEach(() => {
		__clearInstagramCache();
		for (const key of Object.keys(env)) delete env[key];
		captureMessage.mockClear();
	});
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('returns an empty feed without fetching when no feed ID is configured', async () => {
		const fetchSpy = mockFetch(() => ({
			ok: true,
			json: () => Promise.resolve(beholdFeedFixture)
		}));
		const result = await getInstagramFeed();
		expect(result).toEqual({ posts: [] });
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('fetches the configured feed and returns validated posts', async () => {
		env.BEHOLD_FEED_ID = 'feed-123';
		const fetchSpy = mockFetch(() => ({
			ok: true,
			json: () => Promise.resolve(beholdFeedFixture)
		}));
		const result = await getInstagramFeed();
		expect(fetchSpy).toHaveBeenCalledWith('https://feeds.behold.so/feed-123');
		expect(result.posts).toHaveLength(2);
		expect(result.error).toBeUndefined();
	});

	it('caches results so repeated calls hit the network only once', async () => {
		env.BEHOLD_FEED_ID = 'feed-123';
		const fetchSpy = mockFetch(() => ({
			ok: true,
			json: () => Promise.resolve(beholdFeedFixture)
		}));
		await getInstagramFeed();
		await getInstagramFeed();
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});

	it('fails soft with an error when Behold responds non-OK', async () => {
		env.BEHOLD_FEED_ID = 'feed-123';
		vi.spyOn(console, 'error').mockImplementation(() => {});
		mockFetch(() => ({ ok: false, status: 503, statusText: 'Service Unavailable' }));
		const result = await getInstagramFeed();
		expect(result.posts).toEqual([]);
		expect(result.error).toMatch(/503/);
		// The failure is reported to Sentry, not silently swallowed.
		expect(captureMessage).toHaveBeenCalledWith(expect.stringMatching(/503/), 'error');
	});

	it('fails soft with an error when the fetch throws', async () => {
		env.BEHOLD_FEED_ID = 'feed-123';
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.reject(new Error('network down')))
		);
		const result = await getInstagramFeed();
		expect(result.posts).toEqual([]);
		expect(result.error).toBe('network down');
	});
});
