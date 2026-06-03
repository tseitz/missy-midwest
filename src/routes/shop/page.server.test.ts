import { describe, it, expect, vi, beforeEach } from 'vitest';

const { listGroupsMock, shopConfig } = vi.hoisted(() => ({
	listGroupsMock: vi.fn(),
	shopConfig: { enabled: true }
}));

vi.mock('$lib/server/catalog', () => ({ listGroups: listGroupsMock }));
vi.mock('$lib/shop/config', () => ({
	get SHOP_ENABLED() {
		return shopConfig.enabled;
	}
}));

import { load } from './+page.server';

function event() {
	return {} as unknown as Parameters<typeof load>[0];
}

beforeEach(() => {
	listGroupsMock.mockReset();
	listGroupsMock.mockResolvedValue({ groups: [], error: null });
	shopConfig.enabled = true;
});

describe('shop/+page load', () => {
	it('short-circuits without calling Stripe when gated', async () => {
		shopConfig.enabled = false;
		const data = await load(event());
		expect(listGroupsMock).not.toHaveBeenCalled();
		expect(data).toEqual({ shopEnabled: false, groups: [], loadError: false });
	});

	it('lists groups when live', async () => {
		listGroupsMock.mockResolvedValue({ groups: [{ slug: 'x' }], error: null });
		const data = await load(event());
		expect(listGroupsMock).toHaveBeenCalled();
		expect(data).toEqual({ shopEnabled: true, groups: [{ slug: 'x' }], loadError: false });
	});

	it('flags a load error when the catalog fails', async () => {
		listGroupsMock.mockResolvedValue({ groups: [], error: new Error('stripe down') });
		const data = await load(event());
		expect(data).toMatchObject({ shopEnabled: true, loadError: true });
	});
});
