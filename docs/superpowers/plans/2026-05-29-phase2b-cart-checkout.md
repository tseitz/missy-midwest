# Phase 2b — Cart + Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Svelte files:** every `.svelte` / `.svelte.ts` file MUST be created/edited via the `svelte-file-editor` subagent and validated with `svelte-autofixer` (per CLAUDE.md).
>
> **Branch:** all work happens on `phase2-cart`, branched from `redesign` (NOT `main` — `main` auto-deploys to production). Merge back to `redesign` at the end via superpowers:finishing-a-development-branch.

**Goal:** Add a localStorage cart (runes store + drawer + header badge), an add-to-cart button on the product detail page, and a server-side Stripe Checkout endpoint ($6 flat shipping + free local pickup) with success/cancel pages — completing the buy flow up to Stripe-hosted Checkout.

**Architecture:** A Svelte 5 runes `Cart` class in `cart.svelte.ts` holds line items in `$state`, persisted to `localStorage`, exposing `count`/`subtotal` and an `open` flag for the drawer. The detail page's add-to-cart pushes the selected variant. A `CartDrawer` (mounted globally in the layout) POSTs `[{priceId, quantity}]` to `shop/checkout/+server.ts`, which **re-reads each price + stock from Stripe** (never trusting the client), creates a Checkout Session, and returns its `url` for client redirect. No Stripe.js, no publishable key.

**Tech Stack:** SvelteKit 2 + Svelte 5 runes, Tailwind v4, `stripe` Node SDK (v22), Vitest 3 + @testing-library/svelte, Playwright.

**Spec:** `docs/superpowers/specs/2026-05-29-missy-midwest-phase2-shop-design.md` (§6 Cart, §7 Checkout).

**Builds on 2a:** `src/lib/shop/types.ts` (`Variant`, `ProductGroup`), `src/lib/server/stripe.ts` (`stripe` client), `src/lib/shop/format.ts` (`formatPrice`), `src/lib/shop/StockBadge.svelte`, `src/lib/shop/VariantSelector.svelte`. The detail page `src/routes/shop/[group]/+page.svelte` already renders variant selection — this PR adds the add-to-cart button to it.

---

## File Structure

**Create:**

- `src/lib/shop/cart.svelte.ts` — `Cart` runes class + `cart` singleton; `CartLine` type. localStorage persistence. The cart's single responsibility: line-item state + totals + drawer open flag.
- `src/lib/shop/cart.test.ts` — unit tests for the cart logic (imports `./cart.svelte`).
- `src/lib/shop/CartDrawer.svelte` — slide-over drawer UI + checkout POST/redirect.
- `src/lib/shop/CartDrawer.test.ts` — component tests (render, qty/remove, checkout fetch).
- `src/routes/shop/checkout/+server.ts` — POST → validated Stripe Checkout Session.
- `src/routes/shop/checkout/server.test.ts` — endpoint tests (mock Stripe).
- `src/routes/shop/success/+page.svelte` — clears cart, thank-you.
- `src/routes/shop/cancel/+page.svelte` — checkout-cancelled message.

**Modify:**

- `src/lib/header/Header.svelte` — add a cart button + count badge that opens the drawer.
- `src/routes/+layout.svelte` — mount `<CartDrawer />` globally.
- `src/routes/shop/[group]/+page.svelte` — add the add-to-cart button (disabled when the selected variant is sold out).

**Note on test filenames:** name cart/drawer/endpoint tests `cart.test.ts`, `CartDrawer.test.ts`, `server.test.ts` — do NOT put `.svelte.` in a test filename (the Svelte plugin would try to compile the test itself as a runes module).

---

## Task 1: Cart runes store — TDD

**Files:**

- Create: `src/lib/shop/cart.test.ts`
- Create: `src/lib/shop/cart.svelte.ts`

- [ ] **Step 1: Write the failing tests**

