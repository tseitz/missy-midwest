import type Stripe from 'stripe';
import { parseStock } from '$lib/shop/stock';
import type { OrderEmailData, OrderEmailLine } from './email-templates';

export interface StockUpdate {
	productId: string;
	stock: number; // new floored stock level
}

/** New floored stock levels for each expanded line item. Items without an expanded product are skipped. */
export function stockUpdatesFromLineItems(items: Stripe.LineItem[]): StockUpdate[] {
	const updates: StockUpdate[] = [];
	for (const item of items) {
		const product = item.price?.product;
		if (!product || typeof product === 'string' || ('deleted' in product && product.deleted)) {
			continue;
		}
		const current = parseStock(product.metadata?.stock);
		const stock = Math.max(0, current - (item.quantity ?? 0));
		updates.push({ productId: product.id, stock });
	}
	return updates;
}

type ShippingDetails = NonNullable<
	Stripe.Checkout.Session['collected_information']
>['shipping_details'];

function formatAddress(shipping: ShippingDetails): string | null {
	if (!shipping?.address) return null;
	const a = shipping.address;
	const cityLine = `${a.city ?? ''}, ${a.state ?? ''} ${a.postal_code ?? ''}`.trim();
	return [a.line1, a.line2, cityLine, a.country]
		.filter((part): part is string => Boolean(part && part.trim()))
		.join('\n');
}

/** Build the order-notification payload from a completed session and its expanded line items. */
export function orderFromSession(
	session: Stripe.Checkout.Session,
	items: Stripe.LineItem[]
): OrderEmailData {
	const lines: OrderEmailLine[] = items.map((item) => ({
		description: item.description ?? 'Item',
		quantity: item.quantity ?? 0,
		amountTotal: item.amount_total ?? 0
	}));
	const shipping = session.collected_information?.shipping_details ?? null;
	return {
		lines,
		amountTotal: session.amount_total ?? 0,
		customerEmail: session.customer_details?.email ?? null,
		shippingName: shipping?.name ?? null,
		shippingAddress: formatAddress(shipping)
	};
}
