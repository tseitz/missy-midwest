# Phase 2a — Shop Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Svelte files:** every `.svelte` / `.svelte.ts` file MUST be created/edited via the `svelte-file-editor` subagent and validated with `svelte-autofixer` (per CLAUDE.md).
>
> **Branch:** all work happens on `phase2-shop`, branched from `redesign` (NOT `main` — `main` auto-deploys to production). Merge back to `redesign` at the end via superpowers:finishing-a-development-branch.

**Goal:** Build the read-only Stripe shop storefront — a catalog adapter over Stripe, `/shop` (one card per style) and `/shop/[group]` (variant toggle + photo swap + stock), plus the rewired Home shop teaser.

**Architecture:** A pure `groupProducts()` function clusters Stripe products (one product per variant) into `ProductGroup`s by `metadata.group`. A thin server-only `catalog` module fetches active products from Stripe (per request — stock is never cached) and feeds them through `groupProducts`. SvelteKit `+page.server.ts` loaders call the catalog; Svelte 5 runes components render it. No cart/checkout in this PR (that is 2b).

**Tech Stack:** SvelteKit 2 + Svelte 5 runes, Tailwind v4, `stripe` Node SDK, Vitest 3 + @testing-library/svelte, Playwright.

**Spec:** `docs/superpowers/specs/2026-05-29-missy-midwest-phase2-shop-design.md` (§3–§5, §12).

**Scope note (read first):** This PR is _browse only_. The `/shop/[group]` detail page renders the variant selector, photo swap, price, and stock badge, but **no "Add to cart" button** — the cart store and add-to-cart action are owned by sub-PR 2b so all cart interaction lands together. Do not add cart code here.

---

## File Structure

**Create:**

- `src/lib/shop/types.ts` — domain types: `VariantType`, `Variant`, `ProductGroup`, `CatalogProductInput`.
- `src/lib/shop/format.ts` — pure presentation helpers: `formatPrice`, `stockStatus`.
- `src/lib/shop/format.test.ts`
- `src/lib/shop/group-products.ts` — pure `groupProducts(products)`.
- `src/lib/shop/group-products.test.ts`
- `src/lib/server/stripe.ts` — singleton Stripe client (only file importing the real SDK + key).
- `src/lib/server/catalog.ts` — `listGroups()`, `getGroup(slug)`.
- `src/lib/server/catalog.test.ts`
- `src/lib/shop/StockBadge.svelte` + `.test.ts`
- `src/lib/shop/VariantSelector.svelte` + `.test.ts`
- `src/lib/shop/ProductCard.svelte` + `.test.ts`
- `src/routes/shop/[group]/+page.server.ts`
- `src/routes/shop/[group]/+page.svelte`
- `scripts/seed-stripe.mjs` — dev-only: seeds test-mode products matching the lineup.

**Modify:**

- `src/routes/shop/+page.server.ts` — new (currently the route has only `+page.svelte`).
- `src/routes/shop/+page.svelte` — replace placeholder with the catalog grid.
- `src/lib/home/ShopTeaser.svelte` — accept `groups` prop, render real cards.
- `src/routes/+page.server.ts` — also load shop groups for the teaser.
- `.env.example` — activate `STRIPE_SECRET_KEY`, drop the publishable-key line.
- `e2e/smoke.spec.ts` — add a `/shop` smoke assertion.

---

## Task 1: Install Stripe SDK + env wiring

**Files:**

- Modify: `package.json` (via npm)
- Modify: `.env.example`

- [ ] **Step 1: Install the Stripe SDK**

The npm registry is blocked in the sandbox — run with `dangerouslyDisableSandbox: true`.

Run: `npm install stripe`
Expected: `stripe` added to `dependencies`.

- [ ] **Step 2: Confirm install**

Run: `node -e "console.log(require('stripe/package.json').version)"`
Expected: prints a version like `19.x.x`.

- [ ] **Step 3: Update `.env.example`**

Replace the `# --- Phase 2 (Stripe shop) — not used yet ---` block with the activated 2a key plus the corrected sender vars (no publishable key — hosted-redirect checkout needs no client Stripe.js):

```bash
# --- Phase 2 (Stripe shop) ---
# Stripe restricted key (rk_...): Products read+write, Prices read, Checkout write, Payment Intents read.
# Test-mode key used for the 2a storefront; live key added at go-live.
STRIPE_SECRET_KEY=rk_test_...
# Set in 2b/2c:
# STRIPE_WEBHOOK_SECRET=
# RESEND_API_KEY=
# RESEND_FROM_EMAIL=noreply@yourdomain.com
# ORDER_NOTIFY_EMAIL=
# CONTACT_TO_EMAIL=
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "build: add stripe sdk and shop env vars"
```

---

## Task 2: Domain types

**Files:**

- Create: `src/lib/shop/types.ts`