`src/lib/shop/cart.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Cart } from './cart.svelte';
import type { ProductGroup, Variant } from './types';

function variant(over: Partial<Variant> = {}): Variant {
	return {
		priceId: 'price_a',
		productId: 'prod_a',
		label: 'Lavender',
		image: 'https://img/a.png',
		price: 3200,
		stock: 8,
		...over
	};
}

function group(over: Partial<ProductGroup> = {}): ProductGroup {
	return {
		slug: 'classic-trucker',
		name: 'Classic Trucker',
		description: '',
		variantType: 'color',
		image: '',
		fromPrice: 3200,
		variants: [variant()],
		...over
	};
}

describe('Cart', () => {
	let cart: Cart;
	beforeEach(() => {
		cart = new Cart();
	});

	it('adds a variant as a new line with qty 1', () => {
		cart.add(variant(), group());
		expect(cart.lines).toHaveLength(1);
		expect(cart.lines[0]).toMatchObject({
			priceId: 'price_a',
			productId: 'prod_a',
			groupSlug: 'classic-trucker',
			label: 'Classic Trucker — Lavender',
			unitPrice: 3200,
			qty: 1
		});
	});

	it('increments qty when the same variant is added again', () => {
		cart.add(variant(), group());
		cart.add(variant(), group());
		expect(cart.lines).toHaveLength(1);
		expect(cart.lines[0].qty).toBe(2);
	});

	it('clamps qty to available stock when adding', () => {
		const v = variant({ stock: 2 });
		cart.add(v, group());
		cart.add(v, group());
		cart.add(v, group());
		expect(cart.lines[0].qty).toBe(2);
	});

	it('setQty clamps between 1 and stock', () => {
		cart.add(variant({ stock: 5 }), group());
		cart.setQty('price_a', 99);
		expect(cart.lines[0].qty).toBe(5);
		cart.setQty('price_a', 0);
		expect(cart.lines[0].qty).toBe(1);
	});

	it('removes a line by priceId', () => {
		cart.add(variant(), group());
		cart.remove('price_a');
		expect(cart.lines).toHaveLength(0);
	});

	it('clears all lines', () => {
		cart.add(variant(), group());
		cart.add(variant({ priceId: 'price_b' }), group());
		cart.clear();
		expect(cart.lines).toHaveLength(0);
	});

	it('computes count and subtotal across lines', () => {
		cart.add(variant({ priceId: 'price_a', price: 3200, stock: 9 }), group());
		cart.add(variant({ priceId: 'price_a', price: 3200, stock: 9 }), group());
		cart.add(variant({ priceId: 'price_b', price: 2800, stock: 9 }), group());
		expect(cart.count).toBe(3);
		expect(cart.subtotal).toBe(3200 * 2 + 2800);
	});

	it('exposes an open flag for the drawer', () => {
		expect(cart.open).toBe(false);
		cart.open = true;
		expect(cart.open).toBe(true);
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/shop/cart.test.ts`
Expected: FAIL — cannot find `./cart.svelte`.

- [ ] **Step 3: Implement `cart.svelte.ts`**

```ts
import { browser } from '$app/environment';
import type { ProductGroup, Variant } from './types';

const STORAGE_KEY = 'missy-cart';

export interface CartLine {
	priceId: string;
	productId: string;
	groupSlug: string;
	label: string; // "Classic Trucker — Lavender"
	image: string;
	unitPrice: number; // cents
	stock: number; // cached for client-side qty clamp; the server re-validates at checkout
	qty: number;
}

function clamp(qty: number, stock: number): number {
	return Math.max(1, Math.min(qty, stock));
}

export class Cart {
	lines = $state<CartLine[]>([]);
	open = $state(false);

	constructor(initial: CartLine[] = []) {
		this.lines = initial;
	}

	get count(): number {
		return this.lines.reduce((total, line) => total + line.qty, 0);
	}

	get subtotal(): number {
		return this.lines.reduce((total, line) => total + line.unitPrice * line.qty, 0);
	}

	add(variant: Variant, group: ProductGroup): void {
		const existing = this.lines.find((line) => line.priceId === variant.priceId);
		if (existing) {
			existing.qty = clamp(existing.qty + 1, variant.stock);
		} else {
			this.lines.push({
				priceId: variant.priceId,
				productId: variant.productId,
				groupSlug: group.slug,
				label: `${group.name} — ${variant.label}`,
				image: variant.image,
				unitPrice: variant.price,
				stock: variant.stock,
				qty: 1
			});
		}
		this.save();
	}

	setQty(priceId: string, qty: number): void {
		const line = this.lines.find((entry) => entry.priceId === priceId);
		if (!line) return;
		line.qty = clamp(qty, line.stock);
		this.save();
	}

	remove(priceId: string): void {
		this.lines = this.lines.filter((line) => line.priceId !== priceId);
		this.save();
	}

	clear(): void {
		this.lines = [];
		this.save();
	}

	private save(): void {
		if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lines));
	}
}

function load(): CartLine[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as CartLine[]) : [];
	} catch {
		return [];
	}
}

export const cart = new Cart(load());
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/shop/cart.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/shop/cart.svelte.ts src/lib/shop/cart.test.ts
git commit -m "feat(shop): add localStorage cart runes store"
```

