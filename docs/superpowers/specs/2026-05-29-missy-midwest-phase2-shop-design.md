# Missy Midwest — Phase 2: Stripe Merch Shop · Design Spec

> Refines section 5 of the approved redesign spec
> (`2026-05-29-missy-midwest-redesign-design.md`) into an implementation-ready
> design. The high-level architecture (Stripe = single source of truth, no
> database) is unchanged; this document locks the concrete model, module
> boundaries, integration details, and sub-PR sequencing.

## 1. Goal

Add a Stripe-powered merch shop to the redesigned site so customers can browse
and buy apparel, and Missy manages products + stock herself in the Stripe
Dashboard. No database — Stripe is the source of truth and the admin panel.

## 2. Merch lineup (drives fixtures + the variant model)

Confirmed lineup, all **single-axis** (no style needs both color and size):

- **3 single-variant hats** — one design each, no color/size choice.
- **2 multi-color hat designs** — same design in several colors; the detail page
  offers a color toggle (shoe-shopping experience).
- **1 shirt design** — multiple sizes (S/M/L/XL); a couple sizes currently
  out of stock (`stock: 0` → rendered sold-out).

## 3. Product + variant model

Per the redesign spec: **one Stripe Product (with one Price) per variant.** A
style is a `group`; variants are clustered by shared `group` metadata.

Each Stripe Product carries metadata:

| Key           | Meaning                                                  | Example           |
| ------------- | -------------------------------------------------------- | ----------------- |
| `group`       | Slug clustering variants of one style                    | `classic-trucker` |
| `groupName`   | Display name for the group                               | `Classic Trucker` |
| `variant`     | Label shown in the selector                              | `Lavender`, `M`   |
| `variantType` | `color` \| `size` (omit/empty for single-variant styles) | `color`           |
| `stock`       | Integer stock count                                      | `12`              |
| `sort`        | Optional ordering within the group                       | `1`               |

The product's own `name`, `description`, `images[0]`, and default `price` supply
the rest. A single-variant style is simply a `group` with one product.

### Domain types (`src/lib/shop/types.ts`)

```ts
export type VariantType = 'color' | 'size';

export interface Variant {
	priceId: string; // Stripe Price ID — checkout line target
	productId: string; // Stripe Product ID — stock writeback target
	label: string; // "Lavender" | "M"
	image: string;
	price: number; // cents
	stock: number;
}

export interface ProductGroup {
	slug: string; // metadata.group
	name: string; // metadata.groupName
	description: string;
	variantType: VariantType | null; // null = single-variant (no toggle)
	image: string; // representative image (first in-stock, else first)
	fromPrice: number; // min variant price (cents)
	variants: Variant[]; // 1+, sorted
}
```

## 4. Catalog adapter (key new abstraction)

A thin typed layer isolates the Stripe SDK from the UI and makes grouping
logic unit-testable without the network.

- **`src/lib/shop/group-products.ts`** — `groupProducts(products): ProductGroup[]`,
  a **pure function** that clusters raw Stripe products by `metadata.group`,
  sorts variants by `sort` then `label`, derives `image`/`fromPrice`/`variantType`.
  Skips products missing required metadata (logs a warning). Fully unit-tested
  with fixtures.
- **`src/lib/server/stripe.ts`** — singleton Stripe client (latest API version,
  restricted key from env).
- **`src/lib/server/catalog.ts`** — `listGroups()` / `getGroup(slug)`. Fetches
  active products with prices expanded from Stripe, calls `groupProducts`.
  **Fetched server-side per request — stock is never cached** (a cached
  sold-out flag would be wrong). Errors degrade gracefully: a fetch failure
  yields an empty catalog + a logged error, and `/shop` shows a friendly
  "shop is temporarily unavailable" state rather than crashing.

The storefront pages call only `catalog.*`; they never import the Stripe SDK.

## 5. Pages & components

