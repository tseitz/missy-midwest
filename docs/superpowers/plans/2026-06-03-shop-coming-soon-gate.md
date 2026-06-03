# Shop "Coming Soon" Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate the Stripe storefront behind a branded "Coming Soon" notice so the `redesign` branch can merge to `main` and deploy with everything except the shop live.

**Architecture:** One hardcoded constant `SHOP_ENABLED` (default `false`) is the single source of truth. Server loads and the checkout endpoint short-circuit when it is `false`; client components hide the cart icon and render "Coming Soon" variants. The shop's real code is untouched, so flipping the constant to `true` relaunches the storefront with no other change.

**Tech Stack:** SvelteKit + Svelte 5 (runes), TypeScript, Vitest + @testing-library/svelte, Tailwind v4. Package manager: **pnpm only**.

**Spec:** `docs/superpowers/specs/2026-06-02-shop-coming-soon-gate-design.md`

---

## Conventions for the executor

- **pnpm only** — never npm/yarn. Run single test files with `pnpm exec vitest run <path>`.
- **`.svelte` edits go through the `svelte-file-editor` subagent** (project rule in CLAUDE.md): it validates with `svelte-autofixer`. The exact code is given in each task; hand it to that subagent rather than hand-writing the file.
- Vitest is a single jsdom project; globals are enabled but existing tests import `describe/it/expect/vi/beforeEach` explicitly — match that.
- Error/redirect assertions use the existing pattern: `await expect(load(...)).rejects.toMatchObject({ status, location })`. `error()` and `redirect()` from `@sveltejs/kit` **throw**.
- The mockable-flag pattern used throughout: a `vi.hoisted` mutable plus a getter-backed `vi.mock` of `$lib/shop/config`, reset to `enabled = true` in `beforeEach` so each suite defaults to the live shop.

---

## File Structure

**Created:**

- `src/lib/shop/config.ts` — the `SHOP_ENABLED` constant (single source of truth).
- `src/routes/shop/success/+page.server.ts` — redirect guard.
- `src/routes/shop/cancel/+page.server.ts` — redirect guard.
- Test files: `src/routes/shop/[group]/page.server.test.ts`, `src/routes/shop/success/page.server.test.ts`, `src/routes/shop/cancel/page.server.test.ts`, `src/routes/shop/page.server.test.ts`, `src/routes/page.server.test.ts`, `src/lib/home/ShopTeaser.test.ts`.

**Modified:**

- `src/routes/shop/checkout/+server.ts` + `src/routes/shop/checkout/server.test.ts` — 503 gate.
- `src/routes/shop/[group]/+page.server.ts` — redirect guard.
- `src/routes/shop/+page.server.ts` + `src/routes/shop/+page.svelte` — short-circuit + Coming Soon branch.
- `src/routes/+page.server.ts` — skip catalog when gated.
- `src/lib/home/ShopTeaser.svelte` — Coming Soon variant.
- `src/lib/header/Header.svelte` — hide cart icon when gated.

---

## Task 1: The `SHOP_ENABLED` switch

**Files:**

- Create: `src/lib/shop/config.ts`

- [ ] **Step 1: Create the constant module**

```ts
/** Master switch for the storefront. Flip to `true` to launch the shop. */
export const SHOP_ENABLED = false;
```

- [ ] **Step 2: Verify the suite is still green**

Nothing imports the module yet, so existing tests are unaffected.

Run: `pnpm test`
Expected: PASS (same as before).

- [ ] **Step 3: Commit**

```bash
git add src/lib/shop/config.ts
git commit -m "feat(shop): add SHOP_ENABLED master switch (default off)"
```

---

## Task 2: Gate the checkout endpoint (503)

**Files:**

- Modify: `src/routes/shop/checkout/server.test.ts`
- Modify: `src/routes/shop/checkout/+server.ts:14`

- [ ] **Step 1: Add the config mock + failing gated test**

In `src/routes/shop/checkout/server.test.ts`, extend the existing `vi.hoisted` block and add a `vi.mock` for the config. Change the top of the file from:

```ts
const { retrieveMock, createMock } = vi.hoisted(() => ({
	retrieveMock: vi.fn(),
	createMock: vi.fn()
}));

vi.mock('$lib/server/stripe', () => ({
	stripe: {
		prices: { retrieve: retrieveMock },
		checkout: { sessions: { create: createMock } }
	}
}));
```

to:

