import { it, expect, vi } from 'vitest';

const { getFeaturedMix, getFeaturedPlaylist } = vi.hoisted(() => ({
	getFeaturedMix: vi.fn(),
	getFeaturedPlaylist: vi.fn()
}));
vi.mock('$lib/server/soundcloud', () => ({
	getFeaturedMix,
	getFeaturedPlaylist,
	GUEST_MIX_URL: 'guest',
	BAD_BITCH_BASS_URL: 'playlist',
	BAD_BITCH_BASS_TRACK_URLS: ['t1']
}));

import { load } from './+page.server';

it('returns the featured playlist + guest mix and sets an edge cache header', async () => {
	getFeaturedMix.mockImplementation(async (url: string) => ({
		title: url,
		artworkUrl: 'a',
		permalinkUrl: url
	}));
	getFeaturedPlaylist.mockImplementation(async (url: string, tracks: string[]) => ({
		title: url,
		artworkUrl: 'a',
		permalinkUrl: url,
		tracks: tracks.map((t) => ({ title: t, permalinkUrl: t }))
	}));
	const setHeaders = vi.fn();
	const result = await load({ setHeaders } as unknown as Parameters<typeof load>[0]);
	expect(result).toEqual({
		featuredPlaylist: {
			title: 'playlist',
			artworkUrl: 'a',
			permalinkUrl: 'playlist',
			tracks: [{ title: 't1', permalinkUrl: 't1' }]
		},
		guestMix: { title: 'guest', artworkUrl: 'a', permalinkUrl: 'guest' }
	});
	expect(setHeaders).toHaveBeenCalledWith(
		expect.objectContaining({ 'cache-control': expect.stringMatching(/s-maxage=\d+/) })
	);
});
