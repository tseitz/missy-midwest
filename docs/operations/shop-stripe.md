# Shop & Stripe runbook

How the storefront works, how to manage inventory, and how to take it live.
The shop is backed entirely by Stripe — **there is no database.**

## Mental model

- **Each buyable variant is one Stripe Product** (a color or a size), carrying one
  default Price.
- A product's **stock lives in `metadata.stock`** on the Stripe Product.
- The site reads **all active products from Stripe on every `/shop` load** and
  clusters them into groups by `metadata.group`. Stock is **never cached**, so any
  change in Stripe shows up on the next page refresh.
- Online sales **auto-decrement** stock via the webhook (below). No manual step.

### Product metadata schema

Each Stripe Product the storefront understands has this metadata:

| Key           | Example           | Meaning                                            |
| ------------- | ----------------- | -------------------------------------------------- |
| `group`       | `missy-snapback`  | Slug that clusters variants into one product group |
| `groupName`   | `MISSY Snapback`  | Display name of the group                          |
| `variant`     | `Camo`            | This variant's label (color or size)               |
| `variantType` | `color` or `size` | Drives the picker; omit for single-variant items   |
| `stock`       | `6`               | Units available; `0` (or missing) renders sold out |
| `sort`        | `3`               | Order within the group's picker                    |
| `priority`    | `10`              | Group's place on /shop; lower first, unset sinks   |

Plus the Product's own `name`, `description`, `images[]`, and `default_price`.
Products missing `group` or a price are skipped (with a warning) by the catalog.

## The gate: `SHOP_ENABLED`

`src/lib/shop/config.ts` exports `SHOP_ENABLED`. While `false`, `/shop` and the
home teaser show "Coming soon", the catalog skips Stripe entirely, cart/checkout
routes redirect, and the webhook/checkout endpoints no-op. **Launch = set it to
`true`** (with live keys in place — see go-live).

## Code map

| Path                                       | Role                                            |
| ------------------------------------------ | ----------------------------------------------- |
| `src/lib/server/catalog.ts`                | Reads active products, clusters into groups     |
| `src/lib/shop/group-products.ts`           | Pure grouping logic (unit-tested)               |
| `src/routes/api/stripe/webhook/+server.ts` | Handles `checkout.session.completed`            |
| `src/lib/server/fulfillment.ts`            | Computes stock decrements + order email payload |
| `scripts/seed-stripe.mjs`                  | Stands up the catalog (create-only)             |
| `scripts/set-stock.mjs`                    | Adjusts a live variant's stock                  |
| `scripts/set-priority.mjs`                 | Sets a group's /shop display order              |

## Inventory operations

### Online sale → automatic

On `checkout.session.completed` the webhook decrements `metadata.stock` for each
line item, emails the order notification, and stamps the session `fulfilled` so
Stripe retries don't double-count. Nothing for you to do.

### Offline sale, restock, or correction → `set-stock.mjs`

Stock changes are instant (no cache). Use the script (or edit `metadata.stock`
in the Stripe Dashboard by hand).

```bash
# See every variant and its current stock
node --env-file=.env scripts/set-stock.mjs list

# Set an absolute count
node --env-file=.env scripts/set-stock.mjs missy-snapback "Camo" 1

# Apply a delta — sold 5 on the beach / restocked 12
node --env-file=.env scripts/set-stock.mjs missy-snapback "Camo" -5
node --env-file=.env scripts/set-stock.mjs loz-cord-hat "One Size" +12
```

Matches one product by `group` + `variant` (case-insensitive), floors at 0, and
refuses ambiguous/unknown matches. For live, point it at the live key:
`STRIPE_SECRET_KEY=rk_live_xxx node scripts/set-stock.mjs ...`.

### Re-order products on /shop → `set-priority.mjs`

Product groups sort by `metadata.priority` (lower first); anything unset falls to
the bottom and stays alphabetical, so order only changes once you assign
priorities. The script writes the same `priority` onto every variant in a group
(so the group sorts as one) and, like stock, takes effect on the next page load.
Use **gaps of 10** so you can slot new items between later.

