import { json, error } from '@sveltejs/kit';
import type Stripe from 'stripe';
import { stripe } from '$lib/server/stripe';
import { env } from '$env/dynamic/private';
import { sendOrderNotification } from '$lib/server/email';
import { stockUpdatesFromLineItems, orderFromSession } from '$lib/server/fulfillment';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const signature = request.headers.get('stripe-signature') ?? '';
	const payload = await request.text();

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET ?? '');
	} catch (err) {
		console.error('Stripe webhook signature verification failed:', err);
		error(400, 'Invalid signature.');
	}

	if (event.type !== 'checkout.session.completed') {
		return json({ received: true });
	}

	const session = event.data.object as Stripe.Checkout.Session;
	// Best-effort idempotency: log the event id (no database — duplicate deliveries are tolerated).
	console.info(`Fulfilling Stripe checkout session ${session.id} (event ${event.id})`);

	const full = await stripe.checkout.sessions.retrieve(session.id, {
		expand: ['line_items.data.price.product']
	});
	const items = full.line_items?.data ?? [];

	// Decrement stock per item. Stripe merges metadata by key, so other keys are preserved.
	// Each update is independent: a single failure is logged but doesn't abort the rest.
	for (const update of stockUpdatesFromLineItems(items)) {
		try {
			await stripe.products.update(update.productId, {
				metadata: { stock: String(update.stock) }
			});
		} catch (err) {
			console.error(`Failed to update stock for product ${update.productId}:`, err);
		}
	}

	try {
		await sendOrderNotification(orderFromSession(full, items));
	} catch (err) {
		console.error('Failed to send order notification email:', err);
	}

	return json({ received: true });
};
