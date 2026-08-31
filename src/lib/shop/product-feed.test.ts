import { describe, it, expect } from 'vitest';
import { buildProductFeed } from './product-feed';
import type { ProductGroup, Variant } from './types';

const ORIGIN = 'https://missymidwest.com';

function variant(overrides: Partial<Variant> = {}): Variant {
	return {
		priceId: 'price_1',
		productId: 'prod_1',
		label: 'One Size',
		image: 'https://files.stripe.com/hat.jpg',
		price: 3200,
		stock: 7,
		...overrides
	};
}

function group(overrides: Partial<ProductGroup> = {}): ProductGroup {
	const variants = overrides.variants ?? [variant()];
	return {
		slug: 'snapback',
		name: 'Snapback',
		description: 'Embroidered snapback.',
		variantType: null,
		image: variants[0].image,
		fromPrice: variants[0].price,
		...overrides,
		variants
	};
}

/** Pull the text of the first `<tag>` inside each `<item>` block. */
function itemValues(xml: string, tag: string): string[] {
	return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
		const found = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(m[1]);
		return found ? found[1] : '';
	});
}

describe('buildProductFeed', () => {
	it('wraps items in an RSS 2.0 channel declaring the Google namespace', () => {
		const xml = buildProductFeed([group()], ORIGIN);
		expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
		expect(xml).toContain('xmlns:g="http://base.google.com/ns/1.0"');
		expect(xml).toContain('<rss version="2.0"');
		expect(xml).toContain(`<link>${ORIGIN}/shop</link>`);
	});

	it('emits one item per variant, not per group', () => {
		const xml = buildProductFeed(
			[
				group({
					variantType: 'color',
					variants: [
						variant({ productId: 'prod_blue', label: 'Blue' }),
						variant({ productId: 'prod_pink', label: 'Pink' })
					]
				}),
				group({ slug: 'tee', name: 'Tee', variants: [variant({ productId: 'prod_tee' })] })
			],
			ORIGIN
		);
		expect(itemValues(xml, 'g:id')).toEqual(['prod_blue', 'prod_pink', 'prod_tee']);
	});

	it('carries the attributes Merchant Center requires for a listing', () => {
		const xml = buildProductFeed([group()], ORIGIN);
		expect(itemValues(xml, 'g:price')).toEqual(['32.00 USD']);
		expect(itemValues(xml, 'g:availability')).toEqual(['in_stock']);
		expect(itemValues(xml, 'g:condition')).toEqual(['new']);
		expect(itemValues(xml, 'g:brand')).toEqual(['Missy Midwest']);
		expect(itemValues(xml, 'g:image_link')).toEqual(['https://files.stripe.com/hat.jpg']);
		expect(itemValues(xml, 'link')).toEqual([`${ORIGIN}/shop/snapback`]);
	});

	it('declares no barcode, since custom merch has no GTIN', () => {
		const xml = buildProductFeed([group()], ORIGIN);
		expect(itemValues(xml, 'g:identifier_exists')).toEqual(['no']);
		expect(itemValues(xml, 'g:mpn')).toEqual(['prod_1']);
	});

	it('declares the flat US shipping rate on every item', () => {
		const xml = buildProductFeed([group()], ORIGIN);
		expect(xml).toContain('<g:country>US</g:country>');
		expect(xml).toContain('<g:price>10.00 USD</g:price>');
	});

	it('marks a zero-stock variant out of stock', () => {
		const xml = buildProductFeed([group({ variants: [variant({ stock: 0 })] })], ORIGIN);
		expect(itemValues(xml, 'g:availability')).toEqual(['out_of_stock']);
	});

	it('ties variants together with item_group_id and a deep link', () => {
		const xml = buildProductFeed(
			[
				group({
					slug: 'corduroy-hat',
					name: 'Corduroy Hat',
					variantType: 'color',
					variants: [
						variant({ productId: 'prod_a', label: 'Storm Blue' }),
						variant({ productId: 'prod_b', label: 'Velvet Purple' })
					]
				})
			],
			ORIGIN
		);
		expect(itemValues(xml, 'g:item_group_id')).toEqual(['corduroy-hat', 'corduroy-hat']);
		expect(itemValues(xml, 'g:color')).toEqual(['Storm Blue', 'Velvet Purple']);
		expect(itemValues(xml, 'link')).toEqual([
			`${ORIGIN}/shop/corduroy-hat?variant=storm-blue`,
			`${ORIGIN}/shop/corduroy-hat?variant=velvet-purple`
		]);
	});

	it('titles a variant so the two colors do not look like duplicates', () => {
		const xml = buildProductFeed(
			[
				group({
					variantType: 'color',
					variants: [
						variant({ productId: 'prod_a', label: 'Blue' }),
						variant({ productId: 'prod_b', label: 'Pink' })
					]
				})
			],
			ORIGIN
		);
		expect(itemValues(xml, 'title')).toEqual(['Snapback - Blue', 'Snapback - Pink']);
	});

	it('sends size, not color, for a size-varying group', () => {
		const xml = buildProductFeed(
			[
				group({
					slug: 'lake-tee',
					variantType: 'size',
					variants: [
						variant({ productId: 'prod_m', label: 'M' }),
						variant({ productId: 'prod_l', label: 'L' })
					]
				})
			],
			ORIGIN
		);
		expect(itemValues(xml, 'g:size')).toEqual(['M', 'L']);
		expect(itemValues(xml, 'g:color')).toEqual(['', '']);
	});

	it('escapes XML-hostile characters so one bad description cannot break the feed', () => {
		const xml = buildProductFeed(
			[group({ name: 'Tees & "Tanks"', description: 'Fits <most> people & dogs' })],
			ORIGIN
		);
		expect(itemValues(xml, 'title')).toEqual(['Tees &amp; &quot;Tanks&quot;']);
		expect(itemValues(xml, 'description')).toEqual(['Fits &lt;most&gt; people &amp; dogs']);
	});

	it('falls back to the group name when a variant has no description', () => {
		const xml = buildProductFeed([group({ description: '' })], ORIGIN);
		expect(itemValues(xml, 'description')).toEqual(['Snapback']);
	});

	it('skips a variant with no image, because Merchant Center rejects it anyway', () => {
		const xml = buildProductFeed(
			[
				group({
					variantType: 'color',
					variants: [
						variant({ productId: 'prod_a', label: 'Blue', image: '' }),
						variant({ productId: 'prod_b', label: 'Pink' })
					]
				})
			],
			ORIGIN
		);
		expect(itemValues(xml, 'g:id')).toEqual(['prod_b']);
	});

	it('produces a valid empty channel when there are no products', () => {
		const xml = buildProductFeed([], ORIGIN);
		expect(xml).toContain('</rss>');
		expect(itemValues(xml, 'g:id')).toEqual([]);
	});
});
