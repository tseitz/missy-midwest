# Shop "Coming Soon" Gate · Design Spec

> Gates the Stripe storefront behind a branded "Coming Soon" notice so the
> `redesign` trunk can merge to `main` and deploy with everything **except** the
> shop live. The shop's real code is left intact; a single constant flip relaunches
> it. Builds on the Phase 2 shop (`2026-05-29-missy-midwest-phase2-shop-design.md`),
> which is complete and seeded in Stripe test mode.

## 1. Goal

Ship the redesign to production with the shop visibly **not yet open**: a polished
"Coming Soon" page at `/shop`, a "Coming Soon" teaser on the homepage, and every
purchase path (cart icon, product detail pages, checkout, post-checkout returns)
disabled or short-circuited. Launching the shop later is a one-line change.

## 2. Scope

In scope:

1. **Master switch** — one hardcoded constant `SHOP_ENABLED` (default `false`).
2. **`/shop` page** — renders a "Coming Soon" block when gated; skips the Stripe
   catalog call.
3. **Homepage teaser** — `ShopTeaser` renders a "Coming Soon" variant when gated
   (no product grid, no Stripe call); unchanged when live.
4. **Header cart icon** — hidden when gated.
5. **Deep routes** — `/shop/[group]`, `/shop/success`, `/shop/cancel` redirect to
   `/shop` when gated.
6. **Checkout endpoint** — `POST /shop/checkout` returns `503` when gated.
7. **Tests** — existing shop tests pinned to `SHOP_ENABLED = true`; new tests for
   the gated paths.

Out of scope: email capture / "notify me" (declined — no backend storage now);
removing the "Shop" nav link (it is the path to the Coming Soon page); any change
to the live shop's real behavior; env-based flags (a hardcoded constant was chosen
because go-live already requires a deploy for live Stripe keys + re-seed).

## 3. The switch — `src/lib/shop/config.ts`

```ts
/** Master switch for the storefront. Flip to `true` to launch the shop. */
export const SHOP_ENABLED = false;
```

A plain constant — no secret, no env — so server loads, server endpoints, and
`.svelte` components all import one source of truth. **Every gate in this spec
reads this constant and nothing else**, so there is no second switch to drift out
of sync. Launching the shop = change `false` → `true`, commit, deploy.

## 4. Touchpoints

| Touchpoint         | File                                                           | Behavior when `SHOP_ENABLED === false`                                                                                                     |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `/shop` page       | `src/routes/shop/+page.svelte`, `+page.server.ts`              | Load **skips `listGroups()`** and returns `{ shopEnabled: false, groups: [], loadError: false }`. Page renders the Coming Soon block (§5). |
| Homepage teaser    | `src/lib/home/ShopTeaser.svelte`, `src/routes/+page.server.ts` | Home load **skips `listGroups()`** (passes `[]`). Teaser branches on `SHOP_ENABLED` and renders the Coming Soon variant (§6).              |
| Header cart icon   | `src/lib/header/Header.svelte`                                 | Cart `<button>` wrapped in `{#if SHOP_ENABLED}` — hidden.                                                                                  |
| Product detail     | `src/routes/shop/[group]/+page.server.ts`                      | `redirect(307, '/shop')` before any Stripe call.                                                                                           |
| Order confirmed    | `src/routes/shop/success/+page.server.ts` (new)                | `redirect(307, '/shop')`.                                                                                                                  |
| Checkout cancelled | `src/routes/shop/cancel/+page.server.ts` (new)                 | `redirect(307, '/shop')`.                                                                                                                  |
| Checkout endpoint  | `src/routes/shop/checkout/+server.ts`                          | First line of `POST`: `if (!SHOP_ENABLED) error(503, 'The shop is not open yet.');`                                                        |
| "Shop" nav link    | `src/lib/nav.ts`                                               | **Unchanged** — points at the Coming Soon page.                                                                                            |