```ts
const { retrieveMock, createMock, shopConfig } = vi.hoisted(() => ({
	retrieveMock: vi.fn(),
	createMock: vi.fn(),
	shopConfig: { enabled: true }
}));

vi.mock('$lib/server/stripe', () => ({
	stripe: {
		prices: { retrieve: retrieveMock },
		checkout: { sessions: { create: createMock } }
	}
}));

vi.mock('$lib/shop/config', () => ({
	get SHOP_ENABLED() {
		return shopConfig.enabled;
	}
}));
```

Update the `beforeEach` to pin the flag on for every existing test:

```ts
beforeEach(() => {
	retrieveMock.mockReset();
	createMock.mockReset();
	shopConfig.enabled = true;
});
```

Add this test inside the `describe('POST /shop/checkout', ...)` block:

```ts
it('rejects checkout with 503 when the shop is gated', async () => {
	shopConfig.enabled = false;
	await expect(POST(event([{ priceId: 'price_a', quantity: 1 }]))).rejects.toMatchObject({
		status: 503
	});
	expect(retrieveMock).not.toHaveBeenCalled();
	expect(createMock).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/routes/shop/checkout/server.test.ts`
Expected: FAIL — the new test gets a 400 (or a created session), not 503, because no gate exists yet.

- [ ] **Step 3: Implement the gate**

In `src/routes/shop/checkout/+server.ts`, add the import (after line 5) and the guard as the first line of `POST`:

```ts
import { json, error } from '@sveltejs/kit';
import type Stripe from 'stripe';
import { z } from 'zod';
import { stripe } from '$lib/server/stripe';
import { stockFromProduct } from '$lib/shop/stock';
import { SHOP_ENABLED } from '$lib/shop/config';
import type { RequestHandler } from './$types';
```

```ts
export const POST: RequestHandler = async ({ request, url }) => {
	if (!SHOP_ENABLED) error(503, 'The shop is not open yet.');

	let body: unknown;
	// ...rest unchanged
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/routes/shop/checkout/server.test.ts`
Expected: PASS (the new gated test plus all existing checkout tests).

- [ ] **Step 5: Commit**

```bash
git add src/routes/shop/checkout/+server.ts src/routes/shop/checkout/server.test.ts
git commit -m "feat(shop): reject checkout with 503 while the shop is gated"
```

---

## Task 3: Redirect the product-detail route

**Files:**

- Create: `src/routes/shop/[group]/page.server.test.ts`
- Modify: `src/routes/shop/[group]/+page.server.ts`

- [ ] **Step 1: Write the failing test**

Create `src/routes/shop/[group]/page.server.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { getGroupMock, shopConfig } = vi.hoisted(() => ({
	getGroupMock: vi.fn(),
	shopConfig: { enabled: true }
}));

vi.mock('$lib/server/catalog', () => ({ getGroup: getGroupMock }));
vi.mock('$lib/shop/config', () => ({
	get SHOP_ENABLED() {
		return shopConfig.enabled;
	}
}));

import { load } from './+page.server';

function event(group: string) {
	return { params: { group } } as unknown as Parameters<typeof load>[0];
}

beforeEach(() => {
	getGroupMock.mockReset();
	shopConfig.enabled = true;
});

describe('shop/[group] load', () => {
	it('redirects to /shop when the shop is gated', async () => {
		shopConfig.enabled = false;
		await expect(load(event('classic-trucker'))).rejects.toMatchObject({
			status: 307,
			location: '/shop'
		});
		expect(getGroupMock).not.toHaveBeenCalled();
	});

	it('returns the group when live', async () => {
		const group = { slug: 'classic-trucker', name: 'Classic Trucker' };
		getGroupMock.mockResolvedValue(group);
		await expect(load(event('classic-trucker'))).resolves.toEqual({ group });
	});

	it('404s an unknown group when live', async () => {
		getGroupMock.mockResolvedValue(undefined);
		await expect(load(event('nope'))).rejects.toMatchObject({ status: 404 });
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/routes/shop/[group]/page.server.test.ts`
Expected: FAIL — the gated test does not redirect (current load calls `getGroup` and 404s).

- [ ] **Step 3: Implement the redirect guard**

Replace `src/routes/shop/[group]/+page.server.ts` with:

```ts
import { error, redirect } from '@sveltejs/kit';
import { getGroup } from '$lib/server/catalog';
import { SHOP_ENABLED } from '$lib/shop/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	if (!SHOP_ENABLED) redirect(307, '/shop');
	const group = await getGroup(params.group);
	if (!group) {
		error(404, 'Product not found');
	}
	return { group };
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/routes/shop/[group]/page.server.test.ts`
Expected: PASS (all three tests).

