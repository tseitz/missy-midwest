import { createStripe } from './stripe-client.mjs';

/**
 * archive-group — retire a whole product group from the storefront.
 *
 * A group (e.g. crop-hoodie) is really one Stripe Product per size/color variant,
 * all sharing `metadata.group`. The catalog reads only ACTIVE products and
 * clusters them by group, so a group keeps rendering (as a sold-out card) until
 * EVERY variant is archived. This archives them all in one shot.
 *
 * Archiving = `active: false`. It's the supported "remove" (Stripe won't delete
 * a Product that has a Price/history) and it's reversible — set active:true to
 * bring it back. The change shows up on the next /shop load (stock is never
 * cached).
 *
 *   List every group and its variant/stock count:
 *     node --env-file=.env scripts/archive-group.mjs list
 *
 *   Preview what would be archived (no writes):
 *     node --env-file=.env scripts/archive-group.mjs crop-hoodie --dry-run
 *
 *   Archive the group:
 *     node --env-file=.env scripts/archive-group.mjs crop-hoodie
 *
 * group = metadata.group slug (e.g. crop-hoodie, black-crop-tee)
 *
 * Go-live: point at the live key, e.g.
 *   STRIPE_SECRET_KEY=rk_live_xxx node scripts/archive-group.mjs crop-hoodie
 */
const stripe = createStripe();

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

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const groupArg = args.find((a) => !a.startsWith('--'));

const products = await fetchActive();

if (groupArg === 'list' || !groupArg) {
	const byGroup = new Map();
	for (const p of products) {
		const group = p.metadata?.group;
		if (!group) continue;
		const entry = byGroup.get(group) ?? { variants: 0, stock: 0 };
		entry.variants += 1;
		entry.stock += parseStock(p.metadata.stock);
		byGroup.set(group, entry);
	}
	console.log('group'.padEnd(18), 'variants'.padEnd(10), 'total stock');
	for (const [group, e] of [...byGroup].sort((a, b) => a[0].localeCompare(b[0]))) {
		console.log(group.padEnd(18), String(e.variants).padEnd(10), String(e.stock));
	}
	process.exit(0);
}

const matches = products.filter((p) => p.metadata?.group === groupArg);

if (matches.length === 0) {
	const groups = [...new Set(products.map((p) => p.metadata?.group).filter(Boolean))].sort();
	console.error(
		`No active products with group="${groupArg}". Known groups: ${groups.join(', ') || '(none)'}.`
	);
	process.exit(1);
}

console.log(
	`${dryRun ? '[dry-run] would archive' : 'Archiving'} ${matches.length} variant(s) in group "${groupArg}":`
);
for (const product of matches) {
	const variant = product.metadata?.variant ?? '';
	if (dryRun) {
		console.log(`  would archive ${product.id} — ${product.name} ${variant}`.trimEnd());
		continue;
	}
	await stripe.products.update(product.id, { active: false });
	console.log(`  archived ${product.id} — ${product.name} ${variant}`.trimEnd());
}

if (dryRun) {
	console.log('No changes made (--dry-run). Re-run without --dry-run to archive.');
} else {
	console.log(`Done. "${groupArg}" will drop off /shop on the next load.`);
}
