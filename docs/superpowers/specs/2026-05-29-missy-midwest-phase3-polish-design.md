# Missy Midwest — Phase 3: Polish · Design Spec

> Refines section 11.3 (the "Polish" phase) of the approved redesign spec
> (`2026-05-29-missy-midwest-redesign-design.md`) into an implementation-ready
> design. Phase 1 (foundation) and Phase 2 (Stripe shop) are complete and merged
> to the `redesign` trunk. This phase adds SEO/meta, a gallery lightbox, a subtle
> motion pass, an incremental performance pass, and an env-gated Behold.so
> Instagram feed.

## 1. Goal

Ship the final layer of redesign polish: make the site discoverable (SEO/meta +
sitemap + structured data), elevate the previous-events gallery (lightbox),
add tasteful scroll motion that respects reduced-motion, tighten performance,
and wire the Instagram feed so it goes live the moment a Behold feed ID exists.

## 2. Scope

In scope (all four areas, confirmed with the user):

1. **SEO / meta + sitemap** — reusable `Seo` component, Open Graph + Twitter
   cards, canonical URLs, `/sitemap.xml`, JSON-LD, `robots.txt` sitemap line.
2. **Gallery lightbox** — clickable previous-events grid → accessible modal.
3. **Motion pass (subtle)** — reusable scroll-reveal action + hero entrance,
   all gated behind `prefers-reduced-motion`.
4. **Performance / image pass** — preconnect hints, LCP priority, no-CLS
   dimensions, lazy-loading audit.

Plus: **Behold Instagram feed (env-gated)** — live widget when
`PUBLIC_BEHOLD_FEED_ID` is set, today's gradient grid as the fallback.

