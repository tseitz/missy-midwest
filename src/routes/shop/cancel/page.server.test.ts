import { describe, it, expect, vi, beforeEach } from 'vitest';

const { shopConfig } = vi.hoisted(() => ({ shopConfig: { enabled: true } }));
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
	shopConfig.enabled = true;
});

describe('shop/cancel load', () => {
	it('redirects to /shop when gated', async () => {
		shopConfig.enabled = false;
		await expect(load(event())).rejects.toMatchObject({ status: 307, location: '/shop' });
	});

	it('renders normally when live', async () => {
		await expect(load(event())).resolves.toEqual({});
	});
});
