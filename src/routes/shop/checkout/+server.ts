import { json, error } from '@sveltejs/kit';
import type Stripe from 'stripe';
import { stripe } from '$lib/server/stripe';
import { stockFromProduct } from '$lib/shop/stock';
import type { RequestHandler } from './$types';

const SHIPPING_RATE_CENTS = 600;

interface CheckoutLine {
	priceId: string;
	quantity: number;
}

function isValidLine(line: unknown): line is CheckoutLine {
	return (
		typeof line === 'object' &&
		line !== null &&
		typeof (line as CheckoutLine).priceId === 'string' &&
		Number.isInteger((line as CheckoutLine).quantity) &&
		(line as CheckoutLine).quantity >= 1
	);
}

export const POST: RequestHandler = async ({ request, url }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid request.');
	}

	if (!Array.isArray(body) || body.length === 0) {
		error(400, 'Your cart is empty.');
	}
	if (!body.every(isValidLine)) {
		error(400, 'Your cart contains an invalid item.');
	}

	const lines = body as CheckoutLine[];
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
