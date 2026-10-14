import { it, expect, vi } from 'vitest';

const { getFeaturedMix } = vi.hoisted(() => ({ getFeaturedMix: vi.fn() }));
vi.mock('$lib/server/soundcloud', () => ({
	getFeaturedMix,
	GUEST_MIX_URL: 'guest',
	FEATURED_MIX_URL: 'featured'
}));

import { load } from './+page.server';

it('returns both mixes and sets an edge cache header', async () => {
	getFeaturedMix.mockImplementation(async (url: string) => ({
		title: url,
		artworkUrl: 'a',
		permalinkUrl: url
	}));
	const setHeaders = vi.fn();
	const result = await load({ setHeaders } as unknown as Parameters<typeof load>[0]);
	expect(result).toEqual({
		guestMix: { title: 'guest', artworkUrl: 'a', permalinkUrl: 'guest' },
		featuredMix: { title: 'featured', artworkUrl: 'a', permalinkUrl: 'featured' }
	});
	expect(setHeaders).toHaveBeenCalledWith(
		expect.objectContaining({ 'cache-control': expect.stringMatching(/s-maxage=\d+/) })
	);
});