- [ ] **Step 5: Commit**

```bash
git add "src/routes/shop/[group]/+page.server.ts" "src/routes/shop/[group]/page.server.test.ts"
git commit -m "feat(shop): redirect product pages to /shop while gated"
```

---

## Task 4: Guard the post-checkout return pages

**Files:**

- Create: `src/routes/shop/success/+page.server.ts`
- Create: `src/routes/shop/cancel/+page.server.ts`
- Create: `src/routes/shop/success/page.server.test.ts`
- Create: `src/routes/shop/cancel/page.server.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/routes/shop/success/page.server.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { shopConfig } = vi.hoisted(() => ({ shopConfig: { enabled: true } }));
vi.mock('$lib/shop/config', () => ({
	get SHOP_ENABLED() {
		return shopConfig.enabled;
	}
}));

import { load } from './+page.server';

function event() {
	return {} as unknown as Parameters<typeof load>[0];
}

beforeEach(() => {
	shopConfig.enabled = true;
});

describe('shop/success load', () => {
	it('redirects to /shop when gated', async () => {
		shopConfig.enabled = false;
		await expect(load(event())).rejects.toMatchObject({ status: 307, location: '/shop' });
	});

	it('renders normally when live', async () => {
		await expect(load(event())).resolves.toEqual({});
	});
});
```

Create `src/routes/shop/cancel/page.server.test.ts` with the identical content (same imports, same assertions) — it imports `./+page.server` relative to the cancel directory, so the file content is byte-for-byte the same as the success test above. Repeat it verbatim; do not import across directories.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec vitest run src/routes/shop/success/page.server.test.ts src/routes/shop/cancel/page.server.test.ts`
Expected: FAIL — both `+page.server.ts` files do not exist yet (import error).

- [ ] **Step 3: Implement the guards**

Create `src/routes/shop/success/+page.server.ts`:

```ts
import { redirect } from '@sveltejs/kit';
import { SHOP_ENABLED } from '$lib/shop/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (!SHOP_ENABLED) redirect(307, '/shop');
	return {};
};
```

Create `src/routes/shop/cancel/+page.server.ts` with identical content (its own `./$types`):

```ts
import { redirect } from '@sveltejs/kit';
import { SHOP_ENABLED } from '$lib/shop/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (!SHOP_ENABLED) redirect(307, '/shop');
	return {};
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm exec vitest run src/routes/shop/success/page.server.test.ts src/routes/shop/cancel/page.server.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/routes/shop/success/+page.server.ts src/routes/shop/success/page.server.test.ts src/routes/shop/cancel/+page.server.ts src/routes/shop/cancel/page.server.test.ts
git commit -m "feat(shop): redirect success/cancel pages to /shop while gated"
```

---

## Task 5: `/shop` load short-circuit + Coming Soon page

**Files:**

- Create: `src/routes/shop/page.server.test.ts`
- Modify: `src/routes/shop/+page.server.ts`
- Modify: `src/routes/shop/+page.svelte` (via `svelte-file-editor` subagent)

- [ ] **Step 1: Write the failing server-load test**

Create `src/routes/shop/page.server.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { listGroupsMock, shopConfig } = vi.hoisted(() => ({
	listGroupsMock: vi.fn(),
	shopConfig: { enabled: true }
}));

vi.mock('$lib/server/catalog', () => ({ listGroups: listGroupsMock }));
vi.mock('$lib/shop/config', () => ({
	get SHOP_ENABLED() {
		return shopConfig.enabled;
	}
}));

import { load } from './+page.server';

function event() {
	return {} as unknown as Parameters<typeof load>[0];
}

beforeEach(() => {
	listGroupsMock.mockReset();
	listGroupsMock.mockResolvedValue({ groups: [], error: null });
	shopConfig.enabled = true;
});

