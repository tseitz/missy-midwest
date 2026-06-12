import type { ProductGroup, Variant } from './types';

/** A flat, presentational card for the shop grid. */
export interface ShopCard {
	id: string; // unique grid key
	slug: string; // group slug, for the link
	variantSlug?: string; // present => link appends ?variant=<slug>
	name: string; // group name (title)
	variantLabel?: string; // color subtitle — color cards only
	image: string;
	price: number; // cents
	priceVaries: boolean; // "from" prefix — group cards only
	soldOut: boolean;
}

/** Slugify a variant label for use in URLs: "Sky Blue" -> "sky-blue". */
export function variantSlug(label: string): string {
	return label
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Flatten product groups into shop cards. Color groups expand into one card per
 * variant (so shoppers see every color on the grid); every other group stays a
 * single card. Pure — no Svelte, no network.
 */
export function toShopCards(groups: ProductGroup[]): ShopCard[] {
	const cards: ShopCard[] = [];

	for (const group of groups) {
		if (group.variantType === 'color') {
			for (const variant of group.variants) {
				const slug = variantSlug(variant.label);
				cards.push({
					id: `${group.slug}-${slug}`,
					slug: group.slug,
					variantSlug: slug,
					name: group.name,
					variantLabel: variant.label,
					image: variant.image,
					price: variant.price,
					priceVaries: false,
					soldOut: variant.stock <= 0
				});
			}
		} else {
			const priceVaries = new Set(group.variants.map((v) => v.price)).size > 1;
			cards.push({
				id: group.slug,
				slug: group.slug,
				name: group.name,
				image: group.image,
				price: group.fromPrice,
				priceVaries,
				soldOut: group.variants.every((v) => v.stock <= 0)
			});
		}
	}

	return cards;
}

/**
 * Choose which variant a product page opens on. An explicit `?variant=` slug
 * wins even if that variant is sold out (the shopper clicked that card); else
 * the first in-stock variant; else the first variant.
 */
export function pickInitialVariant(group: ProductGroup, slug: string | null): Variant {
	if (slug) {
		const matched = group.variants.find((v) => variantSlug(v.label) === slug);
		if (matched) return matched;
	}
	return group.variants.find((v) => v.stock > 0) ?? group.variants[0];
}
