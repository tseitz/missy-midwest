import { json, error } from '@sveltejs/kit';
import type Stripe from 'stripe';
import { z } from 'zod';
import { stripe } from '$lib/server/stripe';
import { stockFromProduct } from '$lib/shop/stock';
import { SHOP_ENABLED } from '$lib/shop/config';
import type { RequestHandler } from './$types';

const SHIPPING_RATE_CENTS = 600;

const checkoutBodySchema = z
	.array(z.object({ priceId: z.string().min(1), quantity: z.number().int().min(1) }))
	.min(1);

export const POST: RequestHandler = async ({ request, url }) => {
	if (!SHOP_ENABLED) error(503, 'The shop is not open yet.');

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid request.');
	}

	const parsed = checkoutBodySchema.safeParse(body);
	if (!parsed.success) {
		// Keep the user-facing distinction the storefront relies on.
		if (Array.isArray(body) && body.length === 0) error(400, 'Your cart is empty.');
		error(400, 'Your cart contains an invalid item.');
	}

	const lines = parsed.data;
	const lineItems: { price: string; quantity: number }[] = [];

	for (const line of lines) {
		let price: Stripe.Price;
		try {
			price = await stripe.prices.retrieve(line.priceId, { expand: ['product'] });
		} catch {
			error(400, 'An item in your cart is no longer available.');
		}
		if (!price.active) {
			error(400, 'An item in your cart is no longer available.');
		}
		if (stockFromProduct(price.product) < line.quantity) {
			error(400, 'An item in your cart just sold out.');
		}
		lineItems.push({ price: line.priceId, quantity: line.quantity });
	}

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		line_items: lineItems,
		shipping_address_collection: { allowed_countries: ['US'] },
		shipping_options: [
			{
				shipping_rate_data: {
					type: 'fixed_amount',
					fixed_amount: { amount: SHIPPING_RATE_CENTS, currency: 'usd' },
					display_name: 'Flat-rate shipping'
				}
			},
			{
				shipping_rate_data: {
					type: 'fixed_amount',
					fixed_amount: { amount: 0, currency: 'usd' },
					display_name: 'Local pickup'
				}
			}
		],
		success_url: `${url.origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${url.origin}/shop/cancel`
	});

	return json({ url: session.url });
};
