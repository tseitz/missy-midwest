import { describe, it, expect, vi, beforeEach } from 'vitest';

const { retrieveMock, createMock, shopConfig } = vi.hoisted(() => ({
	retrieveMock: vi.fn(),
	createMock: vi.fn(),
	shopConfig: { enabled: true }
}));

vi.mock('$lib/server/stripe', () => ({
	stripe: {
		prices: { retrieve: retrieveMock },
		checkout: { sessions: { create: createMock } }
	}
}));

vi.mock('$lib/shop/config', () => ({
	get SHOP_ENABLED() {
		return shopConfig.enabled;
	}
}));

import { POST } from './+server';

function price(over: { active?: boolean; stock?: string } = {}) {
	return {
		id: 'price_a',
		active: over.active ?? true,
		unit_amount: 3200,
		product: { id: 'prod_a', metadata: { stock: over.stock ?? '8' } }
	};
}

function event(body: unknown) {
	return {
		request: new Request('http://localhost/shop/checkout', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		}),
		url: new URL('http://localhost/shop/checkout')
	} as unknown as Parameters<typeof POST>[0];
}

beforeEach(() => {
	retrieveMock.mockReset();
	createMock.mockReset();
	shopConfig.enabled = true;
});

describe('POST /shop/checkout', () => {
	it('creates a Checkout Session and returns its url', async () => {
		retrieveMock.mockResolvedValue(price());
		createMock.mockResolvedValue({ url: 'https://checkout.stripe.com/x' });

		const res = await POST(event([{ priceId: 'price_a', quantity: 2 }]));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ url: 'https://checkout.stripe.com/x' });

		const args = createMock.mock.calls[0][0];
		expect(args).not.toHaveProperty('payment_method_types');
		expect(args.mode).toBe('payment');
		expect(args.line_items).toEqual([{ price: 'price_a', quantity: 2 }]);
		expect(args.shipping_options).toHaveLength(2);
		// Local pickup first (default selection), flat-rate shipping second.
		expect(args.shipping_options[0].shipping_rate_data.fixed_amount.amount).toBe(0);
		expect(args.shipping_options[1].shipping_rate_data.fixed_amount.amount).toBe(1000);
		expect(args.shipping_address_collection.allowed_countries).toEqual(['US']);
	});

	it('rejects checkout with 503 when the shop is gated', async () => {
		shopConfig.enabled = false;
		await expect(POST(event([{ priceId: 'price_a', quantity: 1 }]))).rejects.toMatchObject({
			status: 503
		});
		expect(retrieveMock).not.toHaveBeenCalled();
		expect(createMock).not.toHaveBeenCalled();
	});

	it('rejects an empty cart with 400', async () => {
		await expect(POST(event([]))).rejects.toMatchObject({ status: 400 });
		expect(createMock).not.toHaveBeenCalled();
	});

	it('rejects a malformed line with 400', async () => {
		await expect(POST(event([{ priceId: 'price_a', quantity: 0 }]))).rejects.toMatchObject({
			status: 400
		});
	});

	it('rejects when stock is insufficient', async () => {
		retrieveMock.mockResolvedValue(price({ stock: '1' }));
		await expect(POST(event([{ priceId: 'price_a', quantity: 5 }]))).rejects.toMatchObject({
			status: 400
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it('rejects an inactive price', async () => {
		retrieveMock.mockResolvedValue(price({ active: false }));
		await expect(POST(event([{ priceId: 'price_a', quantity: 1 }]))).rejects.toMatchObject({
			status: 400
		});
	});
});
