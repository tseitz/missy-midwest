import { it, expect, vi } from 'vitest';

const { getFeaturedMix } = vi.hoisted(() => ({ getFeaturedMix: vi.fn() }));
vi.mock('$lib/server/soundcloud', () => ({ getFeaturedMix }));

import { load } from './+page.server';

it('returns the featured mix and sets an edge cache header', async () => {
	getFeaturedMix.mockResolvedValue({ title: 'X', artworkUrl: 'a', permalinkUrl: 'p' });
	const setHeaders = vi.fn();
	const result = await load({ setHeaders } as unknown as Parameters<typeof load>[0]);
	expect(result).toEqual({ featuredMix: { title: 'X', artworkUrl: 'a', permalinkUrl: 'p' } });
	expect(setHeaders).toHaveBeenCalledWith(
		expect.objectContaining({ 'cache-control': expect.stringMatching(/s-maxage=\d+/) })
	);
});
