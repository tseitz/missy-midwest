import type Stripe from 'stripe';

/** Parse a Stripe `metadata.stock` string into a non-negative integer (0 if missing/invalid). */
export function parseStock(raw: string | null | undefined): number {
	const n = Number.parseInt(raw ?? '', 10);
	return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Stock level for a Stripe price's (optionally expanded) product. Returns 0 when
 * the product is unexpanded (a bare id string) or deleted.
 */
export function stockFromProduct(product: Stripe.Price['product']): number {
	if (typeof product === 'string') return 0;
	if ('deleted' in product && product.deleted) return 0;
	return parseStock(product.metadata?.stock);
}