`CartDrawer` (mounted globally in `+layout.svelte`) needs no change: with the cart
icon hidden there is no trigger to open it, and the cart stays empty.

## 5. `/shop` Coming Soon page

`+page.server.ts` short-circuits so the page never depends on a seeded catalog:

```ts
import { SHOP_ENABLED } from '$lib/shop/config';
import { listGroups } from '$lib/server/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (!SHOP_ENABLED) return { shopEnabled: false as const, groups: [], loadError: false };
	const { groups, error } = await listGroups();
	return { shopEnabled: true as const, groups, loadError: Boolean(error) };
};
```

`+page.svelte` gains a gated branch **before** the existing live/empty/error
branches, reusing `Section` + `Button` (design-system primitives):

- `Section` with `label="Shop"`, `title="Coming soon"`, `reveal={false}`.
- Copy: a short line, e.g. _"Official Missy Midwest merch — hats, tees & more.
  Dropping soon. Catch a show or say hi in the meantime."_
- CTAs: `See shows` (fill → `/shows`) and `Get in touch` (outline → `/contact`),
  mirroring the existing empty-state markup.

Exact copy is an implementation detail, refined during the plan.

## 6. Homepage `ShopTeaser` Coming Soon variant

`ShopTeaser` imports `SHOP_ENABLED` and branches:

```svelte
{#if !SHOP_ENABLED}
	<!-- Coming Soon teaser: Section label="Shop" title="Coming soon" + short line.
	     No product grid, no "View all" action. -->
{:else if groups.length > 0}
	<!-- existing product grid (unchanged) -->
{/if}
```

The home `+page.server.ts` skips `listGroups()` when gated:

```ts
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
```

The teaser's live path is unchanged, so flipping the flag restores today's
behavior with no further edits.

## 7. Error handling & resilience

- While gated, **neither the homepage nor `/shop` calls Stripe** — the site does
  not depend on the catalog being seeded, and a Stripe outage can't affect the
  pre-launch site.
- The checkout `503` is defense-in-depth: no UI reaches it while gated, but a
  hand-crafted POST is rejected before touching Stripe.
- Redirects use `307` (temporary) — these paths become valid again at launch.

## 8. Testing

Existing shop tests assume a live shop. They pin the flag **on** so they keep
exercising real logic; new tests cover the gated paths. Use the same `vi.hoisted`
pattern already in `checkout/server.test.ts`:

```ts
const { mockConfig } = vi.hoisted(() => ({ mockConfig: { SHOP_ENABLED: true } }));
vi.mock('$lib/shop/config', () => ({
	get SHOP_ENABLED() {
		return mockConfig.SHOP_ENABLED;
	}
}));
// existing tests: leave mockConfig.SHOP_ENABLED = true (default)
// gated test:     set mockConfig.SHOP_ENABLED = false
```

New / updated tests:

1. **`checkout/server.test.ts`** — add: gated → `POST` returns `503` and never
   calls `stripe.prices.retrieve`. Existing tests pin the flag on.
2. **`shop/[group]/+page.server` test** (new file) — gated → load throws
   `redirect(307, '/shop')`; live → returns the group (existing behavior, mock
   `getGroup`).
3. **`shop/success` + `shop/cancel` `+page.server` tests** (new) — gated → throw
   `redirect(307, '/shop')`.
4. **`ShopTeaser.test.ts`** (new) — gated → renders "Coming soon", no
   `ProductCard`; live with groups → renders the grid.
5. **`shop/+page.server` test** (new) — gated → returns `shopEnabled: false` and
   does **not** call `listGroups`.

Target: 80%+ coverage on all new branches (per repo testing rules).

## 9. Launch checklist (later, out of this PR's scope)

When the shop is ready: set `SHOP_ENABLED = true`, ensure live Stripe keys + a
re-seeded live catalog are in place, deploy. No other code change is required to
re-expose the storefront, cart, checkout, and homepage product grid.