---

## Task 2: CartDrawer component — TDD

**Files:**

- Create: `src/lib/shop/CartDrawer.test.ts`
- Create: `src/lib/shop/CartDrawer.svelte` (use the `svelte-file-editor` subagent)

- [ ] **Step 1: Write the failing test**

`src/lib/shop/CartDrawer.test.ts`:

```ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import CartDrawer from './CartDrawer.svelte';
import { cart } from './cart.svelte';

beforeEach(() => {
	cart.clear();
	cart.open = true;
});

function seed() {
	cart.add(
		{ priceId: 'price_a', productId: 'p1', label: 'Lavender', image: '', price: 3200, stock: 8 },
		{
			slug: 'trucker',
			name: 'Classic Trucker',
			description: '',
			variantType: 'color',
			image: '',
			fromPrice: 3200,
			variants: []
		}
	);
}

describe('CartDrawer', () => {
	it('shows an empty message when the cart has no lines', () => {
		render(CartDrawer);
		expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
	});

	it('renders a line and the subtotal when items are present', () => {
		seed();
		render(CartDrawer);
		expect(screen.getByText('Classic Trucker — Lavender')).toBeInTheDocument();
		expect(screen.getByText('$32.00')).toBeInTheDocument();
	});

	it('removes a line when its remove button is clicked', async () => {
		seed();
		render(CartDrawer);
		await screen.getByRole('button', { name: /remove/i }).click();
		expect(cart.lines).toHaveLength(0);
	});

	it('POSTs cart lines to the checkout endpoint and redirects', async () => {
		seed();
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ url: 'https://checkout.stripe.com/x' })
		});
		vi.stubGlobal('fetch', fetchMock);
		const location = { href: '' };
		vi.stubGlobal('location', location as Location);

		render(CartDrawer);
		await screen.getByRole('button', { name: /checkout/i }).click();
		await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());

		const [path, init] = fetchMock.mock.calls[0];
		expect(path).toBe('/shop/checkout');
		expect(JSON.parse(init.body)).toEqual([{ priceId: 'price_a', quantity: 1 }]);

		vi.unstubAllGlobals();
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/shop/CartDrawer.test.ts`
Expected: FAIL — cannot find `./CartDrawer.svelte`.

- [ ] **Step 3: Implement `CartDrawer.svelte`**