describe('shop/+page load', () => {
	it('short-circuits without calling Stripe when gated', async () => {
		shopConfig.enabled = false;
		const data = await load(event());
		expect(listGroupsMock).not.toHaveBeenCalled();
		expect(data).toEqual({ shopEnabled: false, groups: [], loadError: false });
	});

	it('lists groups when live', async () => {
		listGroupsMock.mockResolvedValue({ groups: [{ slug: 'x' }], error: null });
		const data = await load(event());
		expect(listGroupsMock).toHaveBeenCalled();
		expect(data).toMatchObject({ shopEnabled: true, loadError: false });
		expect(data.groups).toHaveLength(1);
	});

	it('flags a load error when the catalog fails', async () => {
		listGroupsMock.mockResolvedValue({ groups: [], error: new Error('stripe down') });
		const data = await load(event());
		expect(data).toMatchObject({ shopEnabled: true, loadError: true });
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/routes/shop/page.server.test.ts`
Expected: FAIL — current load always calls `listGroups` and returns no `shopEnabled` key.

- [ ] **Step 3: Implement the server short-circuit**

Replace `src/routes/shop/+page.server.ts` with:

```ts
import { listGroups } from '$lib/server/catalog';
import { SHOP_ENABLED } from '$lib/shop/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (!SHOP_ENABLED) {
		return { shopEnabled: false as const, groups: [], loadError: false };
	}
	const { groups, error } = await listGroups();
	return { shopEnabled: true as const, groups, loadError: Boolean(error) };
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/routes/shop/page.server.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Update the page to render the Coming Soon branch**

Hand the following full file to the `svelte-file-editor` subagent for `src/routes/shop/+page.svelte`:

```svelte
<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import ProductCard from '$lib/shop/ProductCard.svelte';
	import { resolve } from '$app/paths';
	import Seo from '$lib/seo/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Seo
	title="Shop — Missy Midwest"
	description="Official Missy Midwest merch — hats, tees, and more."
/>

<Section label="Shop" title={data.shopEnabled ? 'Rep the brand' : 'Coming soon'} reveal={false}>
	{#if !data.shopEnabled}
		<p class="opacity-85">
			Official Missy Midwest merch — hats, tees &amp; more — is dropping soon. Catch a show or say
			hi in the meantime.
		</p>
		<div class="mt-6 flex gap-4">
			<Button href={resolve('/shows')} label="See shows" variant="fill" />
			<Button href={resolve('/contact')} label="Get in touch" variant="outline" />
		</div>
	{:else if data.loadError}
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
</Section>
```

- [ ] **Step 6: Typecheck the page change**

Run: `pnpm check`
Expected: PASS — no type errors (the `shopEnabled` discriminant resolves the `PageData` union).

- [ ] **Step 7: Commit**

```bash
git add src/routes/shop/+page.server.ts src/routes/shop/+page.svelte src/routes/shop/page.server.test.ts
git commit -m "feat(shop): render Coming Soon at /shop and skip Stripe while gated"
```

---

## Task 6: Homepage — skip catalog + Coming Soon teaser

**Files:**

- Create: `src/routes/page.server.test.ts`
- Create: `src/lib/home/ShopTeaser.test.ts`
- Modify: `src/routes/+page.server.ts`
- Modify: `src/lib/home/ShopTeaser.svelte` (via `svelte-file-editor` subagent)

- [ ] **Step 1: Write the failing home-load test**

Create `src/routes/page.server.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { getNextEventsMock, listGroupsMock, getInstagramMock, shopConfig } = vi.hoisted(() => ({
	getNextEventsMock: vi.fn(),
	listGroupsMock: vi.fn(),
	getInstagramMock: vi.fn(),
	shopConfig: { enabled: true }
}));

vi.mock('$lib/server/calendar', () => ({ getNextEvents: getNextEventsMock }));
vi.mock('$lib/server/catalog', () => ({ listGroups: listGroupsMock }));
vi.mock('$lib/server/instagram', () => ({ getInstagramFeed: getInstagramMock }));
vi.mock('$lib/shop/config', () => ({
	get SHOP_ENABLED() {
		return shopConfig.enabled;
	}
}));

import { load } from './+page.server';

function event() {
	return {} as unknown as Parameters<typeof load>[0];
}

beforeEach(() => {
	getNextEventsMock.mockReset().mockResolvedValue({ events: [] });
	getInstagramMock.mockReset().mockResolvedValue({ posts: [] });
	listGroupsMock.mockReset().mockResolvedValue({ groups: [], error: null });
	shopConfig.enabled = true;
});

describe('home +page load', () => {
	it('skips the catalog when the shop is gated', async () => {
		shopConfig.enabled = false;
		const data = await load(event());
		expect(listGroupsMock).not.toHaveBeenCalled();
		expect(data.shopGroups).toEqual([]);
	});

	it('loads up to 3 groups when live', async () => {
		listGroupsMock.mockResolvedValue({
			groups: [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }, { slug: 'd' }],
			error: null
		});
		const data = await load(event());
		expect(listGroupsMock).toHaveBeenCalled();
		expect(data.shopGroups).toHaveLength(3);
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/routes/page.server.test.ts`
Expected: FAIL — current load always calls `listGroups`, so the gated assertion fails.

- [ ] **Step 3: Implement the home short-circuit**

Replace `src/routes/+page.server.ts` with:

```ts
import { getNextEvents } from '$lib/server/calendar';
import { listGroups } from '$lib/server/catalog';
import { getInstagramFeed } from '$lib/server/instagram';
import { SHOP_ENABLED } from '$lib/shop/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [shows, instagram, catalog] = await Promise.all([
		getNextEvents(4),
		getInstagramFeed(),
		SHOP_ENABLED ? listGroups() : Promise.resolve({ groups: [] })
	]);
	return {
		nextShows: shows.events,
		shopGroups: catalog.groups.slice(0, 3),
		instagramPosts: instagram.posts
	};
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/routes/page.server.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the failing ShopTeaser component test**

Create `src/lib/home/ShopTeaser.test.ts`:

```ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ProductGroup } from '$lib/shop/types';

const { shopConfig } = vi.hoisted(() => ({ shopConfig: { enabled: true } }));
vi.mock('$lib/shop/config', () => ({
	get SHOP_ENABLED() {
		return shopConfig.enabled;
	}
}));

import ShopTeaser from './ShopTeaser.svelte';

function group(): ProductGroup {
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
		]
	};
}

