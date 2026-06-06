import { describe, it, expect, vi, beforeEach } from 'vitest';

const { getGroupMock, shopConfig } = vi.hoisted(() => ({
	getGroupMock: vi.fn(),
	shopConfig: { enabled: true }
}));

vi.mock('$lib/server/catalog', () => ({ getGroup: getGroupMock }));
vi.mock('$lib/shop/config', () => ({
	get SHOP_ENABLED() {
		return shopConfig.enabled;
	}
}));

import { load } from './+page.server';

function event(group: string) {
	return { params: { group } } as unknown as Parameters<typeof load>[0];
}

beforeEach(() => {
	getGroupMock.mockReset();
	shopConfig.enabled = true;
});

describe('shop/[group] load', () => {
	it('redirects to /shop when the shop is gated', async () => {
		shopConfig.enabled = false;
		await expect(load(event('classic-trucker'))).rejects.toMatchObject({
			status: 307,
			location: '/shop'
		});
		expect(getGroupMock).not.toHaveBeenCalled();
	});

	it('returns the group when live', async () => {
		const group = { slug: 'classic-trucker', name: 'Classic Trucker' };
		getGroupMock.mockResolvedValue(group);
		await expect(load(event('classic-trucker'))).resolves.toEqual({ group });
	});

	it('404s an unknown group when live', async () => {
		getGroupMock.mockResolvedValue(undefined);
		await expect(load(event('nope'))).rejects.toMatchObject({ status: 404 });
	});
});