```bash
# See every group and its current priority
node --env-file=.env scripts/set-priority.mjs list

# Put the snapback first, the corduroy hat second
node --env-file=.env scripts/set-priority.mjs missy-snapback 10
node --env-file=.env scripts/set-priority.mjs loz-cord-hat 20
```

Matches every active product in the group, rejects a non-integer priority, and
errors on an unknown group. For live, point it at the live key:
`STRIPE_SECRET_KEY=rk_live_xxx node scripts/set-priority.mjs ...`.

### Add a new product or color

`seed-stripe.mjs` is **create-only and not idempotent** — re-running it makes
duplicates, and `--reset` archives the _entire_ catalog (test-only). So you don't
re-seed to add one item. Instead:

1. Add a photo to `static/shop/` (run `pnpm images` if it's a raw `.jpg`/`.png`),
   or reuse `picture-coming-soon.webp` as a placeholder.
2. Add the variant to the `lineup` in `scripts/seed-stripe.mjs` (keep it the
   source of truth), then create **just that product** — either in the Stripe
   Dashboard with the metadata schema above, or via a one-off script.
3. Turning a single-variant item into a multi-color group (e.g. adding a purple
   corduroy to the currently pink-only `loz-cord-hat`) also means editing the
   existing product: set its `variant` to the real color and add
   `variantType=color`. With 2+ variants sharing a `group`, the color picker
   appears automatically.

## Go-live: test → live cutover

Stripe **test and live are separate environments** — nothing created in test
exists in live. Seed each independently.

### 1. Verify in test

```bash
node --env-file=.env scripts/seed-stripe.mjs --reset   # clean test re-seed
pnpm dev                                                # http://localhost:5173/shop
```

Walk the flow and check out with test card `4242 4242 4242 4242`. (Stripe's
dashboard won't preview images that point at `localhost` — expected; the
storefront renders them fine.)

### 2. Create live credentials (Stripe Dashboard, in **Live** mode)

- **Restricted key** — Developers → API keys → create restricted key with
  **Products: Write · Prices: Write · Checkout Sessions: Write**. Gives you
  `rk_live_xxx`.
- **Webhook endpoint** — Developers → Webhooks → add endpoint
  `https://missymidwest.com/api/stripe/webhook`, event
  **`checkout.session.completed`**. Gives you the signing secret `whsec_xxx`.

### 3. Seed live (images point at the real domain)

```bash
SHOP_IMAGE_BASE_URL=https://missymidwest.com \
STRIPE_SECRET_KEY=rk_live_xxx \
node scripts/seed-stripe.mjs
```

No `--reset` — live starts empty. Run once; **don't re-seed after sales start**
(the webhook mutates stock you'd overwrite).

### 4. Set Netlify env (production context)

Set `STRIPE_SECRET_KEY` (the `rk_live_xxx`) and `STRIPE_WEBHOOK_SECRET` (the live
`whsec_xxx`). These must be in place **before** the `SHOP_ENABLED=true` deploy,
or the production shop errors.

### 5. Flip the gate and deploy

Set `SHOP_ENABLED = true` in `src/lib/shop/config.ts`, commit, merge to `main`
(auto-deploys via Netlify).

### 6. Verify live

Load `/shop`, place one small real order, confirm stock decremented in Stripe and
the order email arrived.

## Safety rules

- **Never** run `seed-stripe.mjs --reset` against the live key — it archives every
  active product.
- **Never** commit secret values (see [docs/README.md](../README.md)) — use env
  vars and placeholders.
- Don't re-seed live once sales start; use `set-stock.mjs` for adjustments.

## Environment variables

Names only (values live in `.env` locally / Netlify in prod; see `.env.example`):

- `STRIPE_SECRET_KEY` — test (`sk_test`/`rk_test`) locally, live (`rk_live`) in prod.
- `STRIPE_WEBHOOK_SECRET` — from `stripe listen` locally, from the live endpoint in prod.
- `SHOP_IMAGE_BASE_URL` — seed-only override for product image URLs (default
  `http://localhost:5173`; set to `https://missymidwest.com` when seeding live).
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ORDER_NOTIFY_EMAIL` — order notification email.
