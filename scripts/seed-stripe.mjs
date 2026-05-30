import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
	console.error('STRIPE_SECRET_KEY is required. Run: node --env-file=.env scripts/seed-stripe.mjs');
	process.exit(1);
}
const stripe = new Stripe(key);

// group, groupName, variantType, [variant, stock, priceCents, sort]
const lineup = [
	{
		group: 'classic-trucker',
		groupName: 'Classic Trucker',
		variantType: 'color',
		variants: [
			{ variant: 'Lavender', stock: 12, price: 3200, sort: 1 },
			{ variant: 'Black', stock: 6, price: 3200, sort: 2 },
			{ variant: 'Sand', stock: 0, price: 3200, sort: 3 }
		]
	},
	{
		group: 'sunset-dad-hat',
		groupName: 'Sunset Dad Hat',
		variantType: 'color',
		variants: [
			{ variant: 'Cream', stock: 9, price: 3000, sort: 1 },
			{ variant: 'Pink', stock: 4, price: 3000, sort: 2 }
		]
	},
	{
		group: 'midwest-beanie',
		groupName: 'Midwest Beanie',
		variantType: null,
		variants: [{ variant: 'One Size', stock: 15, price: 2800, sort: 1 }]
	},
	{
		group: 'festival-bucket',
		groupName: 'Festival Bucket Hat',
		variantType: null,
		variants: [{ variant: 'One Size', stock: 7, price: 3400, sort: 1 }]
	},
	{
		group: 'logo-snapback',
		groupName: 'Logo Snapback',
		variantType: null,
		variants: [{ variant: 'One Size', stock: 3, price: 3100, sort: 1 }]
	},
	{
		group: 'tour-tee',
		groupName: 'Tour Tee',
		variantType: 'size',
		variants: [
			{ variant: 'S', stock: 5, price: 2800, sort: 1 },
			{ variant: 'M', stock: 0, price: 2800, sort: 2 },
			{ variant: 'L', stock: 10, price: 2800, sort: 3 },
			{ variant: 'XL', stock: 0, price: 2800, sort: 4 }
		]
	}
];

for (const style of lineup) {
	for (const v of style.variants) {
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
			description: `${style.groupName} in ${v.variant}.`,
			images: [
				`https://placehold.co/600x600/1d1830/c4b5fd?text=${encodeURIComponent(style.groupName)}`
			],
			metadata,
			default_price_data: { currency: 'usd', unit_amount: v.price }
		});
		console.log(`Created ${product.id} — ${product.name}`);
	}
}
console.log('Done seeding test-mode products.');
