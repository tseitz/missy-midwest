import Stripe from 'stripe';

/**
 * set-stock — adjust a live variant's inventory without touching the catalog.
 *
 * Stock lives in each Stripe Product's `metadata.stock` and is read live by the
 * storefront (never cached), so a change here shows up on the next /shop load.
 * Online sales auto-decrement via the webhook; use this for offline sales,
 * restocks, or corrections.
 *
 *   List every variant and its current stock:
 *     node --env-file=.env scripts/set-stock.mjs list
 *
 *   Set an absolute count:
 *     node --env-file=.env scripts/set-stock.mjs missy-snapback "Camo" 1
 *
 *   Apply a delta (sold 5 / restocked 12):
 *     node --env-file=.env scripts/set-stock.mjs missy-snapback "Camo" -5
 *     node --env-file=.env scripts/set-stock.mjs loz-cord-hat "One Size" +12
 *
 * group   = metadata.group slug (e.g. missy-snapback, loz-cord-hat)
 * variant = metadata.variant label, case-insensitive (e.g. "Camo", "One Size")
 * amount  = absolute integer ("6") or signed delta ("-5" / "+12")
 *
 * Go-live: point at the live key, e.g.
 *   STRIPE_SECRET_KEY=rk_live_xxx node scripts/set-stock.mjs ...
 */
const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
	console.error(
		'STRIPE_SECRET_KEY is required. Run: node --env-file=.env scripts/set-stock.mjs ...'
	);
	process.exit(1);
}
const stripe = new Stripe(key);

/** Fetch all active products (one page; warns if the catalog exceeds 100). */
async function fetchActive() {
	const res = await stripe.products.list({ active: true, limit: 100 });
	if (res.has_more) {
		console.warn('More than 100 active products exist; this tool only sees the first 100.');
	}
	return res.data;
}

function parseStock(raw) {
	const n = Number.parseInt(raw ?? '', 10);
	return Number.isFinite(n) && n > 0 ? n : 0;
}

const [, , groupArg, variantArg, amountArg] = process.argv;

if (groupArg === 'list' || !groupArg) {
	const products = await fetchActive();
	const rows = products
		.filter((p) => p.metadata?.group)
		.map((p) => ({
			group: p.metadata.group,
			variant: p.metadata.variant ?? '',
			stock: parseStock(p.metadata.stock)
		}))
		.sort((a, b) => a.group.localeCompare(b.group) || a.variant.localeCompare(b.variant));
	console.log('group'.padEnd(18), 'variant'.padEnd(16), 'stock');
	for (const r of rows) {
		console.log(r.group.padEnd(18), r.variant.padEnd(16), String(r.stock));
	}
	process.exit(0);
}

if (!variantArg || amountArg === undefined) {
	console.error(
		'Usage: set-stock.mjs <group> <variant> <amount|+delta|-delta>   (or: set-stock.mjs list)'
	);
	process.exit(1);
}

// Validate the amount: a bare integer (absolute) or a signed integer (delta).
const isDelta = /^[+-]\d+$/.test(amountArg);
const isAbsolute = /^\d+$/.test(amountArg);
if (!isDelta && !isAbsolute) {
	console.error(
		`Invalid amount "${amountArg}" — use an integer (6), or a signed delta (-5 / +12).`
	);
	process.exit(1);
}

const products = await fetchActive();
const matches = products.filter(
	(p) =>
		p.metadata?.group === groupArg &&
		(p.metadata?.variant ?? '').toLowerCase() === variantArg.toLowerCase()
);

if (matches.length === 0) {
	console.error(
		`No active product with group="${groupArg}" variant="${variantArg}". Run "list" to see options.`
	);
	process.exit(1);
}
if (matches.length > 1) {
	console.error(
		`Ambiguous: ${matches.length} products match group="${groupArg}" variant="${variantArg}".`
	);
	process.exit(1);
}

const product = matches[0];
const current = parseStock(product.metadata.stock);
const next = isDelta
	? Math.max(0, current + Number.parseInt(amountArg, 10))
	: Number.parseInt(amountArg, 10);

if (next === current) {
	console.log(`${product.name}: stock already ${current}, no change.`);
	process.exit(0);
}

await stripe.products.update(product.id, { metadata: { stock: String(next) } });
console.log(`${product.name} (${product.id}): stock ${current} → ${next}`);
