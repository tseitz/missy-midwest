import { describe, it, expect, vi, beforeEach } from 'vitest';

const { captureMessage } = vi.hoisted(() => ({ captureMessage: vi.fn() }));
vi.mock('@sentry/sveltekit', () => ({ captureMessage }));

import { getFeaturedMix, getFeaturedPlaylist, __clearFeaturedMixCache } from './soundcloud';

const MIX_URL = 'https://soundcloud.com/missymidwest/some-mix';

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
		const mix = await getFeaturedMix(MIX_URL);
		expect(mix).toEqual({
			title: 'Sunset Set',
			artworkUrl: 'https://i1.sndcdn.com/artworks-x-t500x500.jpg',
			permalinkUrl: MIX_URL
		});
		expect(captureMessage).not.toHaveBeenCalled();
	});

	it('returns null and reports on a non-ok response', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		mockFetch({}, false, 503);
		expect(await getFeaturedMix(MIX_URL)).toBeNull();
		expect(captureMessage).toHaveBeenCalledWith(
			expect.stringMatching(/SoundCloud featured mix/),
			'error'
		);
	});

	it('returns null and reports on a malformed payload', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		mockFetch({ nope: true });
		expect(await getFeaturedMix(MIX_URL)).toBeNull();
		expect(captureMessage).toHaveBeenCalled();
	});

	it('caches within the TTL (one fetch for two reads)', async () => {
		mockFetch({ title: 'A', thumbnail_url: 'https://i1.sndcdn.com/a-t300x300.jpg' });
		await getFeaturedMix(MIX_URL);
		await getFeaturedMix(MIX_URL);
		expect(globalThis.fetch as ReturnType<typeof vi.fn>).toHaveBeenCalledTimes(1);
	});
});

describe('getFeaturedPlaylist', () => {
	function mockOembed(byUrl: Record<string, { title: string } | null>) {
		vi.stubGlobal(
			'fetch',
			vi.fn(async (endpoint: string) => {
				const url = new URL(endpoint).searchParams.get('url') ?? '';
				const hit = byUrl[url];
				return hit
					? {
							ok: true,
							status: 200,
							json: () =>
								Promise.resolve({ ...hit, thumbnail_url: 'https://i1.sndcdn.com/a-t300x300.jpg' })
						}
					: { ok: false, status: 404, json: () => Promise.resolve({}) };
			})
		);
	}

	it('returns the playlist with track titles in curated order, minus the artist suffix', async () => {
		mockOembed({
			p: { title: 'Vol. 1 by Missy Midwest' },
			t1: { title: 'First (Missy Midwest Remix) by Missy Midwest' },
			t2: { title: 'Second' }
		});
		const playlist = await getFeaturedPlaylist('p', ['t1', 't2']);
		expect(playlist?.title).toBe('Vol. 1 by Missy Midwest');
		expect(playlist?.tracks).toEqual([
			{ title: 'First (Missy Midwest Remix)', permalinkUrl: 't1' },
			{ title: 'Second', permalinkUrl: 't2' }
		]);
	});

	it('drops a track that fails to resolve and reports it', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		mockOembed({ p: { title: 'Vol. 1' }, t2: { title: 'Second' } });
		const playlist = await getFeaturedPlaylist('p', ['t1', 't2']);
		expect(playlist?.tracks).toEqual([{ title: 'Second', permalinkUrl: 't2' }]);
		expect(captureMessage).toHaveBeenCalled();
	});

	it('returns null when the playlist itself fails', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		mockOembed({ t1: { title: 'First' } });
		expect(await getFeaturedPlaylist('p', ['t1'])).toBeNull();
	});
});