- [ ] **Step 1: Write the types**

```ts
export type VariantType = 'color' | 'size';

/** One buyable variant = one Stripe Product (with one Price). */
export interface Variant {
	priceId: string; // Stripe Price ID — checkout line target
	productId: string; // Stripe Product ID — stock writeback target
	label: string; // "Lavender" | "M"
	image: string;
	price: number; // cents
	stock: number;
}

/** A style: 1+ variants sharing a `group` slug. */
export interface ProductGroup {
	slug: string;
	name: string;
	description: string;
	variantType: VariantType | null; // null = single-variant (no toggle)
	image: string; // representative image (first in-stock, else first)
	fromPrice: number; // min variant price (cents)
	variants: Variant[]; // 1+, sorted
}

/**
 * Narrow shape `groupProducts` consumes — decouples the pure grouping logic
 * from the Stripe SDK so it can be unit-tested with plain objects.
 */
export interface CatalogProductInput {
	id: string;
	name: string;
	description: string;
	images: string[];
	metadata: Record<string, string>;
	price: { id: string; unitAmount: number } | null;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/shop/types.ts
git commit -m "feat(shop): add catalog domain types"
```

---

## Task 3: Presentation helpers (`format.ts`) — TDD

**Files:**

- Create: `src/lib/shop/format.test.ts`
- Create: `src/lib/shop/format.ts`

- [ ] **Step 1: Write the failing tests**

`src/lib/shop/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatPrice, stockStatus } from './format';

describe('formatPrice', () => {
	it('formats cents as a dollar string', () => {
		expect(formatPrice(3200)).toBe('$32.00');
		expect(formatPrice(2850)).toBe('$28.50');
		expect(formatPrice(0)).toBe('$0.00');
	});
});

describe('stockStatus', () => {
	it('reports sold out at zero or below', () => {
		expect(stockStatus(0)).toEqual({ soldOut: true, low: false, label: 'Sold out' });
		expect(stockStatus(-3)).toEqual({ soldOut: true, low: false, label: 'Sold out' });
	});

	it('reports low stock at or below 5', () => {
		expect(stockStatus(5)).toEqual({ soldOut: false, low: true, label: 'Only 5 left' });
		expect(stockStatus(1)).toEqual({ soldOut: false, low: true, label: 'Only 1 left' });
	});

	it('reports in stock above 5', () => {
		expect(stockStatus(6)).toEqual({ soldOut: false, low: false, label: 'In stock' });
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/shop/format.test.ts`
Expected: FAIL — `Cannot find module './format'`.

- [ ] **Step 3: Implement `format.ts`**

```ts
/** Format a price in cents as a USD string, e.g. 3200 -> "$32.00". */
export function formatPrice(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}

export interface StockStatus {
	soldOut: boolean;
	low: boolean;
	label: string;
}

/** Derive a display status from a stock count. Low threshold = 5. */
export function stockStatus(stock: number): StockStatus {
	if (stock <= 0) return { soldOut: true, low: false, label: 'Sold out' };
	if (stock <= 5) return { soldOut: false, low: true, label: `Only ${stock} left` };
	return { soldOut: false, low: false, label: 'In stock' };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/shop/format.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/shop/format.ts src/lib/shop/format.test.ts
git commit -m "feat(shop): add price and stock formatting helpers"
```

---

## Task 4: `groupProducts` clustering — TDD

**Files:**

- Create: `src/lib/shop/group-products.test.ts`
- Create: `src/lib/shop/group-products.ts`

- [ ] **Step 1: Write the failing tests**

