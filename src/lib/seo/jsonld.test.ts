import { describe, it, expect } from 'vitest';
import { musicGroupJsonLd, productJsonLd } from './jsonld';
import type { ProductGroup, Variant } from '$lib/shop/types';

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

describe('musicGroupJsonLd', () => {
	it('builds a MusicGroup schema with absolute url + image and social sameAs', () => {
		const ld = musicGroupJsonLd(ORIGIN);
		expect(ld['@type']).toBe('MusicGroup');
		expect(ld.name).toBe('Missy Midwest');
		expect(ld.url).toBe('https://missymidwest.com');
		expect(ld.image).toBe('https://missymidwest.com/landing/missy-fan-crop.webp');
		expect(ld.sameAs).toContain('https://www.instagram.com/missy.midwest/');
		expect(ld.sameAs.length).toBeGreaterThanOrEqual(5);
	});
});

describe('productJsonLd', () => {
	it('emits a single Product for a one-variant group', () => {
		const ld = productJsonLd(group(), ORIGIN);
		expect(ld['@type']).toBe('Product');
		expect(ld.name).toBe('Snapback');
		expect(ld.description).toBe('Embroidered snapback.');
		expect('sku' in ld ? ld.sku : undefined).toBe('prod_1');
		expect(ld.brand).toEqual({ '@type': 'Brand', name: 'Missy Midwest' });
		expect('hasVariant' in ld).toBe(false);
	});

	it('prices the offer in dollars with an absolute product url', () => {
		const ld = productJsonLd(group(), ORIGIN);
		const offer = 'offers' in ld ? ld.offers : undefined;
		expect(offer?.price).toBe('32.00');
		expect(offer?.priceCurrency).toBe('USD');
		expect(offer?.url).toBe('https://missymidwest.com/shop/snapback');
		expect(offer?.availability).toBe('https://schema.org/InStock');
		expect(offer?.itemCondition).toBe('https://schema.org/NewCondition');
	});

	it('marks a zero-stock variant out of stock', () => {
		const ld = productJsonLd(group({ variants: [variant({ stock: 0 })] }), ORIGIN);
		const offer = 'offers' in ld ? ld.offers : undefined;
		expect(offer?.availability).toBe('https://schema.org/OutOfStock');
	});

	it('attaches the flat US shipping rate and the no-returns policy to every offer', () => {
		const ld = productJsonLd(group(), ORIGIN);
		const offer = 'offers' in ld ? ld.offers : undefined;
		expect(offer?.shippingDetails.shippingRate).toEqual({
			'@type': 'MonetaryAmount',
			value: '10.00',
			currency: 'USD'
		});
		expect(offer?.shippingDetails.shippingDestination.addressCountry).toBe('US');
		expect(offer?.hasMerchantReturnPolicy.returnPolicyCategory).toBe(
			'https://schema.org/MerchantReturnNotPermitted'
		);
	});

	it('states the handling and transit windows published on /shipping-returns', () => {
		const ld = productJsonLd(group(), ORIGIN);
		const offer = 'offers' in ld ? ld.offers : undefined;
		expect(offer?.shippingDetails.deliveryTime).toEqual({
			'@type': 'ShippingDeliveryTime',
			handlingTime: {
				'@type': 'QuantitativeValue',
				minValue: 0,
				maxValue: 3,
				unitCode: 'DAY'
			},
			transitTime: {
				'@type': 'QuantitativeValue',
				minValue: 3,
				maxValue: 7,
				unitCode: 'DAY'
			}
		});
	});

	it('emits a ProductGroup with one Product per variant when a group varies', () => {
		const ld = productJsonLd(
			group({
				slug: 'corduroy-hat',
				name: 'Corduroy Hat',
				variantType: 'color',
				variants: [
					variant({ productId: 'prod_blue', label: 'Blue', price: 3500 }),
					variant({ productId: 'prod_purple', label: 'Deep Purple', price: 3500, stock: 0 })
				]
			}),
			ORIGIN
		);

		expect(ld['@type']).toBe('ProductGroup');
		expect('productGroupID' in ld ? ld.productGroupID : undefined).toBe('corduroy-hat');
		const variants = 'hasVariant' in ld ? ld.hasVariant : [];
		expect(variants).toHaveLength(2);
		expect(variants[0].name).toBe('Corduroy Hat — Blue');
		expect(variants[0].description).toBe('Embroidered snapback.');
		expect(variants[1].description).toBe('Embroidered snapback.');
		expect(variants[0].sku).toBe('prod_blue');
		expect(variants[0].offers.url).toBe('https://missymidwest.com/shop/corduroy-hat?variant=blue');
		expect(variants[0].offers.availability).toBe('https://schema.org/InStock');
		expect(variants[1].offers.url).toBe(
			'https://missymidwest.com/shop/corduroy-hat?variant=deep-purple'
		);
		expect(variants[1].offers.availability).toBe('https://schema.org/OutOfStock');
	});

	it('labels the varying axis so Google can group the variants', () => {
		const colorLd = productJsonLd(
			group({
				variantType: 'color',
				variants: [variant({ label: 'Blue' }), variant({ label: 'Pink', productId: 'prod_2' })]
			}),
			ORIGIN
		);
		expect('variesBy' in colorLd ? colorLd.variesBy : []).toEqual(['https://schema.org/color']);
		expect('hasVariant' in colorLd ? colorLd.hasVariant[0].color : undefined).toBe('Blue');

		const sizeLd = productJsonLd(
			group({
				variantType: 'size',
				variants: [variant({ label: 'M' }), variant({ label: 'L', productId: 'prod_2' })]
			}),
			ORIGIN
		);
		expect('variesBy' in sizeLd ? sizeLd.variesBy : []).toEqual(['https://schema.org/size']);
		expect('hasVariant' in sizeLd ? sizeLd.hasVariant[0].size : undefined).toBe('M');
	});
});