| Route / file                              | Responsibility                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| `src/routes/shop/+page.server.ts`         | `load` → `catalog.listGroups()`                                                 |
| `src/routes/shop/+page.svelte`            | Storefront grid — one `ProductCard` per group                                   |
| `src/routes/shop/[group]/+page.server.ts` | `load` → `catalog.getGroup(params.group)`; 404 if missing                       |
| `src/routes/shop/[group]/+page.svelte`    | Detail — variant toggle, photo swap, per-variant "N left"/Sold out, add-to-cart |
| `src/routes/shop/success/+page.svelte`    | Post-checkout success (clears cart)                                             |
| `src/routes/shop/cancel/+page.svelte`     | Checkout cancelled                                                              |
| `src/lib/shop/ProductCard.svelte`         | Group card (image, name, "from $X")                                             |
| `src/lib/shop/VariantSelector.svelte`     | Color swatches / size pills; emits selected variant                             |
| `src/lib/shop/StockBadge.svelte`          | "Only N left" (≤5) / "Sold out" / in-stock                                      |
| `src/lib/home/ShopTeaser.svelte`          | Existing teaser — rewired to real catalog data                                  |

All internal links use `resolve()`; product images come from Stripe URLs.

## 6. Cart

- **`src/lib/shop/cart.svelte.ts`** — Svelte 5 runes store (`$state`), persisted
  to `localStorage`. Each line: `{ priceId, productId, groupSlug, label, name,
image, unitPrice, qty }`. Cached display fields only — the **server re-derives
  real prices at checkout**, never trusting client amounts.
- API: `add(variant, group)`, `setQty(priceId, qty)`, `remove(priceId)`,
  `clear()`, derived `count` and `subtotal`.
- **`src/lib/shop/CartDrawer.svelte`** — slide-over with line items, qty steppers,
  subtotal, "Checkout" button. Header gets a cart badge (`count`).
- Guards: qty clamped to `1..stock`; lines whose variant later goes out of stock
  are flagged in the drawer.

## 7. Checkout

- **`src/routes/shop/checkout/+server.ts`** (`POST`): body is
  `[{ priceId, quantity }]`. Server **re-reads each Price from Stripe**
  (server-side), validates it is active and that the product's `stock` covers
  the quantity, then creates a **Checkout Session**:
  - `mode: 'payment'`, `line_items` built from validated price IDs.
  - **Omits `payment_method_types`** (dynamic payment methods, configured in
    Dashboard).
  - `shipping_address_collection` (allowed countries: US).
  - `shipping_options`: flat-rate shipping **+ a $0 local-pickup rate**.
  - `success_url` → `/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    `cancel_url` → `/shop/cancel`.
- Returns `{ url }`; client does `window.location.href = url`.
  **No Stripe.js, no publishable key, no card data touches our server.**
- Validation failures (empty cart, inactive price, insufficient stock) return a
  4xx with a friendly message; the drawer surfaces it and offers a retry +
  contact fallback.

## 8. Webhook + fulfillment

- **`src/routes/api/stripe/webhook/+server.ts`** (`POST`):
  - Reads the raw request body and **verifies the signature** against
    `STRIPE_WEBHOOK_SECRET` via `stripe.webhooks.constructEvent`. Unverified →
    `400`, no processing.
  - On `checkout.session.completed`: retrieves the session with
    `line_items.data.price.product` expanded, and for each line item subtracts
    the purchased quantity from that product's `stock` metadata via
    `products.update` (floored at 0).
  - Fires the Resend order-notification email (section 9).
  - Returns `200` quickly. Other event types → `200` ignored.
  - **Idempotency:** best-effort — logs `event.id`; with no database, duplicate
    deliveries are tolerated by logging (re-decrement risk is low and bounded).
- **Known limitation (carried from redesign spec, stated not hidden):** stock
  reflects _completed_ online sales and is not _reserved_ during checkout.
  Simultaneous purchase of the last unit can oversell by one — acceptable at
  merch scale; hardenable later.

## 9. Order email (Resend)

- **Customer:** receives Stripe's **automatic receipt** (enabled in the
  Dashboard — no code). v1 sends no custom customer email.
- **Missy:** receives a **Resend order-notification** email (line items,
  quantities, shipping address, total) so she can fulfill. One internal
  template, sent from a verified Resend domain to `ORDER_NOTIFY_EMAIL`.
- **`src/lib/server/email.ts`** wraps Resend and exposes `sendOrderNotification`
  and `sendContactMessage`. Replaces the EmailJS path.

### Contact-form swap (EmailJS → Resend)

The contact form moves from client-side EmailJS to a server-side Resend send via
the existing form action, reusing Turnstile for spam protection. The
`@emailjs/browser` dependency and its public key are removed. Validation stays at
the server boundary with user-friendly errors and no secrets in messages.

## 10. Environment & security

New env vars (server-only unless noted):

| Var                     | Purpose                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`     | **Restricted key** (`rk_`): Products read+write, Prices read, Checkout write, Payment Intents read |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification                                                                     |
| `RESEND_API_KEY`        | Resend transactional email                                                                         |
| `ORDER_NOTIFY_EMAIL`    | Where order notifications go (Missy)                                                               |
| `CONTACT_TO_EMAIL`      | Where contact-form messages go                                                                     |

