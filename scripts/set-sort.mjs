import Stripe from 'stripe';

/**
 * set-sort — reorder the colors/sizes *within* a product group.
 *
 * Each variant's place in its group's picker (and as a card on /shop, once
 * colors are split out) is driven by `metadata.sort` on the Stripe Product:
 * lower sorts first. This is the WITHIN-group order; to order whole products
 * relative to each other use scripts/set-priority.mjs instead. Read live, never
 * cached, so a change shows up on the next /shop load. Use gaps if you like, or
 * just bump one variant to 0 to move it to the front.
 *
 *   List every variant and its current sort:
 *     node --env-file=.env scripts/set-sort.mjs list
 *
 *   Move Camo to the front of the snapback group:
 *     node --env-file=.env scripts/set-sort.mjs missy-snapback "Camo" 0
 *
 * group   = metadata.group slug (e.g. missy-snapback)
 * variant = metadata.variant label, case-insensitive (e.g. "Camo")
 * sort    = non-negative integer; lower sorts first
 *
 * Go-live: point at the live key, e.g.
 *   STRIPE_SECRET_KEY=rk_live_xxx node scripts/set-sort.mjs ...
 */
const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
	console.error('STRIPE_SECRET_KEY is required. Run: node --env-file=.env scripts/set-sort.mjs ...');
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

/** Parse a sort value the way the storefront does: unset/invalid becomes 0. */
function parseSort(raw) {
	const n = Number.parseInt(raw ?? '', 10);
	return Number.isFinite(n) ? n : 0;
}

const [, , groupArg, variantArg, sortArg] = process.argv;

if (groupArg === 'list' || !groupArg) {
	const products = await fetchActive();
	const rows = products
		.filter((p) => p.metadata?.group)
		.map((p) => ({
			group: p.metadata.group,
			variant: p.metadata.variant ?? '',
			sort: parseSort(p.metadata.sort)
		}))
		.sort(
			(a, b) => a.group.localeCompare(b.group) || a.sort - b.sort || a.variant.localeCompare(b.variant)
		);
	console.log('group'.padEnd(18), 'variant'.padEnd(16), 'sort');
	for (const r of rows) {
		console.log(r.group.padEnd(18), r.variant.padEnd(16), String(r.sort));
	}
	process.exit(0);
}

if (!variantArg || sortArg === undefined) {
	console.error('Usage: set-sort.mjs <group> <variant> <sort>   (or: set-sort.mjs list)');
	process.exit(1);
}

if (!/^\d+$/.test(sortArg)) {
	console.error(`Invalid sort "${sortArg}" — use a non-negative integer (lower sorts first).`);
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
const current = parseSort(product.metadata.sort);
if (Number.parseInt(sortArg, 10) === current) {
	console.log(`${product.name}: sort already ${current}, no change.`);
	process.exit(0);
}

await stripe.products.update(product.id, { metadata: { sort: sortArg } });
console.log(`${product.name} (${product.id}): sort ${current} → ${sortArg}`);
