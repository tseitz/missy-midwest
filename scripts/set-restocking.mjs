import Stripe from 'stripe';

/**
 * set-restocking — mark an out-of-stock variant as "Coming soon" (a restock is
 * on the way) instead of a plain "Sold out".
 *
 * Sets `metadata.restocking` on the Stripe Product. When a variant is out of
 * stock AND flagged, the storefront's badge reads "Coming soon" in blue (and it
 * stays non-purchasable — it's a relabeled sold-out, not a preorder). Read live,
 * never cached, so a change shows up on the next /shop load. Clearing the flag,
 * or restocking the variant above 0, drops it back to the normal states.
 *
 *   List every variant, its stock flag state:
 *     node --env-file=.env scripts/set-restocking.mjs list
 *
 *   Flag Camo as coming soon (15 incoming):
 *     node --env-file=.env scripts/set-restocking.mjs missy-snapback "Camo" on
 *
 *   Clear it once the restock lands (then set the real stock with set-stock.mjs):
 *     node --env-file=.env scripts/set-restocking.mjs missy-snapback "Camo" off
 *
 * group   = metadata.group slug (e.g. missy-snapback)
 * variant = metadata.variant label, case-insensitive (e.g. "Camo")
 * flag    = on | off  (true | false, 1 | 0 also accepted)
 *
 * Go-live: point at the live key, e.g.
 *   STRIPE_SECRET_KEY=rk_live_xxx node scripts/set-restocking.mjs ...
 */
const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
	console.error(
		'STRIPE_SECRET_KEY is required. Run: node --env-file=.env scripts/set-restocking.mjs ...'
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

/** The storefront treats only the exact string "true" as restocking. */
function isRestocking(raw) {
	return raw === 'true';
}

/** Parse an on/off argument into a boolean, or null if unrecognized. */
function parseFlag(raw) {
	const v = (raw ?? '').toLowerCase();
	if (['on', 'true', '1', 'yes'].includes(v)) return true;
	if (['off', 'false', '0', 'no'].includes(v)) return false;
	return null;
}

const [, , groupArg, variantArg, flagArg] = process.argv;

if (groupArg === 'list' || !groupArg) {
	const products = await fetchActive();
	const rows = products
		.filter((p) => p.metadata?.group)
		.map((p) => ({
			group: p.metadata.group,
			variant: p.metadata.variant ?? '',
			restocking: isRestocking(p.metadata.restocking) ? 'yes' : ''
		}))
		.sort((a, b) => a.group.localeCompare(b.group) || a.variant.localeCompare(b.variant));
	console.log('group'.padEnd(18), 'variant'.padEnd(16), 'restocking');
	for (const r of rows) {
		console.log(r.group.padEnd(18), r.variant.padEnd(16), r.restocking);
	}
	process.exit(0);
}

const flag = parseFlag(flagArg);
if (!variantArg || flag === null) {
	console.error(
		'Usage: set-restocking.mjs <group> <variant> <on|off>   (or: set-restocking.mjs list)'
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
const current = isRestocking(product.metadata.restocking);
if (flag === current) {
	console.log(`${product.name}: restocking already ${flag ? 'on' : 'off'}, no change.`);
	process.exit(0);
}

// Store "true"/"false" explicitly; the storefront only treats "true" as flagged.
await stripe.products.update(product.id, { metadata: { restocking: String(flag) } });
console.log(
	`${product.name} (${product.id}): restocking ${current ? 'on' : 'off'} → ${flag ? 'on' : 'off'}`
);
