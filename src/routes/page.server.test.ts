import { describe, it, expect, vi, beforeEach } from 'vitest';

const { getNextEventsMock, listGroupsMock, getInstagramMock, shopConfig, homeConfig } = vi.hoisted(
	() => ({
		getNextEventsMock: vi.fn(),
		listGroupsMock: vi.fn(),
		getInstagramMock: vi.fn(),
		shopConfig: { enabled: true },
		homeConfig: { instagram: true }
	})
);

vi.mock('$lib/server/calendar', () => ({ getNextEvents: getNextEventsMock }));
vi.mock('$lib/server/catalog', () => ({ listGroups: listGroupsMock }));
vi.mock('$lib/server/instagram', () => ({ getInstagramFeed: getInstagramMock }));
vi.mock('$lib/shop/config', () => ({
	get SHOP_ENABLED() {
		return shopConfig.enabled;
	}
}));
vi.mock('$lib/home/config', () => ({
	get INSTAGRAM_ENABLED() {
		return homeConfig.instagram;
	}
}));

import { load } from './+page.server';

function event(setHeaders = vi.fn()) {
	return { setHeaders } as unknown as Parameters<typeof load>[0];
}

beforeEach(() => {
	getNextEventsMock.mockReset().mockResolvedValue({ events: [] });
	getInstagramMock.mockReset().mockResolvedValue({ posts: [] });
	listGroupsMock.mockReset().mockResolvedValue({ groups: [], error: null });
	shopConfig.enabled = true;
	homeConfig.instagram = true;
});

describe('home +page load', () => {
	it('skips the catalog when the shop is gated', async () => {
		shopConfig.enabled = false;
		const data = await load(event());
		expect(listGroupsMock).not.toHaveBeenCalled();
		expect(data).toMatchObject({ shopGroups: [] });
	});

	// Gating the feed must also stop the Behold request, not just hide the
	// section — otherwise a paused feed keeps burning views and firing Sentry.
	it('skips the Behold fetch when the Instagram feed is gated', async () => {
		homeConfig.instagram = false;
		const data = await load(event());
		expect(getInstagramMock).not.toHaveBeenCalled();
		expect(data).toMatchObject({ instagramPosts: [] });
	});

	it('fetches the feed when the Instagram feed is live', async () => {
		getInstagramMock.mockResolvedValue({ posts: [{ id: '1' }] });
		const data = await load(event());
		expect(getInstagramMock).toHaveBeenCalled();
		expect(data).toMatchObject({ instagramPosts: [{ id: '1' }] });
	});

	it('sets a shared-CDN cache-control so the edge absorbs the SSR latency', async () => {
		const setHeaders = vi.fn();
		await load(event(setHeaders));
		expect(setHeaders).toHaveBeenCalledWith(
			expect.objectContaining({
				'cache-control': expect.stringContaining('s-maxage=300')
			})
		);
	});

	it('features up to 6 groups (in priority order) when live', async () => {
		listGroupsMock.mockResolvedValue({
			groups: ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((slug) => ({ slug })),
			error: null
		});
		const data = await load(event());
		expect(listGroupsMock).toHaveBeenCalled();
		// toMatchObject checks array length too, so this also asserts the 7th is dropped.
		expect(data).toMatchObject({
			shopGroups: ['a', 'b', 'c', 'd', 'e', 'f'].map((slug) => ({ slug }))
		});
	});
});
