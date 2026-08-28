import { SITE_NAME, DEFAULT_OG_IMAGE, SOCIAL_URLS } from './config';
import { SHIPPING_RATE_CENTS } from '$lib/shop/config';
import { variantSlug } from '$lib/shop/shop-cards';
import type { ProductGroup, Variant } from '$lib/shop/types';

export interface MusicGroupJsonLd {
	'@context': 'https://schema.org';
	'@type': 'MusicGroup';
	name: string;
	url: string;
	image: string;
	sameAs: string[];
}

/** Build the MusicGroup structured-data object for the given site origin. */
export function musicGroupJsonLd(origin: string): MusicGroupJsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'MusicGroup',
		name: SITE_NAME,
		url: origin,
		image: `${origin}${DEFAULT_OG_IMAGE}`,
		sameAs: SOCIAL_URLS
	};
}

interface Brand {
	'@type': 'Brand';
	name: string;
}

interface ShippingDetails {
	'@type': 'OfferShippingDetails';
	shippingRate: { '@type': 'MonetaryAmount'; value: string; currency: 'USD' };
	shippingDestination: { '@type': 'DefinedRegion'; addressCountry: 'US' };
}

interface ReturnPolicy {
	'@type': 'MerchantReturnPolicy';
	applicableCountry: 'US';
	returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted';
}

interface Offer {
	'@type': 'Offer';
	url: string;
	priceCurrency: 'USD';
	price: string;
	availability: 'https://schema.org/InStock' | 'https://schema.org/OutOfStock';
	itemCondition: 'https://schema.org/NewCondition';
	seller: { '@type': 'Organization'; name: string };
	shippingDetails: ShippingDetails;
	hasMerchantReturnPolicy: ReturnPolicy;
}

interface VariantJsonLd {
	'@type': 'Product';
	name: string;
	sku: string;
	image: string[];
	color?: string;
	size?: string;
	offers: Offer;
}

export interface ProductJsonLd {
	'@context': 'https://schema.org';
	'@type': 'Product';
	name: string;
	description: string;
	sku: string;
	image: string[];
	brand: Brand;
	offers: Offer;
}

export interface ProductGroupJsonLd {
	'@context': 'https://schema.org';
	'@type': 'ProductGroup';
	name: string;
	description: string;
	productGroupID: string;
	variesBy: string[];
	image: string[];
	brand: Brand;
	hasVariant: VariantJsonLd[];
}

const BRAND: Brand = { '@type': 'Brand', name: SITE_NAME };

const SHIPPING_DETAILS: ShippingDetails = {
	'@type': 'OfferShippingDetails',
	shippingRate: {
		'@type': 'MonetaryAmount',
		value: dollars(SHIPPING_RATE_CENTS),
		currency: 'USD'
	},
	shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' }
};

const RETURN_POLICY: ReturnPolicy = {
	'@type': 'MerchantReturnPolicy',
	applicableCountry: 'US',
	returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted'
};

/** Cents to a bare decimal string — schema.org `price` takes no currency symbol. */
function dollars(cents: number): string {
	return (cents / 100).toFixed(2);
}

function buildOffer(
	group: ProductGroup,
	variant: Variant,
	origin: string,
	withSlug: boolean
): Offer {
	const path = withSlug
		? `/shop/${group.slug}?variant=${variantSlug(variant.label)}`
		: `/shop/${group.slug}`;
	return {
		'@type': 'Offer',
		url: `${origin}${path}`,
		priceCurrency: 'USD',
		price: dollars(variant.price),
		availability:
			variant.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
		itemCondition: 'https://schema.org/NewCondition',
		seller: { '@type': 'Organization', name: SITE_NAME },
		shippingDetails: SHIPPING_DETAILS,
		hasMerchantReturnPolicy: RETURN_POLICY
	};
}

/**
 * Build the Product structured data Google Merchant Center reads to place an
 * item on the Search Shopping tab.
 *
 * A group with several colors or sizes becomes a `ProductGroup` holding one
 * `Product` per variant, because each variant has its own price and stock and
 * Google must be able to list a sold-out color separately from an in-stock one.
 * A group with one variant stays a plain `Product` — a ProductGroup that varies
 * by nothing is invalid.
 */
export function productJsonLd(
	group: ProductGroup,
	origin: string
): ProductJsonLd | ProductGroupJsonLd {
	const images = [group.image].filter(Boolean);

	if (group.variants.length < 2) {
		const variant = group.variants[0];
		return {
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: group.name,
			description: group.description,
			sku: variant.productId,
			image: images,
			brand: BRAND,
			offers: buildOffer(group, variant, origin, false)
		};
	}

	return {
		'@context': 'https://schema.org',
		'@type': 'ProductGroup',
		name: group.name,
		description: group.description,
		productGroupID: group.slug,
		variesBy: [`https://schema.org/${group.variantType ?? 'color'}`],
		image: images,
		brand: BRAND,
		hasVariant: group.variants.map((variant) => ({
			'@type': 'Product' as const,
			name: `${group.name} — ${variant.label}`,
			sku: variant.productId,
			image: [variant.image || group.image].filter(Boolean),
			...(group.variantType === 'size' ? { size: variant.label } : { color: variant.label }),
			offers: buildOffer(group, variant, origin, true)
		}))
	};
}
