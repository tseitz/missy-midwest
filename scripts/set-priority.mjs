import Stripe from 'stripe';

/**
 * set-priority — set a product group's display order without touching the catalog.
 *
 * Group order on /shop is driven by each Stripe Product's `metadata.priority`
 * (read live, never cached). A group's priority is the lowest value among its
 * variants; lower sorts first, and anything unset sinks to the bottom (then
 * alphabetical). This tool writes the SAME priority onto every variant in a
 * group so the group sorts as one. Use gaps of 10 (10, 20, 30…) to leave room
 * to slot new items between later.
 *
 *   List every group and its current priority:
 *     node --env-file=.env scripts/set-priority.mjs list
 *
 *   Set a group's priority (top of page = lowest number):
 *     node --env-file=.env scripts/set-priority.mjs missy-snapback 10
 *     node --env-file=.env scripts/set-priority.mjs loz-cord-hat 20
 *
 * group    = metadata.group slug (e.g. missy-snapback, loz-cord-hat)
 * priority = non-negative integer (lower sorts first)
 *
 * Go-live: point at the live key, e.g.
 *   STRIPE_SECRET_KEY=rk_live_xxx node scripts/set-priority.mjs ...
 */
const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
	console.error(
		'STRIPE_SECRET_KEY is required. Run: node --env-file=.env scripts/set-priority.mjs ...'
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

/** Parse a priority value the way the storefront does: unset/invalid sinks last. */
function parsePriority(raw) {
	const n = Number.parseInt(raw ?? '', 10);
	return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

const [, , groupArg, priorityArg] = process.argv;

if (groupArg === 'list' || !groupArg) {
	const products = await fetchActive();
	const byGroup = new Map();
	for (const p of products) {
		const slug = p.metadata?.group;
		if (!slug) continue;
		const priority = parsePriority(p.metadata?.priority);
		byGroup.set(slug, Math.min(byGroup.get(slug) ?? Number.MAX_SAFE_INTEGER, priority));
	}
	const rows = [...byGroup.entries()]
		.map(([group, priority]) => ({ group, priority }))
		.sort((a, b) => a.priority - b.priority || a.group.localeCompare(b.group));
	console.log('group'.padEnd(18), 'priority');
	for (const r of rows) {
		const shown = r.priority === Number.MAX_SAFE_INTEGER ? '—' : String(r.priority);
		console.log(r.group.padEnd(18), shown);
	}
	process.exit(0);
}

if (priorityArg === undefined) {
	console.error(
		'Usage: set-priority.mjs <group> <priority>   (or: set-priority.mjs list)\n' +
			'priority = non-negative integer; lower sorts first.'
	);
	process.exit(1);
}

if (!/^\d+$/.test(priorityArg)) {
	console.error(`Invalid priority "${priorityArg}" — use a non-negative integer (e.g. 10).`);
	process.exit(1);
}

const products = await fetchActive();
const matches = products.filter((p) => p.metadata?.group === groupArg);

if (matches.length === 0) {
	console.error(`No active product with group="${groupArg}". Run "list" to see options.`);
	process.exit(1);
}

for (const product of matches) {
	await stripe.products.update(product.id, { metadata: { priority: priorityArg } });
	console.log(`${product.name} (${product.id}): priority → ${priorityArg}`);
}
console.log(`Updated ${matches.length} variant(s) in group "${groupArg}".`);
