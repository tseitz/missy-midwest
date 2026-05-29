# Missy Midwest — Site Redesign + Stripe Shop · Design Spec

**Date:** 2026-05-29
**Status:** Approved direction, pending spec review
**Owner:** tseitz

---

## 1. Goal

Transform the current single-page DJ site into an impactful, modern, **multi-page** experience and add a **Stripe-powered shop** so Missy can sell merch and manage her own inventory. Preserve every existing feature, improve the integrations that were "cobbled together," and give the brand a polished, energetic look.

**Success criteria**
- A redesigned, multi-page site live with all current features intact.
- A working shop where customers can buy apparel (hats by color/style, shirts by size) and Missy manages products + stock herself in the Stripe Dashboard.
- Cleaner integration architecture (server-side email, auto-updating music feed) with **no database to run**.

---

## 2. Current state (baseline)

- **Stack:** SvelteKit + Svelte 5, Tailwind CSS v4, deployed on Netlify (`adapter-auto`). No database.
- **One page** (`src/routes/+page.svelte`): blurred hero → Bio → Upcoming Dates (Google Calendar) → Contact (EmailJS + Cloudflare Turnstile) → Support (Venmo/Cash App).
- **Built but dormant:** `Music.svelte` (hardcoded SoundCloud track embeds), `PressKit.svelte` (downloads), `PreviousEvents.svelte` (carousel stub), `/music` Audius route stub.
- **Brand:** deep purple / lavender / magenta + unused warm "lake" sunrise/sunset/cotton-candy tokens. Fonts: Cochin (headers), Obviously (body), Algiers (display), Fira Mono.
- **Pain points:** hash-anchor nav; contact flow is convoluted (server validates Turnstile, then the *browser* sends mail via EmailJS with client-exposed keys); music requires manual updates; several components use legacy Svelte syntax (`export let`, `$:`).

---

## 3. Visual direction — "Midwest Glow + a touch of bold"

Validated via mockups in the brainstorming session.

- **Foundation:** her purples warmed with the lake **sunrise/sunset + cotton-candy** accents — elegant and brand-forward.
- **Energy accents:** borrow from the bolder direction — **larger serif headlines** and a **subtle glow** on the hero and key CTAs only (not everywhere).
- **Type:** keep her real fonts — **Cochin** for headlines, **Obviously** for body/UI, **Algiers** reserved for occasional display moments. (Web stand-ins Cormorant/Sora/Anton were used only in mockups.)
- **Photography:** place photos generously where they earn impact (hero, about, section accents, show cards, product shots). Missy has many assets; design with clearly-marked photo slots she can fill.

### Design system
- **Tokens** (`src/app.css` `@theme`): keep existing `missy-*` palette; actually use the `lake-*` warm accents; add gradient + glow shadow utilities.
- **Reusable components (Svelte 5 runes):** `Button` (fill/outline), `SectionHeading` (uppercase label + serif title), `ProductCard`, `ShowCard`, `Footer`, plus shop-specific components below.
- Migrate retained legacy components to runes (notably the `Nav` scroll logic). New components are runes-only. Delegate `.svelte` work to the `svelte-file-editor` subagent per project CLAUDE.md.

---

## 4. Site architecture (routes)

Move from hash anchors to real SvelteKit routes under a shared layout (sticky header + new footer).

| Route | Purpose |
|---|---|
| `/` **Home** | Hero → About → Shop teaser → Shows teaser → Instagram feed → footer |
| `/music` | Curated featured embed + **auto-updating SoundCloud profile feed** |
| `/shows` | Full Google Calendar list + previous-events photo gallery |
| `/shop` | Stripe catalog (one card per style) |
| `/shop/[group]` | Product detail page — color/size variant toggle, photo swap, per-variant stock/sold-out, add to cart |
| `/shop/success`, `/shop/cancel` | Post-checkout return pages |
| `/contact` | Booking form (Resend + Turnstile) + Press Kit / EPK downloads |

