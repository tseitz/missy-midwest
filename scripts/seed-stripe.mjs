import Stripe from 'stripe';

/**
 * seed-stripe — populate Stripe with the Missy Midwest catalog (one Product per
 * variant). This file is the source of truth: re-run it against whichever mode's
 * key to recreate the catalog there. Test and live are separate environments —
 * nothing created in test carries over to live.
 *
 *   node --env-file=.env scripts/seed-stripe.mjs --reset
 *
 * Flags:
 *   --reset   archive all existing active products first (clean test re-seed)
 *
 * Product images point at the running site's /shop/<file>.webp. Override the
 * base for go-live:  SHOP_IMAGE_BASE_URL=https://missymidwest.com node ...
 *
 * NOTE: create-only (not idempotent) — run once per environment, or with
 * --reset in test to wipe + reseed. Stock is mutated by the purchase webhook
 * after launch, so don't re-seed live once sales start.
 */
const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
	console.error('STRIPE_SECRET_KEY is required. Run: node --env-file=.env scripts/seed-stripe.mjs');
	process.exit(1);
}
const stripe = new Stripe(key);

const BASE = (process.env.SHOP_IMAGE_BASE_URL ?? 'http://localhost:5173').replace(/\/$/, '');
const imageUrl = (file) => `${BASE}/shop/${file}`;

// Apparel shows the full size scale; out-of-stock sizes render disabled in the
// picker, so seed every size and only fill the ones that are actually in stock.
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const sizeVariants = (price, stockBySize) =>
	SIZES.map((size, i) => ({ variant: size, stock: stockBySize[size] ?? 0, price, sort: i + 1 }));

// group, groupName, description, variantType, images[], variants[{ variant, stock, price (cents), sort, images? }]
// A variant's `images` overrides the group `images` (e.g. per-color hats).
const lineup = [
	{
		group: 'crop-hoodie',
		groupName: 'Crop Hoodie',
		description: 'Cropped MISSY MIDWEST hoodie in black.',
		variantType: 'size',
		images: ['black-crop-hoodie/missy-hoodie-crop-white.webp'],
		variants: sizeVariants(3000, { M: 1 })
	},
	{
		group: 'black-crop-tee',
		groupName: 'Black Crop Tee',
		description: 'Cropped MISSY MIDWEST tee in black.',
		variantType: 'size',
		images: ['black-crop/missy-crop-white.webp'],
		variants: sizeVariants(2000, { L: 1 })
	},
	{
		group: 'lake-tank',
		groupName: 'Lake Tank',
		description: 'Came for the beach, stayed for the DJ — Lake of the Ozarks tank.',
		variantType: 'size',
		images: ['lake-tank/lake-tank-white.webp'],
		variants: sizeVariants(2500, { S: 5, L: 2, XL: 1, XXL: 2 })
	},
	{
		group: 'lake-tee',
		groupName: 'Lake Tee',
		description: 'Came for the beach, stayed for the DJ — Lake of the Ozarks tee.',
		variantType: 'size',
		images: ['lake-tee/missy-lake-tee-front-white.webp', 'lake-tee/missy-lake-tee-back-white.webp'],
		variants: sizeVariants(2500, { XS: 1, S: 3, M: 1, XL: 2 })
	},
	{
		group: 'missy-snapback',
		groupName: 'MISSY Snapback',
		description: 'Upside-down MISSY snapback.',
		variantType: 'color',
		variants: [
			{
				variant: 'Golden Brown',
				stock: 8,
				price: 3000,
				sort: 1,
				images: ['upside-missy-hat/golden-missy.webp']
			},
			{
				variant: 'Chiefs Red',
				stock: 1,
				price: 3000,
				sort: 2,
				images: ['upside-missy-hat/chiefs-red-missy.webp']
			},
			{
				variant: 'Camo',
				stock: 2,
				price: 3000,
				sort: 3,
				images: ['upside-missy-hat/camo-missy.webp']
			},
			{
				variant: 'Arkansas Red',
				stock: 10,
				price: 3000,
				sort: 4,
				images: ['upside-missy-hat/arkansas-red-missy.webp']
			}
		]
	},
	{
		// Plain "MISSY MIDWEST" corduroy — Blue + Purple share one design.
		group: 'corduroy-hat',
		groupName: 'Corduroy Hat',
		description: 'MISSY MIDWEST corduroy hat.',
		variantType: 'color',
		variants: [
			{
				variant: 'Blue',
				stock: 10,
				price: 3000,
				sort: 1,
				images: ['corduroy-hat-logo/corduroy-blue.webp']
			},
			{
				variant: 'Purple',
				stock: 10,
				price: 3000,
				sort: 2,
				images: ['corduroy-hat-logo/corduroy-purple.webp']
			}
		]
	},
	{
		// The Lake of the Ozarks sunset-logo corduroy — its own design, pink only.
		group: 'loz-cord-hat',
		groupName: 'LOZ Corduroy Hat',
		description: 'MISSY MIDWEST Lake of the Ozarks corduroy hat in pink.',
		variantType: null,
		images: ['corduroy-hat-logo/corduroy-pink.webp'],
		variants: [{ variant: 'One Size', stock: 10, price: 3000, sort: 1 }]
	}
];

if (process.argv.includes('--reset')) {
	console.log('Archiving existing active products…');
	const existing = await stripe.products.list({ active: true, limit: 100 });
	for (const product of existing.data) {
		await stripe.products.update(product.id, { active: false });
		console.log(`  archived ${product.id} — ${product.name}`);
	}
	if (existing.has_more) {
		console.warn('More than 100 active products exist; re-run --reset to archive the rest.');
	}
}

console.log(`Seeding with image base ${BASE}/shop/ …`);
for (const style of lineup) {
	for (const v of style.variants) {
		const files = v.images ?? style.images ?? [];
		const metadata = {
			group: style.group,
			groupName: style.groupName,
			variant: v.variant,
			stock: String(v.stock),
			sort: String(v.sort)
		};
		if (style.variantType) metadata.variantType = style.variantType;

		const product = await stripe.products.create({
			name: `${style.groupName} — ${v.variant}`,
			description: style.description ?? `${style.groupName} in ${v.variant}.`,
			images: files.map(imageUrl),
			metadata,
			default_price_data: { currency: 'usd', unit_amount: v.price }
		});
		console.log(`Created ${product.id} — ${product.name}`);
	}
}
console.log('Done seeding products.');
