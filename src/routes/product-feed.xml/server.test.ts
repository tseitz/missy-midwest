import { describe, it, expect, vi, beforeEach } from 'vitest';

const { listGroupsMock, shopConfig } = vi.hoisted(() => ({
	listGroupsMock: vi.fn(),
	shopConfig: { enabled: true }
}));

vi.mock('$lib/server/catalog', () => ({ listGroups: listGroupsMock }));
vi.mock('$lib/shop/config', () => ({
	get SHOP_ENABLED() {
		return shopConfig.enabled;
	},
	SHIPPING_RATE_CENTS: 1000
}));

import { GET } from './+server';

function event() {
	return { url: new URL('https://missymidwest.com/product-feed.xml') } as unknown as Parameters<
		typeof GET
	>[0];
}

const group = {
	slug: 'snapback',
	name: 'Snapback',
	description: 'Embroidered snapback.',
	variantType: null,
	image: 'https://files.stripe.com/hat.jpg',
	fromPrice: 3200,
	variants: [
		{
			priceId: 'price_1',
			productId: 'prod_1',
			label: 'One Size',
			image: 'https://files.stripe.com/hat.jpg',
			price: 3200,
			stock: 7
		}
	]
};

beforeEach(() => {
	listGroupsMock.mockReset();
	listGroupsMock.mockResolvedValue({ groups: [group] });
	shopConfig.enabled = true;
});

describe('GET /product-feed.xml', () => {
	it('serves the feed as XML built from the live catalog', async () => {
		const res = await GET(event());
		expect(res.status).toBe(200);
		expect(res.headers.get('Content-Type')).toBe('application/xml');
		const body = await res.text();
		expect(body).toContain('<g:id>prod_1</g:id>');
		expect(body).toContain('<link>https://missymidwest.com/shop/snapback</link>');
	});

	it('404s while the shop is gated, without calling Stripe', async () => {
		shopConfig.enabled = false;
		await expect(GET(event())).rejects.toMatchObject({ status: 404 });
		expect(listGroupsMock).not.toHaveBeenCalled();
	});

	it('503s on a catalog failure rather than serving an empty feed', async () => {
		listGroupsMock.mockResolvedValue({ groups: [], error: 'Stripe down' });
		await expect(GET(event())).rejects.toMatchObject({ status: 503 });
	});
});
