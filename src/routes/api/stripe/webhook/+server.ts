import { json, error } from '@sveltejs/kit';
import type Stripe from 'stripe';
import { stripe } from '$lib/server/stripe';
import { env } from '$env/dynamic/private';
import { sendOrderNotification, sendOrderConfirmation } from '$lib/server/email';
import { stockUpdatesFromLineItems, orderFromSession } from '$lib/server/fulfillment';
import { reportFailure, errorMessage } from '$lib/server/report';
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
	const full = await stripe.checkout.sessions.retrieve(session.id, {
		expand: ['line_items.data.price.product']
	});

	// Idempotency without a database: Stripe retries delivery (on timeouts/5xx), so
	// we stamp the session once fulfilled and skip on redelivery — preventing double
	// stock-decrement and duplicate order emails. (Concurrent checkouts of the *same*
	// SKU can still race on the shared stock metadata; that's an inherent limit of
	// using Stripe metadata as the inventory store, acceptable at this volume.)
	if (full.metadata?.fulfilled === 'true') {
		return json({ received: true });
	}
	console.info(`Fulfilling Stripe checkout session ${session.id} (event ${event.id})`);

	const items = full.line_items?.data ?? [];

	// Decrement stock per item. Stripe merges metadata by key, so other keys are
	// preserved. Each update is independent: a failure is alerted but doesn't abort
	// the rest (partial fulfillment beats none).
	for (const update of stockUpdatesFromLineItems(items)) {
		try {
			await stripe.products.update(update.productId, {
				metadata: { stock: String(update.stock) }
			});
		} catch (err) {
			reportFailure(`Stock update failed for product ${update.productId}`, errorMessage(err));
		}
	}

	// Two independent emails: Missy's order alert and the buyer's confirmation.
	// Each is isolated so one failing still sends the other (and never 500s checkout).
	const order = orderFromSession(full, items);
	try {
		await sendOrderNotification(order);
	} catch (err) {
		reportFailure('Order notification email failed', errorMessage(err));
	}
	try {
		await sendOrderConfirmation(order);
	} catch (err) {
		reportFailure('Order confirmation email failed', errorMessage(err));
	}

	// Stamp last, so an uncaught crash mid-fulfillment retries rather than skipping.
	try {
		await stripe.checkout.sessions.update(session.id, { metadata: { fulfilled: 'true' } });
	} catch (err) {
		reportFailure(`Failed to mark session ${session.id} fulfilled`, errorMessage(err));
	}

	return json({ received: true });
};