`src/lib/shop/group-products.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { groupProducts } from './group-products';
import type { CatalogProductInput } from './types';

function product(over: Partial<CatalogProductInput> & { id: string }): CatalogProductInput {
	return {
		name: 'Default',
		description: 'desc',
		images: ['https://img/default.png'],
		metadata: {},
		price: { id: `price_${over.id}`, unitAmount: 3000 },
		...over
	};
}

describe('groupProducts', () => {
	it('clusters variants sharing a group slug into one ProductGroup', () => {
		const groups = groupProducts([
			product({
				id: 'p1',
				name: 'Trucker Lavender',
				metadata: {
					group: 'trucker',
					groupName: 'Classic Trucker',
					variant: 'Lavender',
					variantType: 'color',
					stock: '8',
					sort: '1'
				}
			}),
			product({
				id: 'p2',
				name: 'Trucker Black',
				metadata: {
					group: 'trucker',
					groupName: 'Classic Trucker',
					variant: 'Black',
					variantType: 'color',
					stock: '0',
					sort: '2'
				}
			})
		]);
		expect(groups).toHaveLength(1);
		expect(groups[0].slug).toBe('trucker');
		expect(groups[0].name).toBe('Classic Trucker');
		expect(groups[0].variantType).toBe('color');
		expect(groups[0].variants.map((v) => v.label)).toEqual(['Lavender', 'Black']);
	});

	it('sorts variants by sort then label', () => {
		const [group] = groupProducts([
			product({ id: 'b', metadata: { group: 'g', variant: 'B', stock: '1', sort: '2' } }),
			product({ id: 'a', metadata: { group: 'g', variant: 'A', stock: '1', sort: '1' } })
		]);
		expect(group.variants.map((v) => v.label)).toEqual(['A', 'B']);
	});

	it('marks a single-variant group with variantType null', () => {
		const [group] = groupProducts([
			product({
				id: 'solo',
				metadata: { group: 'beanie', variant: 'One', variantType: 'color', stock: '4' }
			})
		]);
		expect(group.variants).toHaveLength(1);
		expect(group.variantType).toBeNull();
	});

	it('picks fromPrice as the minimum variant price', () => {
		const [group] = groupProducts([
			product({
				id: 'p1',
				price: { id: 'pr1', unitAmount: 3200 },
				metadata: { group: 'g', variant: 'A', stock: '2' }
			}),
			product({
				id: 'p2',
				price: { id: 'pr2', unitAmount: 2800 },
				metadata: { group: 'g', variant: 'B', stock: '2' }
			})
		]);
		expect(group.fromPrice).toBe(2800);
	});

	it('uses the first in-stock variant image as the group image', () => {
		const [group] = groupProducts([
			product({
				id: 'p1',
				images: ['https://img/a.png'],
				metadata: { group: 'g', variant: 'A', stock: '0', sort: '1' }
			}),
			product({
				id: 'p2',
				images: ['https://img/b.png'],
				metadata: { group: 'g', variant: 'B', stock: '5', sort: '2' }
			})
		]);
		expect(group.image).toBe('https://img/b.png');
	});

	it('skips products missing a group slug or price', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const groups = groupProducts([
			product({ id: 'no-group', metadata: { variant: 'X', stock: '1' } }),
			product({ id: 'no-price', price: null, metadata: { group: 'g', variant: 'Y', stock: '1' } })
		]);
		expect(groups).toEqual([]);
		expect(warn).toHaveBeenCalledTimes(2);
		warn.mockRestore();
	});

	it('treats invalid stock as zero', () => {
		const [group] = groupProducts([
			product({ id: 'p1', metadata: { group: 'g', variant: 'A', stock: 'oops' } })
		]);
		expect(group.variants[0].stock).toBe(0);
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/shop/group-products.test.ts`
Expected: FAIL — `Cannot find module './group-products'`.

- [ ] **Step 3: Implement `group-products.ts`**

```ts
import type { CatalogProductInput, ProductGroup, Variant, VariantType } from './types';

function parseStock(raw: string | undefined): number {
	const n = Number.parseInt(raw ?? '', 10);
	return Number.isFinite(n) && n > 0 ? n : 0;
}

function isVariantType(raw: string | undefined): raw is VariantType {
	return raw === 'color' || raw === 'size';
}

interface Accumulator {
	name: string;
	description: string;
	variantType: VariantType | null;
	rows: { variant: Variant; sort: number }[];
}

/**
 * Cluster Stripe products (one product per variant) into ProductGroups by
 * `metadata.group`. Pure — no network. Products missing a group slug or price
 * are skipped with a warning.
 */
export function groupProducts(products: CatalogProductInput[]): ProductGroup[] {
	const groups = new Map<string, Accumulator>();

	for (const product of products) {
		const slug = product.metadata.group;
		if (!slug || !product.price) {
			console.warn(`Skipping product ${product.id}: missing group metadata or price`);
			continue;
		}

		const variant: Variant = {
			priceId: product.price.id,
			productId: product.id,
			label: product.metadata.variant || product.name,
			image: product.images[0] ?? '',
			price: product.price.unitAmount,
			stock: parseStock(product.metadata.stock)
		};
		const sort = Number.parseInt(product.metadata.sort ?? '', 10) || 0;

		const existing = groups.get(slug);
		if (existing) {
			existing.rows.push({ variant, sort });
		} else {
			groups.set(slug, {
				name: product.metadata.groupName || product.name,
				description: product.description,
				variantType: isVariantType(product.metadata.variantType)
					? product.metadata.variantType
					: null,
				rows: [{ variant, sort }]
			});
		}
	}

	const result: ProductGroup[] = [];
	for (const [slug, acc] of groups) {
		const rows = acc.rows.sort(
			(a, b) => a.sort - b.sort || a.variant.label.localeCompare(b.variant.label)
		);
		const variants = rows.map((r) => r.variant);
		const representative = variants.find((v) => v.stock > 0) ?? variants[0];
		result.push({
			slug,
			name: acc.name,
			description: acc.description,
			variantType: variants.length > 1 ? acc.variantType : null,
			image: representative.image,
			fromPrice: Math.min(...variants.map((v) => v.price)),
			variants
		});
	}

	return result.sort((a, b) => a.name.localeCompare(b.name));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/shop/group-products.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/shop/group-products.ts src/lib/shop/group-products.test.ts
git commit -m "feat(shop): add groupProducts clustering logic"
```