**Server endpoints**
- `src/routes/shop/checkout/+server.ts` — creates a Stripe Checkout Session.
- `src/routes/api/stripe/webhook/+server.ts` — verifies Stripe events, decrements stock, triggers order email.
- Contact handled by a server action on `/contact` (Resend + Turnstile).

**Navigation:** real page links (MUSIC / SHOWS / SHOP / CONTACT) + centered wordmark + social icons. The animated scroll-logo is replaced by a cleaner sticky wordmark that works across pages. Footer carries booking CTA, explore links, support/tip links, socials.

---

## 5. Shop / Stripe architecture

**Principle:** Stripe is the single source of truth and Missy's admin panel. **No database.**

### 5.1 Product + variant model (storage)
- **One Stripe entry per variant** — e.g. "Trucker — Lavender," "Trucker — Black," "Tour Tee — S/M/L/XL." Each carries its own **photo, price, and `stock`**, plus shared metadata:
  - `group` — clusters variants of one style (e.g. `trucker`).
  - `groupName` — display name ("Classic Trucker").
  - `variant` — label shown in the selector ("Lavender", "M").
  - `variantType` — `color` | `size`.
  - `category` — `hats` | `shirts` (extensible).
  - `stock` — integer stock count.
  - `sort` — optional ordering.
- Rationale: lets a **single size/color be independently sold out** and have its **own image**, all from native Dashboard fields. Styles without variants are simply a `group` with one entry.

### 5.2 Display (decoupled from storage)
- **`/shop`** — storefront fetches all active products server-side and **groups by `group`**, rendering **one card per style** (representative image + price/"from" price).
- **`/shop/[group]`** — detail page with a **variant toggle**: selecting a color/size swaps the photo, shows that variant's **"X left" / Sold out**, and sets the add-to-cart target.
- **Home teaser** — curated; may feature specific variants as individual tiles for visual variety. Links to `/shop`.

### 5.3 Inventory countdown (no database)
- Stock lives in each product's **`stock` metadata**, editable in the Dashboard (restocks, in-person sales).
- The **webhook** (`checkout.session.completed`, line items expanded) subtracts purchased quantities and writes the new `stock` back via the Stripe API.
- Storefront reads `stock` to show "only N left" and disable Sold-out variants.
- **Known limitation:** stock reflects *completed* online sales; it does not *reserve* during checkout. Simultaneous purchase of the last unit could oversell by one — acceptable at merch scale; hardenable later (e.g. a reservation store) if needed. This limitation must be stated, not silently ignored.

### 5.4 Cart + checkout
- **Cart:** lightweight Svelte 5 runes store persisted to `localStorage` (line = Stripe Price ID, variant label, qty, cached name/image/price for display). Cart drawer/badge in header.
- **Checkout:** POST cart line items to `shop/checkout/+server.ts`, which (using `STRIPE_SECRET_KEY`, server-only) creates a **Stripe Checkout Session** with:
  - Shipping address collection.
  - **Shipping options:** flat-rate shipping **+ free local pickup** ($0 rate).
  - `success_url` → `/shop/success`, `cancel_url` → `/shop/cancel`.
- Redirect to Stripe-hosted Checkout. **No card data touches our server.** Server re-reads prices from Stripe (never trusts client-sent amounts).

### 5.5 Order confirmation + fulfillment
- Webhook also triggers a **confirmation email via Resend** (to customer and/or Missy) and Missy fulfills from the Stripe **Orders/Payments** view. Stripe's own receipts can be enabled as a backstop.

---

## 6. Integrations (cleaned up)

| Concern | Today | New design |
|---|---|---|
| **Transactional email** | EmailJS (client-side, keys exposed; convoluted two-step flow) | **Resend**, server-side. One service for **contact form + order confirmations**. Clean single server step. |
| **Spam protection** | Turnstile (partly server-validated) | Turnstile, **fully server-validated**. |
| **Shows** | Google Calendar service-account JWT | Keep (she manages shows where she already does); add **light caching** to avoid per-visit API calls. |
| **Music** | Hardcoded SoundCloud track embeds, manual updates | **SoundCloud profile widget** pointed at `soundcloud.com/missymidwest` → **auto-lists latest uploads, no API keys, no manual updates**, + one optional curated featured embed. |
| **Instagram** | none | **Behold.so** embeddable feed widget on Home. |
| **Tips** | Venmo/Cash App section | Venmo/Cash App links in the footer. |

