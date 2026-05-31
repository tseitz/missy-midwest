import type { CatalogProductInput, ProductGroup, Variant, VariantType } from './types';
import { parseStock } from './stock';

function isVariantType(raw: string | undefined): raw is VariantType {
	return raw === 'color' || raw === 'size';
}

interface Accumulator {
	name: string;
	description: string;
	variantType: VariantType | null;
	rows: { variant: Variant; sort: number }[];
}

/**
 * Cluster Stripe products (one product per variant) into ProductGroups by
 * `metadata.group`. Pure — no network. Products missing a group slug or price
 * are skipped with a warning.
 */
export function groupProducts(products: CatalogProductInput[]): ProductGroup[] {
	const groups = new Map<string, Accumulator>();

	for (const product of products) {
		const slug = product.metadata.group;
		if (!slug || !product.price) {
			console.warn(`Skipping product ${product.id}: missing group metadata or price`);
			continue;
		}

		const variant: Variant = {
			priceId: product.price.id,
			productId: product.id,
			label: product.metadata.variant || product.name,
			image: product.images[0] ?? '',
			price: product.price.unitAmount,
			stock: parseStock(product.metadata.stock)
		};
		const sort = Number.parseInt(product.metadata.sort ?? '', 10) || 0;

		const existing = groups.get(slug);
		if (existing) {
			existing.rows.push({ variant, sort });
		} else {
			groups.set(slug, {
				name: product.metadata.groupName || product.name,
				description: product.description,
				variantType: isVariantType(product.metadata.variantType)
					? product.metadata.variantType
					: null,
				rows: [{ variant, sort }]
			});
		}
	}

	const result: ProductGroup[] = [];
	for (const [slug, acc] of groups) {
		const rows = acc.rows.sort(
			(a, b) => a.sort - b.sort || a.variant.label.localeCompare(b.variant.label)
		);
		const variants = rows.map((r) => r.variant);
		const representative = variants.find((v) => v.stock > 0) ?? variants[0];
		result.push({
			slug,
			name: acc.name,
			description: acc.description,
			variantType: variants.length > 1 ? acc.variantType : null,
			image: representative.image,
			fromPrice: Math.min(...variants.map((v) => v.price)),
			variants
		});
	}

	return result.sort((a, b) => a.name.localeCompare(b.name));
}