---

## Task 5: Stripe client + catalog adapter — TDD

**Files:**

- Create: `src/lib/server/stripe.ts`
- Create: `src/lib/server/catalog.test.ts`
- Create: `src/lib/server/catalog.ts`

- [ ] **Step 1: Create the Stripe client**

`src/lib/server/stripe.ts` (the only file importing the real SDK + key; instantiated without an explicit `apiVersion` so the SDK's bundled default — which its types match — is used):

```ts
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

export const stripe = new Stripe(STRIPE_SECRET_KEY);
```

- [ ] **Step 2: Write the failing tests**

`src/lib/server/catalog.test.ts` — mock `$lib/server/stripe` (so neither the real SDK nor the env var is needed):

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { listMock } = vi.hoisted(() => ({ listMock: vi.fn() }));

vi.mock('$lib/server/stripe', () => ({
	stripe: { products: { list: listMock } }
}));

import { listGroups, getGroup } from './catalog';

function stripeProduct(over: {
	id: string;
	group: string;
	variant: string;
	stock: string;
	amount?: number;
}) {
	return {
		id: over.id,
		name: `${over.group} ${over.variant}`,
		description: 'A nice thing',
		images: [`https://img/${over.id}.png`],
		metadata: {
			group: over.group,
			groupName: over.group,
			variant: over.variant,
			stock: over.stock
		},
		default_price: { id: `price_${over.id}`, unit_amount: over.amount ?? 3000 }
	};
}

beforeEach(() => listMock.mockReset());

describe('listGroups', () => {
	it('maps and groups active Stripe products', async () => {
		listMock.mockResolvedValue({
			data: [
				stripeProduct({ id: 'p1', group: 'trucker', variant: 'Lavender', stock: '8' }),
				stripeProduct({ id: 'p2', group: 'trucker', variant: 'Black', stock: '0' })
			]
		});
		const { groups, error } = await listGroups();
		expect(error).toBeUndefined();
		expect(groups).toHaveLength(1);
		expect(groups[0].variants).toHaveLength(2);
		expect(listMock).toHaveBeenCalledWith(
			expect.objectContaining({ active: true, expand: ['data.default_price'] })
		);
	});

	it('returns an empty catalog and an error message on failure', async () => {
		listMock.mockRejectedValue(new Error('stripe down'));
		const { groups, error } = await listGroups();
		expect(groups).toEqual([]);
		expect(error).toBe('stripe down');
	});

	it('handles an unexpanded (string) default_price by skipping the variant', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		listMock.mockResolvedValue({
			data: [
				{
					...stripeProduct({ id: 'p1', group: 'g', variant: 'A', stock: '1' }),
					default_price: 'price_unexpanded'
				}
			]
		});
		const { groups } = await listGroups();
		expect(groups).toEqual([]);
		warn.mockRestore();
	});
});

