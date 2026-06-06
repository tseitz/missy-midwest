import { describe, it, expect, vi, beforeEach } from 'vitest';

const { getNextEventsMock, listGroupsMock, getInstagramMock, shopConfig } = vi.hoisted(() => ({
	getNextEventsMock: vi.fn(),
	listGroupsMock: vi.fn(),
	getInstagramMock: vi.fn(),
	shopConfig: { enabled: true }
}));

vi.mock('$lib/server/calendar', () => ({ getNextEvents: getNextEventsMock }));
vi.mock('$lib/server/catalog', () => ({ listGroups: listGroupsMock }));
vi.mock('$lib/server/instagram', () => ({ getInstagramFeed: getInstagramMock }));
vi.mock('$lib/shop/config', () => ({
	get SHOP_ENABLED() {
		return shopConfig.enabled;
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
});

describe('home +page load', () => {
	it('skips the catalog when the shop is gated', async () => {
		shopConfig.enabled = false;
		const data = await load(event());
		expect(listGroupsMock).not.toHaveBeenCalled();
		expect(data).toMatchObject({ shopGroups: [] });
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

	it('loads up to 3 groups when live', async () => {
		listGroupsMock.mockResolvedValue({
			groups: [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }, { slug: 'd' }],
			error: null
		});
		const data = await load(event());
		expect(listGroupsMock).toHaveBeenCalled();
		expect(data).toMatchObject({ shopGroups: [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }] });
	});
});