**SoundCloud note:** the official API stopped accepting new app registrations years ago; unofficial `client_id` scraping violates ToS and is brittle. The profile-widget approach intentionally avoids the API. A fully custom-rendered track grid is explicitly **out of scope** for reliability reasons.

---

## 7. Hosting, runtime, secrets

- **Stays on Netlify**; `adapter-auto` runs the Stripe server endpoints + webhook as functions.
- **Env vars** (server-only unless prefixed `PUBLIC_`):
  - Existing: `MISSY_CALENDAR_CLIENT_EMAIL`, `MISSY_CALENDAR_PRIVATE_KEY`, `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.
  - New: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `ORDER_NOTIFY_EMAIL`, plus the **Behold** feed ID (public).
  - Remove EmailJS vars after migration.
- Validate required secrets at startup; fail fast with a clear message.

---

## 8. Security

- `STRIPE_SECRET_KEY` and `RESEND_API_KEY` server-only; only the publishable key reaches the client.
- **Webhook signature verified** against `STRIPE_WEBHOOK_SECRET`; reject unverified events.
- Checkout server **re-reads prices/availability from Stripe** — never trusts client-sent amounts or stock.
- Turnstile validated server-side before any email send.
- Contact + shipping inputs validated at the server boundary; user-friendly errors, detailed server logs, **no secrets in error messages**.

---

## 9. Error handling

- Stripe/Resend/Calendar calls wrapped with explicit handling; failures degrade gracefully (e.g. calendar error → "dates unavailable," not a crash; checkout error → friendly retry + fallback contact).
- Webhook is idempotent-aware (tolerate duplicate deliveries without double-decrementing where feasible; at minimum, log and stay consistent).
- No silently swallowed errors; surface user-facing messages and log context server-side.

---

## 10. Testing

- **Unit:** variant grouping logic, cart store, stock/price formatting, date formatting (preserve the existing local-date off-by-one fix).
- **Integration:** checkout session creation (mocked Stripe), webhook stock-decrement + signature rejection, contact action (mocked Resend + Turnstile), calendar load.
- **E2E (Playwright):** browse shop → open detail → select variant → add to cart → reach Stripe Checkout (test mode); contact form happy path; nav across pages.
- Target 80%+ coverage on new logic. Use Stripe **test mode** + the Stripe CLI for local webhook testing.

---

## 11. Delivery phases (each its own implementation plan)

1. **Foundation + redesign** — multi-page routing, shared header/footer, design system tokens/components, move & restyle existing sections (Home, Music, Shows, Contact), revive Music (profile widget) & Press Kit, migrate retained components to runes. *Ships a fully redesigned site with no Stripe.*
2. **Shop** — Stripe product/variant model, `/shop` + `/shop/[group]`, cart, checkout endpoint, webhook (stock + order email), success/cancel, Home shop teaser. Switch contact email to **Resend**.
3. **Polish** — Behold Instagram feed, previous-events gallery, motion/animation pass, SEO/meta, performance + image optimization.

> This spec is the overall vision. Phase 1 will be taken into its own implementation plan first; Phases 2–3 get their own spec→plan cycles as we reach them.

---

## 12. Out of scope (v1) / future

- Hard inventory reservation during checkout (only completed-sale decrement in v1).
- Custom-rendered SoundCloud track grid (reliability).
- Discount-code UI on-site (Stripe Checkout can still accept promo codes).
- True inventory auto-decrement for **in-person** sales (manual Dashboard edit).
- Customer accounts / order history (Stripe receipts cover v1).
- CMS for products (Stripe Dashboard is the admin).