```svelte
<script lang="ts">
	import { cart } from './cart.svelte';
	import { formatPrice } from './format';

	let error = $state('');
	let submitting = $state(false);

	async function checkout() {
		submitting = true;
		error = '';
		try {
			const res = await fetch('/shop/checkout', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(
					cart.lines.map((line) => ({ priceId: line.priceId, quantity: line.qty }))
				)
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				error = data.message ?? 'Something went wrong. Please try again.';
				return;
			}
			const { url } = await res.json();
			location.href = url;
		} catch {
			error = 'Could not reach checkout. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

{#if cart.open}
	<button
		type="button"
		aria-label="Close cart"
		class="fixed inset-0 z-40 bg-black/50"
		onclick={() => (cart.open = false)}
	></button>

	<aside
		class="bg-missy-deep-purple border-missy-classic-lavender/15 fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l p-6"
	>
		<div class="flex items-center justify-between">
			<h2 class="text-2xl">Your Cart</h2>
			<button type="button" aria-label="Close cart" onclick={() => (cart.open = false)}>✕</button>
		</div>

		{#if cart.lines.length === 0}
			<p class="mt-8 opacity-80">Your cart is empty.</p>
		{:else}
			<ul class="mt-6 flex-1 space-y-4 overflow-auto">
				{#each cart.lines as line (line.priceId)}
					<li class="flex gap-3">
						<div class="bg-missy-deep-purple/40 h-16 w-16 shrink-0 overflow-hidden rounded-md">
							{#if line.image}
								<img src={line.image} alt={line.label} class="h-full w-full object-cover" />
							{/if}
						</div>
						<div class="flex-1">
							<div class="text-sm font-semibold">{line.label}</div>
							<div class="text-missy-classic-lavender text-sm">{formatPrice(line.unitPrice)}</div>
							<div class="mt-1 flex items-center gap-2">
								<button
									type="button"
									aria-label="Decrease quantity"
									onclick={() => cart.setQty(line.priceId, line.qty - 1)}
									class="h-6 w-6 rounded border">−</button
								>
								<span class="w-6 text-center text-sm">{line.qty}</span>
								<button
									type="button"
									aria-label="Increase quantity"
									onclick={() => cart.setQty(line.priceId, line.qty + 1)}
									class="h-6 w-6 rounded border">+</button
								>
								<button
									type="button"
									aria-label="Remove item"
									onclick={() => cart.remove(line.priceId)}
									class="ml-auto text-xs underline opacity-70">Remove</button
								>
							</div>
						</div>
					</li>
				{/each}
			</ul>

			<div class="mt-6 border-t border-white/10 pt-4">
				<div class="flex justify-between text-lg">
					<span>Subtotal</span>
					<span>{formatPrice(cart.subtotal)}</span>
				</div>
				<p class="mt-1 text-xs opacity-60">Shipping calculated at checkout.</p>
				{#if error}
					<p class="mt-3 text-sm text-red-300">{error}</p>
				{/if}
				<button
					type="button"
					disabled={submitting}
					onclick={checkout}
					class="bg-missy-classic-lavender mt-4 w-full rounded-full py-3 font-semibold text-[#3a1233] disabled:opacity-50"
				>
					{submitting ? 'Redirecting…' : 'Checkout →'}
				</button>
			</div>
		{/if}
	</aside>
{/if}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/shop/CartDrawer.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/shop/CartDrawer.svelte src/lib/shop/CartDrawer.test.ts
git commit -m "feat(shop): add cart drawer with checkout action"
```

---

## Task 3: Header cart badge + mount drawer

**Files:**

- Modify: `src/lib/header/Header.svelte` (use the `svelte-file-editor` subagent)
- Modify: `src/routes/+layout.svelte` (use the `svelte-file-editor` subagent)

- [ ] **Step 1: Add the cart button + badge to the header**

Replace `src/lib/header/Header.svelte` with:

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import Nav from '$lib/header/Nav.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import { cart } from '$lib/shop/cart.svelte';
</script>

<header
	class="bg-missy-deep-purple/85 border-missy-classic-lavender/15 sticky top-0 z-30 w-full border-b backdrop-blur-md"
