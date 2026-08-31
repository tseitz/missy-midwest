import { SITE_NAME } from '$lib/seo/config';
import { SHIPPING_RATE_CENTS } from './config';
import { variantSlug } from './shop-cards';
import type { ProductGroup, Variant } from './types';

/**
 * Merchant Center reads this as a scheduled fetch, so a single malformed
 * character rejects the whole file rather than one row. Escape every
 * Stripe-authored string on the way in.
 */
function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/** Merchant Center wants "32.00 USD" — amount, space, currency. */
function feedPrice(cents: number): string {
	return `${(cents / 100).toFixed(2)} USD`;
}

function itemXml(group: ProductGroup, variant: Variant, origin: string): string {
	const multi = group.variants.length > 1;
	const path = multi
		? `/shop/${group.slug}?variant=${variantSlug(variant.label)}`
		: `/shop/${group.slug}`;
	const title = multi ? `${group.name} - ${variant.label}` : group.name;

	const lines = [
		`<g:id>${escapeXml(variant.productId)}</g:id>`,
		`<title>${escapeXml(title)}</title>`,
		`<description>${escapeXml(group.description || group.name)}</description>`,
		`<link>${escapeXml(origin + path)}</link>`,
		`<g:image_link>${escapeXml(variant.image)}</g:image_link>`,
		`<g:availability>${variant.stock > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>`,
		`<g:price>${feedPrice(variant.price)}</g:price>`,
		`<g:condition>new</g:condition>`,
		`<g:brand>${escapeXml(SITE_NAME)}</g:brand>`,
		// No barcode exists for custom merch, so Google needs both the explicit
		// "no identifier" flag and an MPN it can use as the stable key instead.
		`<g:identifier_exists>no</g:identifier_exists>`,
		`<g:mpn>${escapeXml(variant.productId)}</g:mpn>`,
		// Apparel listings are rejected in the US without these two.
		`<g:age_group>adult</g:age_group>`,
		`<g:gender>unisex</g:gender>`
	];

	if (multi) {
		lines.push(`<g:item_group_id>${escapeXml(group.slug)}</g:item_group_id>`);
		const axis = group.variantType === 'size' ? 'size' : 'color';
		lines.push(`<g:${axis}>${escapeXml(variant.label)}</g:${axis}>`);
	}

	lines.push(
		'<g:shipping>',
		'<g:country>US</g:country>',
		`<g:price>${feedPrice(SHIPPING_RATE_CENTS)}</g:price>`,
		'</g:shipping>'
	);

	return `\t\t<item>\n${lines.map((line) => `\t\t\t${line}`).join('\n')}\n\t\t</item>`;
}

/**
 * Build the RSS 2.0 product feed Merchant Center fetches on a schedule.
 *
 * One `<item>` per variant, not per group — each color and size has its own
 * price, stock and landing URL, and Merchant Center treats an item as a single
 * buyable thing. `g:item_group_id` is what re-joins them into one product.
 *
 * A variant with no image is dropped: Merchant Center rejects an imageless item
 * anyway, and a rejected row counts against the account's health score.
 */
export function buildProductFeed(groups: ProductGroup[], origin: string): string {
	const items = groups
		.flatMap((group) =>
			group.variants
				.filter((variant) => variant.image)
				.map((variant) => itemXml(group, variant, origin))
		)
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
\t<channel>
\t\t<title>${escapeXml(SITE_NAME)}</title>
\t\t<link>${escapeXml(origin)}/shop</link>
\t\t<description>Official ${escapeXml(SITE_NAME)} merch.</description>
${items}
\t</channel>
</rss>
`;
}
