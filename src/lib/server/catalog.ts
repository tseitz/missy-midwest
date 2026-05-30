import type Stripe from 'stripe';
import { stripe } from './stripe';
import { groupProducts } from '$lib/shop/group-products';
import type { CatalogProductInput, ProductGroup } from '$lib/shop/types';

export interface CatalogResult {
	groups: ProductGroup[];
	error?: string;
}

function toInput(product: Stripe.Product): CatalogProductInput {
	const price = product.default_price;
	const expanded = price && typeof price !== 'string' ? price : null;
	const unitAmount = expanded?.unit_amount ?? 0;
	return {
		id: product.id,
		name: product.name,
		description: product.description ?? '',
		images: product.images ?? [],
		metadata: product.metadata ?? {},
		price: expanded ? { id: expanded.id, unitAmount } : null
	};
}

/** Fetch all active products from Stripe and cluster them into groups. Stock is never cached. */
export async function listGroups(): Promise<CatalogResult> {
	try {
		const res = await stripe.products.list({
			active: true,
			limit: 100,
			expand: ['data.default_price']
		});
		return { groups: groupProducts(res.data.map(toInput)) };
	} catch (error) {
		console.error('Stripe catalog error:', error);
		return { groups: [], error: error instanceof Error ? error.message : 'Unknown error' };
	}
}

/** Return the group matching `slug`, or null if not found. */
export async function getGroup(slug: string): Promise<ProductGroup | null> {
	const { groups } = await listGroups();
	return groups.find((group) => group.slug === slug) ?? null;
}