Out of scope: real Behold content (needs the user's feed ID), a fully
custom-rendered Instagram grid (Behold owns rendering), image re-encoding beyond
the existing `vite-plugin-imagemin`, a dedicated JPG/PNG share image (the
existing `.webp` is used; see §9).

## 3. SEO / meta + sitemap

### `src/lib/seo/Seo.svelte`

A component rendered inside each page's `<svelte:head>`. Props:

```ts
interface SeoProps {
	title: string; // full page title, e.g. "Shop — Missy Midwest"
	description: string; // page-specific meta description
	image?: string; // absolute-or-root-relative OG image path; defaults to the brand image
	type?: 'website' | 'article' | 'profile'; // og:type, default 'website'
	noindex?: boolean; // emit robots noindex for utility pages (default false)
}
```

Behavior:

- Absolute URLs are derived from the **request origin** via `page.url`
  (`$app/state`) — no hardcoded domain, correct on any host (Netlify preview,
  custom domain, localhost). `canonical` = `page.url.origin + page.url.pathname`;
  `og:url` = same; `og:image` = `page.url.origin + image`.
- Emits: `<title>`, `<meta name="description">`, `<link rel="canonical">`,
  Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`,
  `og:site_name`), Twitter (`twitter:card=summary_large_image`,
  `twitter:title`, `twitter:description`, `twitter:image`).
- A small constants module **`src/lib/seo/config.ts`** holds `SITE_NAME`
  (`'Missy Midwest'`), `DEFAULT_OG_IMAGE` (`'/landing/missy-fan-crop.webp'`),
  and `DEFAULT_DESCRIPTION`.

Each route (`/`, `/music`, `/shows`, `/contact`, `/shop`, `/shop/[group]`,
`/shop/success`, `/shop/cancel`) replaces its bare `<title>` with `<Seo … />`,
passing a page-appropriate title + description. The two checkout-result pages
use `noindex`.

### `src/routes/sitemap.xml/+server.ts`

`GET` returns `application/xml`. Lists the static routes plus one entry per shop
group from `catalog.listGroups()` (degrades to just the static routes if Stripe
errs). Absolute URLs from the request `url.origin`. `Content-Type:
application/xml`, cached `max-age=3600`.

### `src/lib/seo/jsonld.ts` + Home

A pure `musicGroupJsonLd(origin: string)` builder returns the `MusicGroup`
schema object (name, url, sameAs socials, image). The Home page renders it as a
`<script type="application/ld+json">` in its head.

### `src/routes/robots.txt/+server.ts` (replaces `static/robots.txt`)

To emit an absolute `Sitemap:` URL without hardcoding the domain, `robots.txt`
becomes a dynamic `GET` route deriving the origin from the request `url`:

```
User-agent: *
Allow: /

Sitemap: <url.origin>/sitemap.xml
```

`Content-Type: text/plain`. The existing `static/robots.txt` is deleted (a route
at the same path would otherwise be shadowed by the static file).

## 4. Gallery lightbox

### `src/lib/components/Lightbox.svelte`

A reusable accessible modal. Props: `photos: { src: string; caption: string }[]`,
`index: number | null` (which photo is open; `null` = closed), `onClose`,
`onNavigate(nextIndex)`. Behavior:

- `role="dialog"`, `aria-modal="true"`, labelled by the caption.
- Esc closes; ←/→ navigate (wrap-around); a backdrop click closes.
- Focus moves to the dialog on open and is trapped; returns to the trigger on
  close.
- Respects `prefers-reduced-motion` (no fade/scale when reduced).

### `src/lib/previous-events/PreviousEvents.svelte` (rewrite)

- Promote the photo list to `{ slug, caption }` with a slug→caption map (e.g.
  `electric-forest` → "Electric Forest"). Captions default to title-cased slug.
- Each thumbnail is a `<button>` that opens the lightbox at its index.
- Holds `open = $state<number | null>(null)`; renders `<Lightbox … />`.

## 5. Motion pass (subtle)

### `src/lib/motion/reveal.ts`

A Svelte action `reveal(node, options?)` using `IntersectionObserver`: when the
node enters the viewport it gains a `data-revealed="true"` attribute (observer
then disconnects — reveal once). CSS in `app.css` transitions
`[data-reveal]` from `opacity:0; translateY(12px)` to revealed. Guarded by:

```css
@media (prefers-reduced-motion: reduce) {
	[data-reveal] {
		opacity: 1;
		transform: none;
		transition: none;
	}
}
```

If `IntersectionObserver` is unavailable (or SSR), the element is visible by
default (progressive enhancement — content is never hidden without JS).

Applied to section headings/cards on Home and Shows (a handful of `use:reveal`
attributes). The hero gets a one-shot CSS entrance animation, same reduced-motion
guard.

## 6. Performance / image pass

Incremental (imagemin already configured):

- **Preconnect** hints in `app.html` for the embed/image hosts actually used:
  Behold (`https://w.behold.so`), SoundCloud (`https://w.soundcloud.com`), and
  Stripe product images (`https://files.stripe.com`). Fonts are self-hosted /
  bundled (`@font-face` + `@fontsource/fira-mono`) — no font-CDN preconnect
  needed.
- **LCP priority** for the hero image (`fetchpriority="high"` if `<img>`, or a
  `<link rel="preload">` if it's a CSS background).
- **No-CLS**: confirm gallery/teaser images carry an intrinsic aspect (the grid
  is already `aspect-square`); add `width`/`height` or aspect where missing.
- **Lazy-loading** audit: below-fold images `loading="lazy"`; the hero stays
  eager.

No image re-encoding or new build tooling.

## 7. Behold Instagram feed (env-gated)

`src/lib/home/InstagramFeed.svelte`:

- Reads `PUBLIC_BEHOLD_FEED_ID` via `$env/dynamic/public` (runtime; absent in dev
  until provisioned — no build break, consistent with the Phase 2c env pattern).
- When set: load the Behold widget script
  (`<script type="module" src="https://w.behold.so/widget.js">`, injected once)
  and render `<behold-widget feed-id={id}></behold-widget>` inside the existing
  section shell (heading + "Follow →" button preserved).
- When unset: render today's gradient-grid placeholder unchanged.

`.env.example` gains a commented `PUBLIC_BEHOLD_FEED_ID=` with a note.

## 8. File structure

**Create:**

- `src/lib/seo/config.ts` — site constants.
- `src/lib/seo/Seo.svelte` — head meta component.
- `src/lib/seo/jsonld.ts` — pure JSON-LD builder.
- `src/lib/seo/jsonld.test.ts` — builder unit test.
- `src/routes/sitemap.xml/+server.ts` — sitemap route.
- `src/routes/sitemap.xml/server.test.ts` — route test (mocked catalog).
- `src/routes/robots.txt/+server.ts` — dynamic robots (origin-derived sitemap line).
- `src/lib/components/Lightbox.svelte` — modal.
- `src/lib/components/Lightbox.test.ts` — component test.
- `src/lib/motion/reveal.ts` — IntersectionObserver action.

**Modify:**

- All page routes — swap `<title>` for `<Seo />`.
- `src/lib/previous-events/PreviousEvents.svelte` — lightbox integration.
- `src/lib/home/InstagramFeed.svelte` — env-gated Behold widget.
- `src/routes/+page.svelte` — JSON-LD + `use:reveal`.
- `src/lib/landing/Hero.svelte` — entrance animation + LCP priority.
- `src/app.html` — preconnect hints.
- `src/app.css` — reveal/hero motion CSS + reduced-motion guards.
- `.env.example` — `PUBLIC_BEHOLD_FEED_ID`.

**Delete:**

- `static/robots.txt` — replaced by the dynamic route.

## 9. Environment & security

- `PUBLIC_BEHOLD_FEED_ID` — **public** (client-visible by design; Behold feed IDs
  are public). Read via `$env/dynamic/public`.
- The Behold widget loads third-party script from `w.behold.so` only when the ID
  is set — no third-party code runs otherwise.
- No new secrets. No server trust boundaries added (sitemap reads the existing
  catalog; SEO is render-only).
- **Known limitation:** the default OG image is a `.webp`
  (`/landing/missy-fan-crop.webp`). Modern scrapers (X, Slack, Discord,
  iMessage, LinkedIn, Facebook) handle WebP; a dedicated 1200×630 JPG can be
  added later if any target renderer misbehaves. Tracked as a go-live nicety,
  not a blocker.

## 10. Testing (target 80%+ on new testable logic)

- **Unit:** `musicGroupJsonLd` (shape/fields); `sitemap.xml` route (mocked
  `catalog.listGroups` → contains static routes + group URLs; degrades on error);
  `Lightbox` component (opens at index, Esc/`onClose`, ←/→ navigation wraps).
- **E2E (Playwright):** `/sitemap.xml` returns 200 + contains `<urlset>` and the
  shop URL; previous-events thumbnail opens the lightbox and Esc closes it.
- **Manual:** motion feel + reduced-motion (OS setting); Lighthouse pass for
  LCP/CLS; share-preview (paste a URL into Slack/X) once deployed; Behold widget
  render once a real feed ID is set.

## 11. Go-live checklist additions

1. Create a free **Behold.so** account, connect Instagram, create a feed, copy
   the **feed ID**; set `PUBLIC_BEHOLD_FEED_ID` in `.env` (dev) and Netlify (prod).
2. After deploy, validate share previews (X/Slack/iMessage) and submit
   `/sitemap.xml` in Google Search Console.
3. (Optional) add a dedicated 1200×630 JPG share image and point
   `DEFAULT_OG_IMAGE` at it.

## 12. Delivery

One branch `phase3-polish` off `redesign`, committed per area, merged back to
`redesign` at the end. This completes the redesign; `redesign` → `main` happens
at go-live.
