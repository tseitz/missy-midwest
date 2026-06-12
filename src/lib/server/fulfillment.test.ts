import { describe, it, expect } from 'vitest';
import type Stripe from 'stripe';
import { stockUpdatesFromLineItems, orderFromSession } from './fulfillment';

function lineItem(over: {
	productId?: string;
	stock?: string;
	quantity?: number;
	description?: string;
	amountTotal?: number;
	productExpanded?: boolean;
}): Stripe.LineItem {
	const product =
		over.productExpanded === false
			? 'prod_str'
			: { id: over.productId ?? 'prod_a', metadata: { stock: over.stock ?? '8' } };
	return {
		description: over.description ?? 'Hat',
		quantity: over.quantity ?? 1,
		amount_total: over.amountTotal ?? 3200,
		price: { product }
	} as unknown as Stripe.LineItem;
}

describe('stockUpdatesFromLineItems', () => {
	it('subtracts purchased quantity from current stock', () => {
		const updates = stockUpdatesFromLineItems([lineItem({ stock: '8', quantity: 2 })]);
		expect(updates).toEqual([{ productId: 'prod_a', stock: 6 }]);
	});

	it('floors stock at zero (never negative)', () => {
		const updates = stockUpdatesFromLineItems([lineItem({ stock: '1', quantity: 5 })]);
		expect(updates).toEqual([{ productId: 'prod_a', stock: 0 }]);
	});

	it('skips line items whose product was not expanded', () => {
		const updates = stockUpdatesFromLineItems([lineItem({ productExpanded: false })]);
		expect(updates).toEqual([]);
	});

	it('treats missing stock metadata as zero', () => {
		const item = lineItem({ quantity: 1 });
		(item.price!.product as { metadata: Record<string, string> }).metadata = {};
		expect(stockUpdatesFromLineItems([item])).toEqual([{ productId: 'prod_a', stock: 0 }]);
	});
});

describe('orderFromSession', () => {
	function session(): Stripe.Checkout.Session {
		return {
			amount_total: 9800,
			shipping_cost: { amount_total: 1000 },
			customer_details: { email: 'buyer@example.com' },
			collected_information: {
				shipping_details: {
					name: 'Jane Buyer',
					address: {
						line1: '123 Main St',
						line2: null,
						city: 'Chicago',
						state: 'IL',
						postal_code: '60601',
						country: 'US'
					}
				}
			}
		} as unknown as Stripe.Checkout.Session;
	}

	it('maps line items, total, email, and shipping into the email payload', () => {
		const items = [
			lineItem({ description: 'Trucker — Lavender', quantity: 2, amountTotal: 6400 }),
			lineItem({ description: 'Tour Tee — L', quantity: 1, amountTotal: 2800 })
		];
		const order = orderFromSession(session(), items);
		expect(order.amountTotal).toBe(9800);
		expect(order.deliveryMethod).toBe('shipping'); // non-zero shipping_cost
		expect(order.customerEmail).toBe('buyer@example.com');
		expect(order.shippingName).toBe('Jane Buyer');
		expect(order.shippingAddress).toContain('123 Main St');
		expect(order.shippingAddress).toContain('Chicago, IL 60601');
		expect(order.lines).toEqual([
			{ description: 'Trucker — Lavender', quantity: 2, amountTotal: 6400 },
			{ description: 'Tour Tee — L', quantity: 1, amountTotal: 2800 }
		]);
	});

	it('tolerates a session with no shipping details', () => {
		const bare = {
			amount_total: 3200,
			customer_details: null,
			collected_information: null
		} as unknown as Stripe.Checkout.Session;
		const order = orderFromSession(bare, [lineItem({ quantity: 1 })]);
		expect(order.shippingName).toBeNull();
		expect(order.shippingAddress).toBeNull();
		expect(order.customerEmail).toBeNull();
		expect(order.deliveryMethod).toBe('pickup'); // no shipping_cost → pickup
	});
});