beforeEach(() => {
	shopConfig.enabled = true;
});

describe('ShopTeaser', () => {
	it('shows the Coming Soon variant when the shop is gated', () => {
		shopConfig.enabled = false;
		render(ShopTeaser, { props: { groups: [] } });
		expect(screen.getByText('Coming soon')).toBeInTheDocument();
		expect(screen.queryByText('Classic Trucker')).not.toBeInTheDocument();
		expect(screen.queryByText('View all →')).not.toBeInTheDocument();
	});

	it('renders the product grid when live with groups', () => {
		render(ShopTeaser, { props: { groups: [group()] } });
		expect(screen.getByText('Rep the brand')).toBeInTheDocument();
		expect(screen.getByText('Classic Trucker')).toBeInTheDocument();
	});

	it('renders nothing when live with no groups', () => {
		const { container } = render(ShopTeaser, { props: { groups: [] } });
		expect(container).toBeEmptyDOMElement();
	});
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `pnpm exec vitest run src/lib/home/ShopTeaser.test.ts`
Expected: FAIL — current `ShopTeaser` renders nothing when `groups` is empty, so "Coming soon" is absent.

- [ ] **Step 7: Implement the ShopTeaser Coming Soon variant**

Hand the following full file to the `svelte-file-editor` subagent for `src/lib/home/ShopTeaser.svelte`:

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import ProductCard from '$lib/shop/ProductCard.svelte';
	import { SHOP_ENABLED } from '$lib/shop/config';
	import type { ProductGroup } from '$lib/shop/types';

	interface Props {
		groups: ProductGroup[];
	}
	let { groups }: Props = $props();
</script>

{#if !SHOP_ENABLED}
	<Section label="Shop" title="Coming soon">
		<p class="mt-2 max-w-md opacity-85">
			Official Missy Midwest merch — hats, tees &amp; more — is on the way. Dropping soon.
		</p>
		<div class="mt-6">
			<Button href={resolve('/shows')} label="See shows" variant="outline" />
		</div>
	</Section>
{:else if groups.length > 0}
	<Section label="Shop" title="Rep the brand">
		{#snippet action()}
			<Button href={resolve('/shop')} label="View all →" variant="outline" />
		{/snippet}
		<div class="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each groups as group (group.slug)}
				<ProductCard {group} />
			{/each}
		</div>
	</Section>
{/if}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `pnpm exec vitest run src/lib/home/ShopTeaser.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 9: Commit**

```bash
git add src/routes/+page.server.ts src/routes/page.server.test.ts src/lib/home/ShopTeaser.svelte src/lib/home/ShopTeaser.test.ts
git commit -m "feat(home): Coming Soon teaser and skip catalog fetch while gated"
```

---

## Task 7: Hide the header cart icon

**Files:**

- Modify: `src/lib/header/Header.svelte` (via `svelte-file-editor` subagent)

The cart icon is presentational; its `{#if SHOP_ENABLED}` gate is verified in the Task 8 smoke test (no brittle Header render test mocking `$app/state` + `Nav` + the cart store — that would be poor test design for a one-line conditional).

- [ ] **Step 1: Add the import and wrap the cart button**

Hand these two edits to the `svelte-file-editor` subagent for `src/lib/header/Header.svelte`:

1. Add the config import after the cart import (line 4):

```ts
import { cart } from '$lib/shop/cart.svelte';
import { SHOP_ENABLED } from '$lib/shop/config';
```

2. Wrap the entire cart `<button>…</button>` element (currently lines 26–61) in a `{#if SHOP_ENABLED}` block:

```svelte
<Nav />
{#if SHOP_ENABLED}
	<button
		type="button"
		aria-label={cart.count > 0
			? `Open cart, ${cart.count} item${cart.count === 1 ? '' : 's'}`
			: 'Open cart'}
		class={[
			'relative order-first transition md:order-none',
			cart.count > 0
				? 'text-lake-sunrise hover:text-lake-sunset'
				: 'text-slate-50 hover:text-missy-blush'
		]}
		onclick={() => (cart.open = true)}
	>
		<svg
			class="h-6 w-6"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.7"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<circle cx="6" cy="19" r="2" />
			<circle cx="17" cy="19" r="2" />
			<path d="M17 17H6V3H4" />
			<path d="M6 5l14 1-1 7H6" />
		</svg>
		{#if cart.count > 0}
			<span
				class="bg-missy-magenta absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
			>
				{cart.count}
			</span>
		{/if}
	</button>
{/if}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/header/Header.svelte
git commit -m "feat(header): hide cart icon while the shop is gated"
```

---

## Task 8: Full verification + manual smoke

**Files:** none (verification only).

- [ ] **Step 1: Run the full unit suite with coverage**

Run: `pnpm test:coverage`
Expected: PASS, all tests green. New gate logic (config short-circuits, checkout 503, redirects, teaser variant) is covered ≥ 80%.

- [ ] **Step 2: Typecheck the whole project**

Run: `pnpm check`
Expected: PASS, 0 errors.

- [ ] **Step 3: Lint + format check**

Run: `pnpm lint`
Expected: PASS (prettier + eslint clean).

- [ ] **Step 4: Production build**

Run: `pnpm build`
Expected: build succeeds.

- [ ] **Step 5: Manual smoke — gated (default)**

Run: `pnpm preview` (or `pnpm dev`) and check, with `SHOP_ENABLED = false`:

- `/` — homepage shows the "Coming soon" Shop teaser; **no cart icon** in the header.
- `/shop` — renders the "Coming soon" page (See shows / Get in touch).
- `/shop/classic-trucker` (any slug) — redirects to `/shop`.
- `/shop/success` and `/shop/cancel` — redirect to `/shop`.
- `POST /shop/checkout` (e.g. `curl -X POST localhost:4173/shop/checkout -H 'content-type: application/json' -d '[{"priceId":"x","quantity":1}]'`) — returns 503.

- [ ] **Step 6: Manual smoke — temporarily flip on**

Temporarily set `SHOP_ENABLED = true` in `src/lib/shop/config.ts`, restart the dev/preview server, and confirm the live storefront returns (product grid on `/` teaser and `/shop`, cart icon visible). This requires Stripe test env vars to be present. **Then revert the constant back to `false`** — do not commit the flip.

Run: `git diff --stat` — expected: clean (the flip was reverted).

- [ ] **Step 7: Final commit (only if formatting changed)**

```bash
git status --short
# If prettier reformatted anything during verification:
git add -A && git commit -m "style(shop): formatting after Coming Soon gate"
```

---

## Self-Review (completed by plan author)

- **Spec coverage:** every §4 touchpoint maps to a task — switch (T1), checkout 503 (T2), `[group]` redirect (T3), success/cancel redirects (T4), `/shop` short-circuit + page (T5), home skip + teaser (T6), cart icon (T7); nav link intentionally unchanged. §8 testing items map to T2, T3, T4, T5, T6 tests; the two presentational branches (`/shop` page, header icon) are covered by the T8 smoke with documented rationale.
- **Placeholders:** none — every code step is complete; the duplicated success/cancel files are spelled out in full.
- **Type consistency:** `SHOP_ENABLED` (constant) and `shopConfig.enabled` (the test mock's mutable) are used consistently; load returns use the `shopEnabled` discriminant in both `+page.server.ts` and the `+page.svelte` consumer; home load destructures `[shows, instagram, catalog]` matching the reordered `Promise.all`.