- No publishable key — hosted-redirect checkout needs no client Stripe.js.
- Secrets server-only; `.env` for dev, Netlify env vars for prod.
- Webhook signature verified; unverified events rejected.
- Checkout re-reads prices/stock from Stripe; never trusts client amounts.
- All inputs validated at the server boundary; errors are friendly and leak no
  secrets; failures degrade gracefully.

## 11. Sub-PR sequencing

One shared spec, three branches off `redesign` (each its own PR, merges back):

- **2a — Storefront (`phase2-shop`):** domain types, `groupProducts`,
  `stripe.ts`, `catalog.ts`, `/shop`, `/shop/[group]`, `ProductCard`,
  `VariantSelector`, `StockBadge`, rewired Home teaser. Builds + tests against
  test-mode Stripe reads.
- **2b — Cart + checkout (`phase2-cart`):** `cart.svelte.ts`, `CartDrawer`,
  header badge, `checkout/+server.ts`, `/shop/success`, `/shop/cancel`.
- **2c — Webhook + email (`phase2-fulfillment`):** `webhook/+server.ts`,
  `email.ts`, Resend order notification, contact-form EmailJS→Resend swap,
  remove `@emailjs/browser`.

## 12. Testing (target 80%+ on new logic)

- **Unit:** `groupProducts` (clustering, sorting, single-variant, missing
  metadata), cart store (add/qty-clamp/remove/subtotal/persistence), stock/price
  formatting.
- **Integration:** checkout session creation (mocked Stripe — validates
  re-read + stock guard + no `payment_method_types`), webhook (stock decrement,
  signature rejection), contact action (mocked Resend + Turnstile).
- **E2E (Playwright):** browse `/shop` → open `/shop/[group]` → toggle variant →
  add to cart → reach Stripe Checkout (test mode). Use Stripe test cards.

## 13. Go-live setup checklist (handed to the user)

1. Create the 6 products in Stripe **test mode** with `group`/`groupName`/
   `variant`/`variantType`/`stock` metadata (exact values provided during 2a).
2. Generate the **restricted key** with the scopes in §10.
3. Register the webhook endpoint; capture `STRIPE_WEBHOOK_SECRET` (use the
   Stripe CLI for local testing).
4. Create a **Resend** account, verify a sending domain, generate the API key.
5. Enable Stripe automatic customer receipts in the Dashboard.
6. Populate `.env` (dev) and Netlify env vars (prod) with all keys above.
7. Repeat product setup in **live mode** before go-live.

## 14. Out of scope (v1)

Hard inventory reservation during checkout; on-site discount-code UI (Stripe
Checkout still accepts promo codes); customer accounts / order history; a product
CMS (the Stripe Dashboard is the admin).
