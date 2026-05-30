export type VariantType = 'color' | 'size';

/** One buyable variant = one Stripe Product (with one Price). */
export interface Variant {
	priceId: string; // Stripe Price ID — checkout line target
	productId: string; // Stripe Product ID — stock writeback target
	label: string; // "Lavender" | "M"
	image: string;
	price: number; // cents
	stock: number;
}

/** A style: 1+ variants sharing a `group` slug. */
export interface ProductGroup {
	slug: string;
	name: string;
	description: string;
	variantType: VariantType | null; // null = single-variant (no toggle)
	image: string; // representative image (first in-stock, else first)
	fromPrice: number; // min variant price (cents)
	variants: Variant[]; // 1+, sorted
}

/**
 * Narrow shape `groupProducts` consumes — decouples the pure grouping logic
 * from the Stripe SDK so it can be unit-tested with plain objects.
 */
export interface CatalogProductInput {
	id: string;
	name: string;
	description: string;
	images: string[];
	metadata: Record<string, string>;
	price: { id: string; unitAmount: number } | null;
}