describe('getGroup', () => {
	it('returns the matching group', async () => {
		listMock.mockResolvedValue({
			data: [stripeProduct({ id: 'p1', group: 'trucker', variant: 'Lavender', stock: '8' })]
		});
		const group = await getGroup('trucker');
		expect(group?.slug).toBe('trucker');
	});

	it('returns null when the slug is not found', async () => {
		listMock.mockResolvedValue({ data: [] });
		expect(await getGroup('nope')).toBeNull();
	});
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/lib/server/catalog.test.ts`
Expected: FAIL — `Cannot find module './catalog'`.

- [ ] **Step 4: Implement `catalog.ts`**

```ts
import type Stripe from 'stripe';
import { stripe } from './stripe';
import { groupProducts } from '$lib/shop/group-products';
import type { CatalogProductInput, ProductGroup } from '$lib/shop/types';

export interface CatalogResult {
	groups: ProductGroup[];
	error?: string;
}

function toInput(product: Stripe.Product): CatalogProductInput {
	const price = product.default_price;
	const expanded = price && typeof price !== 'string' ? price : null;
	const unitAmount = expanded?.unit_amount ?? 0;
	return {
		id: product.id,
		name: product.name,
		description: product.description ?? '',
		images: product.images ?? [],
		metadata: product.metadata ?? {},
		price: expanded ? { id: expanded.id, unitAmount } : null
	};
}

/** Fetch all active products from Stripe and cluster them into groups. Stock is never cached. */
export async function listGroups(): Promise<CatalogResult> {
	try {
		const res = await stripe.products.list({
			active: true,
			limit: 100,
			expand: ['data.default_price']
		});
		return { groups: groupProducts(res.data.map(toInput)) };
	} catch (error) {
		console.error('Stripe catalog error:', error);
		return { groups: [], error: error instanceof Error ? error.message : 'Unknown error' };
	}
}

/** Return the group matching `slug`, or null if not found. */
export async function getGroup(slug: string): Promise<ProductGroup | null> {
	const { groups } = await listGroups();
	return groups.find((group) => group.slug === slug) ?? null;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/server/catalog.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Typecheck + commit**

Run: `npm run check`
Expected: 0 errors.

```bash
git add src/lib/server/stripe.ts src/lib/server/catalog.ts src/lib/server/catalog.test.ts
git commit -m "feat(shop): add stripe client and catalog adapter"
```

---

## Task 6: `StockBadge` component — TDD

**Files:**

- Create: `src/lib/shop/StockBadge.svelte` (use the `svelte-file-editor` subagent)
- Create: `src/lib/shop/StockBadge.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/shop/StockBadge.test.ts`:

```ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import StockBadge from './StockBadge.svelte';

describe('StockBadge', () => {
	it('shows "Sold out" at zero stock', () => {
		render(StockBadge, { props: { stock: 0 } });
		expect(screen.getByText('Sold out')).toBeInTheDocument();
	});

	it('shows the low-stock count at or below 5', () => {
		render(StockBadge, { props: { stock: 3 } });
		expect(screen.getByText('Only 3 left')).toBeInTheDocument();
	});

	it('shows "In stock" above 5', () => {
		render(StockBadge, { props: { stock: 12 } });
		expect(screen.getByText('In stock')).toBeInTheDocument();
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/shop/StockBadge.test.ts`
Expected: FAIL — cannot find `./StockBadge.svelte`.

- [ ] **Step 3: Implement `StockBadge.svelte`**

```svelte
<script lang="ts">
	import { stockStatus } from './format';

	interface Props {
		stock: number;
	}
	let { stock }: Props = $props();

	const status = $derived(stockStatus(stock));
</script>

<span
	class="inline-block rounded-full px-3 py-1 text-xs font-semibold"
	class:bg-missy-deep-purple={!status.soldOut}
	class:text-missy-classic-lavender={status.low}
	class:text-violet-200={!status.low && !status.soldOut}
	class:bg-zinc-700={status.soldOut}
	class:text-zinc-300={status.soldOut}
>
	{status.label}
</span>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/shop/StockBadge.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/shop/StockBadge.svelte src/lib/shop/StockBadge.test.ts
git commit -m "feat(shop): add StockBadge component"
```

---

## Task 7: `VariantSelector` component — TDD

**Files:**

- Create: `src/lib/shop/VariantSelector.svelte` (use the `svelte-file-editor` subagent)
- Create: `src/lib/shop/VariantSelector.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/shop/VariantSelector.test.ts`:

```ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import VariantSelector from './VariantSelector.svelte';
import type { Variant } from './types';

function variant(label: string, stock: number): Variant {
	return {
		priceId: `price_${label}`,
		productId: `prod_${label}`,
		label,
		image: '',
		price: 3000,
		stock
	};
}

describe('VariantSelector', () => {
	const variants = [variant('Lavender', 5), variant('Black', 0)];

	it('renders a button per variant', () => {
		render(VariantSelector, {
			props: { variants, variantType: 'color', selected: variants[0], onSelect: () => {} }
		});
		expect(screen.getByRole('button', { name: 'Lavender' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Black' })).toBeInTheDocument();
	});

	it('disables sold-out variants', () => {
		render(VariantSelector, {
			props: { variants, variantType: 'color', selected: variants[0], onSelect: () => {} }
		});
		expect(screen.getByRole('button', { name: 'Black' })).toBeDisabled();
	});

	it('marks the selected variant as pressed', () => {
		render(VariantSelector, {
			props: { variants, variantType: 'color', selected: variants[0], onSelect: () => {} }
		});
		expect(screen.getByRole('button', { name: 'Lavender' })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	});

	it('calls onSelect when a variant is clicked', async () => {
		const onSelect = vi.fn();
		render(VariantSelector, {
			props: { variants, variantType: 'color', selected: variants[0], onSelect }
		});
		screen.getByRole('button', { name: 'Lavender' }).click();
		expect(onSelect).toHaveBeenCalledWith(variants[0]);
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/shop/VariantSelector.test.ts`
Expected: FAIL — cannot find `./VariantSelector.svelte`.

- [ ] **Step 3: Implement `VariantSelector.svelte`**

```svelte
<script lang="ts">
	import type { Variant, VariantType } from './types';
	import { stockStatus } from './format';

	interface Props {
		variants: Variant[];
		variantType: VariantType | null;
		selected: Variant;
		onSelect: (variant: Variant) => void;
	}
	let { variants, variantType, selected, onSelect }: Props = $props();
</script>

<div
	role="group"
	aria-label={variantType === 'size' ? 'Size' : 'Color'}
	class="flex flex-wrap gap-2"
>
	{#each variants as variant (variant.priceId)}
		<button
			type="button"
			aria-pressed={variant.priceId === selected.priceId}
			disabled={stockStatus(variant.stock).soldOut}
			onclick={() => onSelect(variant)}
			class="aria-pressed:border-missy-classic-lavender aria-pressed:text-missy-classic-lavender rounded-full border px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40"
		>
			{variant.label}
		</button>
	{/each}
</div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/shop/VariantSelector.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/shop/VariantSelector.svelte src/lib/shop/VariantSelector.test.ts
git commit -m "feat(shop): add VariantSelector component"
```

---

## Task 8: `ProductCard` component — TDD

**Files:**

- Create: `src/lib/shop/ProductCard.svelte` (use the `svelte-file-editor` subagent)
- Create: `src/lib/shop/ProductCard.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/shop/ProductCard.test.ts`:

```ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ProductCard from './ProductCard.svelte';
import type { ProductGroup } from './types';

function group(over: Partial<ProductGroup> = {}): ProductGroup {
	return {
		slug: 'classic-trucker',
		name: 'Classic Trucker',
		description: 'A hat',
		variantType: 'color',
		image: 'https://img/trucker.png',
		fromPrice: 3200,
		variants: [
			{
				priceId: 'pr1',
				productId: 'p1',
				label: 'Lavender',
				image: 'https://img/trucker.png',
				price: 3200,
				stock: 8
			}
		],
		...over
	};
}

describe('ProductCard', () => {
	it('links to the group detail page', () => {
		render(ProductCard, { props: { group: group() } });
		expect(screen.getByRole('link')).toHaveAttribute('href', '/shop/classic-trucker');
	});

	it('shows the name and a "from" price for multi-variant groups', () => {
		render(ProductCard, {
			props: {
				group: group({
					variants: [
						{ priceId: 'pr1', productId: 'p1', label: 'A', image: '', price: 3200, stock: 1 },
						{ priceId: 'pr2', productId: 'p2', label: 'B', image: '', price: 3500, stock: 1 }
					]
				})
			}
		});
		expect(screen.getByText('Classic Trucker')).toBeInTheDocument();
		expect(screen.getByText('from $32.00')).toBeInTheDocument();
	});

	it('shows a sold-out marker when every variant is out of stock', () => {
		render(ProductCard, {
			props: {
				group: group({
					variants: [
						{ priceId: 'pr1', productId: 'p1', label: 'A', image: '', price: 3200, stock: 0 }
					]
				})
			}
		});
		expect(screen.getByText('Sold out')).toBeInTheDocument();
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/shop/ProductCard.test.ts`
Expected: FAIL — cannot find `./ProductCard.svelte`.

- [ ] **Step 3: Implement `ProductCard.svelte`**

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ProductGroup } from './types';
	import { formatPrice } from './format';

	interface Props {
		group: ProductGroup;
	}
	let { group }: Props = $props();

	const soldOut = $derived(group.variants.every((variant) => variant.stock <= 0));
	const multi = $derived(group.variants.length > 1);
</script>

<a
	href={resolve('/shop/[group]', { group: group.slug })}
	class="border-missy-classic-lavender/12 group block overflow-hidden rounded-2xl border bg-[#1d1830]"
>
	<div class="bg-missy-deep-purple/40 relative aspect-square">
		{#if group.image}
			<img src={group.image} alt={group.name} class="h-full w-full object-cover" />
		{/if}
		{#if soldOut}
			<span
				class="absolute top-3 left-3 rounded-full bg-zinc-900/80 px-3 py-1 text-xs text-zinc-200"
			>
				Sold out
			</span>
		{/if}
	</div>
	<div class="px-4 py-4">
		<div class="text-sm font-semibold">{group.name}</div>
		<div class="text-missy-classic-lavender text-sm">
			{multi ? 'from ' : ''}{formatPrice(group.fromPrice)}
		</div>
	</div>
</a>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/shop/ProductCard.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/shop/ProductCard.svelte src/lib/shop/ProductCard.test.ts
git commit -m "feat(shop): add ProductCard component"
```

---

## Task 9: `/shop` storefront route

**Files:**

- Create: `src/routes/shop/+page.server.ts`
- Modify: `src/routes/shop/+page.svelte` (replace placeholder; use the `svelte-file-editor` subagent)

- [ ] **Step 1: Create the loader**

`src/routes/shop/+page.server.ts`:

```ts
import { listGroups } from '$lib/server/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { groups, error } = await listGroups();
	return { groups, loadError: Boolean(error) };
};
```

- [ ] **Step 2: Replace `+page.svelte` with the catalog grid**

`src/routes/shop/+page.svelte`:

```svelte
<script lang="ts">
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';
	import ProductCard from '$lib/shop/ProductCard.svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Shop — Missy Midwest</title>
</svelte:head>

<section class="w-full max-w-screen-2xl px-8 py-20 md:px-14">
	<SectionHeading label="Shop" title="Rep the brand" />

	{#if data.loadError}
		<p class="opacity-85">The shop is temporarily unavailable. Please check back soon.</p>
		<div class="mt-6">
			<Button href={resolve('/contact')} label="Get in touch" variant="outline" />
		</div>
	{:else if data.groups.length === 0}
		<p class="opacity-85">Merch is dropping soon. In the meantime, catch a show or say hi.</p>
		<div class="mt-6 flex gap-4">
			<Button href={resolve('/shows')} label="See shows" variant="fill" />
			<Button href={resolve('/contact')} label="Get in touch" variant="outline" />
		</div>
	{:else}
		<div class="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each data.groups as group (group.slug)}
				<ProductCard {group} />
			{/each}
		</div>
	{/if}
</section>
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/routes/shop/+page.server.ts src/routes/shop/+page.svelte
git commit -m "feat(shop): wire /shop storefront to the catalog"
```

---

## Task 10: `/shop/[group]` detail route

**Files:**

- Create: `src/routes/shop/[group]/+page.server.ts`
- Create: `src/routes/shop/[group]/+page.svelte` (use the `svelte-file-editor` subagent)

- [ ] **Step 1: Create the loader (404 on unknown slug)**

`src/routes/shop/[group]/+page.server.ts`:

```ts
import { error } from '@sveltejs/kit';
import { getGroup } from '$lib/server/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const group = await getGroup(params.group);
	if (!group) {
		error(404, 'Product not found');
	}
	return { group };
};
```

- [ ] **Step 2: Create the detail page (variant toggle + photo swap + stock)**

`src/routes/shop/[group]/+page.svelte`:

```svelte
<script lang="ts">
	import VariantSelector from '$lib/shop/VariantSelector.svelte';
	import StockBadge from '$lib/shop/StockBadge.svelte';
	import { formatPrice } from '$lib/shop/format';
	import type { Variant } from '$lib/shop/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selected = $state<Variant>(data.group.variants[0]);
</script>

<svelte:head>
	<title>{data.group.name} — Missy Midwest</title>
</svelte:head>

<section class="grid w-full max-w-screen-2xl gap-10 px-8 py-20 md:grid-cols-2 md:px-14">
	<div class="bg-missy-deep-purple/40 aspect-square overflow-hidden rounded-2xl">
		{#if selected.image}
			<img src={selected.image} alt={data.group.name} class="h-full w-full object-cover" />
		{/if}
	</div>

	<div>
		<h1 class="text-4xl md:text-5xl">{data.group.name}</h1>
		<p class="text-missy-classic-lavender mt-3 text-2xl">{formatPrice(selected.price)}</p>
		<div class="mt-3"><StockBadge stock={selected.stock} /></div>

		{#if data.group.description}
			<p class="mt-6 max-w-md opacity-85">{data.group.description}</p>
		{/if}

		{#if data.group.variants.length > 1}
			<div class="mt-8">
				<div class="label-eyebrow mb-3">{data.group.variantType === 'size' ? 'Size' : 'Color'}</div>
				<VariantSelector
					variants={data.group.variants}
					variantType={data.group.variantType}
					{selected}
					onSelect={(variant) => (selected = variant)}
				/>
			</div>
		{/if}
	</div>
</section>
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add "src/routes/shop/[group]/+page.server.ts" "src/routes/shop/[group]/+page.svelte"
git commit -m "feat(shop): add /shop/[group] detail page with variant toggle"
```

---

## Task 11: Rewire the Home shop teaser

**Files:**

- Modify: `src/routes/+page.server.ts`
- Modify: `src/lib/home/ShopTeaser.svelte` (use the `svelte-file-editor` subagent)
- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: Load shop groups alongside shows**

Replace `src/routes/+page.server.ts` with:

```ts
import { getNextEvents } from '$lib/server/calendar';
import { listGroups } from '$lib/server/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [shows, catalog] = await Promise.all([getNextEvents(4), listGroups()]);
	return { nextShows: shows.events, shopGroups: catalog.groups.slice(0, 3) };
};
```

- [ ] **Step 2: Make `ShopTeaser` render real groups**

Replace `src/lib/home/ShopTeaser.svelte` with:

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';
	import ProductCard from '$lib/shop/ProductCard.svelte';
	import type { ProductGroup } from '$lib/shop/types';

	interface Props {
		groups: ProductGroup[];
	}
	let { groups }: Props = $props();
</script>

{#if groups.length > 0}
	<section class="w-full max-w-screen-2xl px-8 py-16 md:px-14">
		<div class="flex items-end justify-between">
			<SectionHeading label="Shop" title="Rep the brand" />
			<Button href={resolve('/shop')} label="View all →" variant="outline" />
		</div>
		<div class="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each groups as group (group.slug)}
				<ProductCard {group} />
			{/each}
		</div>
	</section>
{/if}
```

- [ ] **Step 3: Pass the data in `+page.svelte`**

In `src/routes/+page.svelte`, change `<ShopTeaser />` to:

```svelte
<ShopTeaser groups={data.shopGroups} />
```

- [ ] **Step 4: Typecheck**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/routes/+page.server.ts src/routes/+page.svelte src/lib/home/ShopTeaser.svelte
git commit -m "feat(shop): rewire Home teaser to real catalog data"
```

---

## Task 12: Dev seed script for test-mode products

**Files:**

- Create: `scripts/seed-stripe.mjs`

This is dev-only tooling: it creates the lineup in Stripe **test mode** so the storefront can be viewed locally, and it documents the exact metadata values referenced by spec §13 step 1. Run once (re-running creates duplicates). Images use public placeholder URLs until real product photos exist.

- [ ] **Step 1: Write the seed script**

`scripts/seed-stripe.mjs`:

```js
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
```

- [ ] **Step 2: Run it against test mode** (requires a real test-mode `STRIPE_SECRET_KEY` in `.env`; needs network, so run with `dangerouslyDisableSandbox: true`)

Run: `node --env-file=.env scripts/seed-stripe.mjs`
Expected: prints `Created prod_… — Classic Trucker — Lavender` lines and `Done seeding test-mode products.`

> If `.env` does not yet hold a real test-mode key, skip running and note that the user must run it after adding the key. The unit/integration tests do not depend on this script.

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-stripe.mjs
git commit -m "chore(shop): add dev seed script for test-mode products"
```

---

## Task 13: E2E smoke + full verification

**Files:**

- Modify: `e2e/smoke.spec.ts`

- [ ] **Step 1: Add a `/shop` smoke assertion**

Append to `e2e/smoke.spec.ts` (robust whether or not products are seeded — asserts the heading renders, not specific cards):

```ts
test('shop page loads and shows the section heading', async ({ page }) => {
	await page.goto('/shop');
	await expect(page.getByRole('heading', { name: /rep the brand/i })).toBeVisible();
});
```

- [ ] **Step 2: Run the full unit suite**

Run: `npm test`
Expected: PASS — all existing tests plus the new format/group-products/catalog/StockBadge/VariantSelector/ProductCard suites.

- [ ] **Step 3: Coverage check on new logic**

Run: `npm run test:coverage`
Expected: `src/lib/shop/*` and `src/lib/server/catalog.ts` at 80%+ line coverage.

- [ ] **Step 4: Typecheck, lint, build**

Run: `npm run check && npm run lint && npm run build`
Expected: svelte-check 0/0; prettier + eslint clean; build succeeds.

- [ ] **Step 5: E2E smoke**

Run: `npm run test:e2e`
Expected: both smoke tests pass.

- [ ] **Step 6: Commit**

```bash
git add e2e/smoke.spec.ts
git commit -m "test(shop): add /shop e2e smoke assertion"
```

---

## Completion

After all tasks pass verification, use **superpowers:finishing-a-development-branch** to merge `phase2-shop` back into `redesign` (NOT `main`) and clean up. Then proceed to sub-PR 2b (cart + checkout).

---

## Self-Review (completed against the spec)

**Spec coverage (§3–§5, §12):**

- §3 product/variant model + domain types → Task 2; metadata keys (`group`/`groupName`/`variant`/`variantType`/`stock`/`sort`) consumed in Task 4 and produced by the seed script in Task 12.
- §4 catalog adapter (pure `groupProducts`, server-only fetch, no stock caching, graceful degradation) → Tasks 4 & 5.
- §5 pages/components (`/shop`, `/shop/[group]`, `ProductCard`, `VariantSelector`, `StockBadge`, rewired Home teaser) → Tasks 6–11. _Add-to-cart deliberately deferred to 2b — stated in the Scope note._
- §12 testing (unit on grouping/formatting, integration on catalog with mocked Stripe, E2E smoke) → Tasks 3–8, 13.

**Placeholder scan:** every code step contains complete code; no TBD/"handle errors"/"similar to" placeholders.

**Type consistency:** `Variant`, `ProductGroup`, `CatalogProductInput`, `CatalogResult`, `StockStatus`, `formatPrice`, `stockStatus`, `groupProducts`, `listGroups`, `getGroup` are used identically across tasks. `resolve('/shop/[group]', { group })` matches the SvelteKit typed-route signature verified against the installed `@sveltejs/kit`.

**Known intentional gap:** `src/lib/server/stripe.ts` is untested (trivial client construction); catalog tests mock it. This mirrors the existing `calendar.ts` testing approach.