>
	<div class="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
		<div class="hidden md:block"><SocialLinks size={22} /></div>
		<a href={resolve('/')} class="missy-header text-lg tracking-wide text-white md:text-xl"
			>MISSY MIDWEST</a
		>
		<div class="flex items-center gap-4">
			<Nav />
			<button
				type="button"
				aria-label="Open cart"
				class="relative"
				onclick={() => (cart.open = true)}
			>
				<span aria-hidden="true">🛒</span>
				{#if cart.count > 0}
					<span
						class="bg-missy-classic-lavender absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-[#3a1233]"
					>
						{cart.count}
					</span>
				{/if}
			</button>
		</div>
	</div>
</header>
```

- [ ] **Step 2: Mount the drawer globally in the layout**

Replace `src/routes/+layout.svelte` with:

```svelte
<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import CartDrawer from '$lib/shop/CartDrawer.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<Header />

<main class="bg-missy-deep-purple flex min-h-screen w-full flex-col items-center">
	{@render children()}
</main>

<Footer />
<CartDrawer />
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/header/Header.svelte src/routes/+layout.svelte
git commit -m "feat(shop): add header cart badge and mount drawer"
```

---

## Task 4: Add-to-cart button on the detail page

**Files:**

- Modify: `src/routes/shop/[group]/+page.svelte` (use the `svelte-file-editor` subagent)

- [ ] **Step 1: Add the add-to-cart button**

Replace `src/routes/shop/[group]/+page.svelte` with (adds the cart import, a `soldOut` derived, and the button after the variant selector):

```svelte
<script lang="ts">
	import VariantSelector from '$lib/shop/VariantSelector.svelte';
	import StockBadge from '$lib/shop/StockBadge.svelte';
	import { formatPrice } from '$lib/shop/format';
	import { cart } from '$lib/shop/cart.svelte';
	import { stockStatus } from '$lib/shop/format';
	import type { Variant } from '$lib/shop/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Writable derived: defaults to the first variant and resets on navigation
	// to a different group, while still allowing the toggle to override it.
	let selected = $derived<Variant>(data.group.variants[0]);
	const soldOut = $derived(stockStatus(selected.stock).soldOut);

	function addToCart() {
		cart.add(selected, data.group);
		cart.open = true;
	}
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

		<button
			type="button"
			disabled={soldOut}
			onclick={addToCart}
			class="bg-missy-classic-lavender mt-8 rounded-full px-8 py-3 font-semibold text-[#3a1233] disabled:cursor-not-allowed disabled:opacity-50"
		>
			{soldOut ? 'Sold out' : 'Add to cart'}
		</button>
	</div>
</section>
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add "src/routes/shop/[group]/+page.svelte"
git commit -m "feat(shop): add add-to-cart button to detail page"
```

---

## Task 5: Checkout endpoint — TDD

**Files:**

- Create: `src/routes/shop/checkout/server.test.ts`
- Create: `src/routes/shop/checkout/+server.ts`

- [ ] **Step 1: Write the failing tests**

`src/routes/shop/checkout/server.test.ts` (mocks `$lib/server/stripe`):

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

import { POST } from './+server';

function price(over: { active?: boolean; stock?: string } = {}) {
	return {
		id: 'price_a',
		active: over.active ?? true,
		unit_amount: 3200,
		product: { id: 'prod_a', metadata: { stock: over.stock ?? '8' } }
	};
}

function event(body: unknown) {
	return {
		request: new Request('http://localhost/shop/checkout', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		}),
		url: new URL('http://localhost/shop/checkout')
	} as unknown as Parameters<typeof POST>[0];
}

beforeEach(() => {
	retrieveMock.mockReset();
	createMock.mockReset();
});

describe('POST /shop/checkout', () => {
	it('creates a Checkout Session and returns its url', async () => {
		retrieveMock.mockResolvedValue(price());
		createMock.mockResolvedValue({ url: 'https://checkout.stripe.com/x' });

		const res = await POST(event([{ priceId: 'price_a', quantity: 2 }]));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ url: 'https://checkout.stripe.com/x' });

		const args = createMock.mock.calls[0][0];
		expect(args).not.toHaveProperty('payment_method_types');
		expect(args.mode).toBe('payment');
		expect(args.line_items).toEqual([{ price: 'price_a', quantity: 2 }]);
		expect(args.shipping_options).toHaveLength(2);
		expect(args.shipping_options[0].shipping_rate_data.fixed_amount.amount).toBe(600);
		expect(args.shipping_options[1].shipping_rate_data.fixed_amount.amount).toBe(0);
		expect(args.shipping_address_collection.allowed_countries).toEqual(['US']);
	});

	it('rejects an empty cart with 400', async () => {
		await expect(POST(event([]))).rejects.toMatchObject({ status: 400 });
		expect(createMock).not.toHaveBeenCalled();
	});

	it('rejects a malformed line with 400', async () => {
		await expect(POST(event([{ priceId: 'price_a', quantity: 0 }]))).rejects.toMatchObject({
			status: 400
		});
	});

	it('rejects when stock is insufficient', async () => {
		retrieveMock.mockResolvedValue(price({ stock: '1' }));
		await expect(POST(event([{ priceId: 'price_a', quantity: 5 }]))).rejects.toMatchObject({
			status: 400
		});
		expect(createMock).not.toHaveBeenCalled();
	});

	it('rejects an inactive price', async () => {
		retrieveMock.mockResolvedValue(price({ active: false }));
		await expect(POST(event([{ priceId: 'price_a', quantity: 1 }]))).rejects.toMatchObject({
			status: 400
		});
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/routes/shop/checkout/server.test.ts`
Expected: FAIL — cannot find `./+server`.

- [ ] **Step 3: Implement `+server.ts`**

```ts
import { json, error } from '@sveltejs/kit';
import type Stripe from 'stripe';
import { stripe } from '$lib/server/stripe';
import type { RequestHandler } from './$types';

const SHIPPING_RATE_CENTS = 600;

interface CheckoutLine {
	priceId: string;
	quantity: number;
}

function isValidLine(line: unknown): line is CheckoutLine {
	return (
		typeof line === 'object' &&
		line !== null &&
		typeof (line as CheckoutLine).priceId === 'string' &&
		Number.isInteger((line as CheckoutLine).quantity) &&
		(line as CheckoutLine).quantity >= 1
	);
}

function stockOf(product: Stripe.Price['product']): number {
	if (typeof product === 'string') return 0;
	if ('deleted' in product && product.deleted) return 0;
	return Number.parseInt(product.metadata.stock ?? '0', 10) || 0;
}

export const POST: RequestHandler = async ({ request, url }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid request.');
	}

	if (!Array.isArray(body) || body.length === 0) {
		error(400, 'Your cart is empty.');
	}
	if (!body.every(isValidLine)) {
		error(400, 'Your cart contains an invalid item.');
	}

	const lines = body as CheckoutLine[];
	const lineItems: { price: string; quantity: number }[] = [];

	for (const line of lines) {
		let price: Stripe.Price;
		try {
			price = await stripe.prices.retrieve(line.priceId, { expand: ['product'] });
		} catch {
			error(400, 'An item in your cart is no longer available.');
		}
		if (!price.active) {
			error(400, 'An item in your cart is no longer available.');
		}
		if (stockOf(price.product) < line.quantity) {
			error(400, 'An item in your cart just sold out.');
		}
		lineItems.push({ price: line.priceId, quantity: line.quantity });
	}

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		line_items: lineItems,
		shipping_address_collection: { allowed_countries: ['US'] },
		shipping_options: [
			{
				shipping_rate_data: {
					type: 'fixed_amount',
					fixed_amount: { amount: SHIPPING_RATE_CENTS, currency: 'usd' },
					display_name: 'Flat-rate shipping'
				}
			},
			{
				shipping_rate_data: {
					type: 'fixed_amount',
					fixed_amount: { amount: 0, currency: 'usd' },
					display_name: 'Local pickup'
				}
			}
		],
		success_url: `${url.origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${url.origin}/shop/cancel`
	});

	return json({ url: session.url });
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/routes/shop/checkout/server.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Typecheck + commit**

Run: `npm run check`
Expected: 0 errors.

```bash
git add src/routes/shop/checkout/+server.ts src/routes/shop/checkout/server.test.ts
git commit -m "feat(shop): add stripe checkout session endpoint"
```

---

## Task 6: Success + cancel pages

**Files:**

- Create: `src/routes/shop/success/+page.svelte` (use the `svelte-file-editor` subagent)
- Create: `src/routes/shop/cancel/+page.svelte` (use the `svelte-file-editor` subagent)

- [ ] **Step 1: Create the success page (clears the cart)**

`src/routes/shop/success/+page.svelte`:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { cart } from '$lib/shop/cart.svelte';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';

	onMount(() => cart.clear());
</script>

<svelte:head>
	<title>Order confirmed — Missy Midwest</title>
</svelte:head>

<section class="flex w-full max-w-screen-2xl flex-col items-center px-8 py-28 text-center md:px-14">
	<SectionHeading label="Thank you" title="Order confirmed" />
	<p class="max-w-md opacity-85">
		Your order is in — you'll get a receipt by email. Missy will be in touch about shipping or
		pickup.
	</p>
	<div class="mt-6">
		<Button href={resolve('/shop')} label="Back to shop" variant="outline" />
	</div>
</section>
```

- [ ] **Step 2: Create the cancel page**

`src/routes/shop/cancel/+page.svelte`:

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';
</script>

<svelte:head>
	<title>Checkout cancelled — Missy Midwest</title>
</svelte:head>

<section class="flex w-full max-w-screen-2xl flex-col items-center px-8 py-28 text-center md:px-14">
	<SectionHeading label="Checkout" title="Order cancelled" />
	<p class="max-w-md opacity-85">
		No charge was made. Your cart is still saved if you'd like to try again.
	</p>
	<div class="mt-6">
		<Button href={resolve('/shop')} label="Back to shop" variant="fill" />
	</div>
</section>
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/routes/shop/success/+page.svelte src/routes/shop/cancel/+page.svelte
git commit -m "feat(shop): add checkout success and cancel pages"
```

---

## Task 7: E2E smoke + full verification

**Files:**

- Modify: `e2e/smoke.spec.ts`

- [ ] **Step 1: Add a cart-button smoke (works without seeded products)**

Append to `e2e/smoke.spec.ts`:

```ts
test('cart drawer opens from the header', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /open cart/i }).click();
	await expect(page.getByText(/your cart is empty/i)).toBeVisible();
});
```

- [ ] **Step 2: Run the full unit suite**

Run: `npm test`
Expected: PASS — all prior tests plus the new cart, drawer, and checkout suites.

- [ ] **Step 3: Coverage check on new logic**

Run: `npm run test:coverage`
Expected: `src/lib/shop/cart.svelte.ts` and `src/routes/shop/checkout/+server.ts` at 80%+ line coverage.

- [ ] **Step 4: Typecheck, lint, build**

Run: `npm run check && npm run lint && npm run build`
Expected: svelte-check 0/0; prettier + eslint clean; build succeeds.

- [ ] **Step 5: E2E smoke**

Run: `npm run test:e2e`
Expected: all smoke tests pass (home, shop, cart drawer).

- [ ] **Step 6: Commit**

```bash
git add e2e/smoke.spec.ts
git commit -m "test(shop): add cart drawer e2e smoke"
```

---

## Manual verification (after go-live keys exist)

The full purchase flow needs real test-mode products + a test key. Once `STRIPE_SECRET_KEY` is set and `node --env-file=.env scripts/seed-stripe.mjs` has run:

1. `npm run dev`, open `/shop`, open a product, pick a variant, **Add to cart** → drawer opens with the line + subtotal.
2. **Checkout →** redirects to Stripe-hosted Checkout. Use test card `4242 4242 4242 4242`, any future expiry/CVC/ZIP. Confirm the **$6 flat-rate** and **$0 local pickup** shipping options both appear.
3. Complete payment → lands on `/shop/success`, cart is cleared. (Stock decrement + order email are PR 2c, not this PR.)
4. Use the Stripe CLI / Dashboard to confirm a Checkout Session + PaymentIntent were created in test mode.

---

## Completion

After all tasks pass verification, use **superpowers:finishing-a-development-branch** to merge `phase2-cart` back into `redesign` (NOT `main`). Then proceed to sub-PR 2c (webhook + order email + Resend contact swap).

---

## Self-Review (completed against spec §6–§7)

**Spec coverage:**

- §6 Cart: runes store + localStorage (Task 1); line fields `priceId/productId/groupSlug/label/image/unitPrice/qty` (+ `stock` added for the client-side clamp the spec requires) (Task 1); drawer + badge (Tasks 2–3); qty clamp `1..stock` (Task 1 `clamp`); server re-derives real prices (Task 5).
- §7 Checkout: POST `[{priceId, quantity}]` (Task 5); **re-reads prices/stock from Stripe, never trusts client** (Task 5 loop); omits `payment_method_types` (Task 5, asserted in test); `shipping_address_collection` US; `shipping_options` $6 flat + $0 pickup (Task 5); success/cancel URLs (Task 5); returns `url`, client redirects, no Stripe.js (Task 2 `checkout()`); friendly validation errors + retry (Tasks 2 + 5).

**Placeholder scan:** every code step is complete; no TBD/"handle errors"/"similar to".

**Type consistency:** `CartLine`, `Cart` (`add`/`setQty`/`remove`/`clear`/`count`/`subtotal`/`open`/`lines`), `cart` singleton, `CheckoutLine`, `SHIPPING_RATE_CENTS` used consistently across tasks. `cart.add(variant, group)` signature matches its call site in the detail page (Task 4). The endpoint's `[{priceId, quantity}]` body matches what the drawer POSTs (Task 2).

**Intentional decisions:** `stock` is cached on `CartLine` (not in the spec's field list) so the drawer can clamp quantities; the server remains the real stock guard. The add-to-cart button (deferred from 2a) lands here. E2E covers the cart-button/empty-drawer path that works without seeded products; the full paid flow is documented as manual verification since it needs test-mode products + key.
