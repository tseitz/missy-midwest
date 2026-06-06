import { describe, it, expect, vi, beforeEach } from 'vitest';

const { captureMessage } = vi.hoisted(() => ({ captureMessage: vi.fn() }));
vi.mock('@sentry/sveltekit', () => ({ captureMessage }));

import { getFeaturedMix, __clearFeaturedMixCache, FEATURED_MIX_URL } from './soundcloud';

beforeEach(() => {
	captureMessage.mockClear();
	__clearFeaturedMixCache();
	vi.restoreAllMocks();
});

function mockFetch(body: unknown, ok = true, status = 200) {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({ ok, status, json: () => Promise.resolve(body) })
	);
}

describe('getFeaturedMix', () => {
	it('projects oEmbed to title + upsized artwork + permalink', async () => {
		mockFetch({
			title: 'Sunset Set',
			thumbnail_url: 'https://i1.sndcdn.com/artworks-x-t300x300.jpg'
		});
		const mix = await getFeaturedMix();
		expect(mix).toEqual({
			title: 'Sunset Set',
			artworkUrl: 'https://i1.sndcdn.com/artworks-x-t500x500.jpg',
			permalinkUrl: FEATURED_MIX_URL
		});
		expect(captureMessage).not.toHaveBeenCalled();
	});

	it('returns null and reports on a non-ok response', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		mockFetch({}, false, 503);
		expect(await getFeaturedMix()).toBeNull();
		expect(captureMessage).toHaveBeenCalledWith(
			expect.stringMatching(/SoundCloud featured mix/),
			'error'
		);
	});

	it('returns null and reports on a malformed payload', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		mockFetch({ nope: true });
		expect(await getFeaturedMix()).toBeNull();
		expect(captureMessage).toHaveBeenCalled();
	});

	it('caches within the TTL (one fetch for two reads)', async () => {
		mockFetch({ title: 'A', thumbnail_url: 'https://i1.sndcdn.com/a-t300x300.jpg' });
		await getFeaturedMix();
		await getFeaturedMix();
		expect(globalThis.fetch as ReturnType<typeof vi.fn>).toHaveBeenCalledTimes(1);
	});
});
