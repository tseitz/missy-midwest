# Phase 3 — Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Svelte files:** every `.svelte` / `.svelte.ts` file MUST be created/edited via the `svelte-file-editor` subagent and validated with `svelte-autofixer` (per CLAUDE.md). Plain `.ts`/`.css`/`.html` files are edited directly.
>
> **Branch:** all work happens on `phase3-polish`, branched from `redesign` (NOT `main`). Merge back to `redesign` at the end via superpowers:finishing-a-development-branch.

**Goal:** Ship the final redesign polish — SEO/meta + sitemap + structured data, an accessible previous-events lightbox, a subtle reduced-motion-aware scroll/hero motion pass, an incremental performance pass, and an env-gated Behold.so Instagram feed.

**Architecture:** A reusable `Seo` head component + pure JSON-LD/sitemap builders derive absolute URLs from the request origin (no hardcoded domain). A reusable accessible `Lightbox` powers the gallery. A small `reveal` IntersectionObserver action plus CSS (guarded by `prefers-reduced-motion`) drives motion. The Instagram feed reads `PUBLIC_BEHOLD_FEED_ID` at runtime and renders the Behold web component when present, else the existing placeholder grid.

**Tech Stack:** SvelteKit 2 + Svelte 5 runes, Tailwind v4, Vitest 3 + @testing-library/svelte, Playwright.

**Spec:** `docs/superpowers/specs/2026-05-29-missy-midwest-phase3-polish-design.md`.

**Builds on:** `src/lib/server/catalog.ts` (`listGroups`), `src/lib/components/SocialLinks.svelte` (social URLs), `src/lib/landing/Hero.svelte` (CSS-bg LCP image), the existing route `<title>` tags.

---

## File Structure

**Create:** `src/lib/seo/config.ts`, `src/lib/seo/jsonld.ts` (+test), `src/lib/seo/Seo.svelte`, `src/routes/sitemap.xml/+server.ts` (+`server.test.ts`), `src/routes/robots.txt/+server.ts`, `src/lib/components/Lightbox.svelte` (+test), `src/lib/motion/reveal.ts`.

**Modify:** all page routes (`<title>` → `<Seo>`), `src/routes/+page.svelte` (JSON-LD + reveal), `src/lib/previous-events/PreviousEvents.svelte`, `src/lib/home/InstagramFeed.svelte`, `src/lib/landing/Hero.svelte`, the Home section components (reveal), `src/app.html`, `src/app.css`, `.env.example`, `e2e/smoke.spec.ts`.

**Delete:** `static/robots.txt` (replaced by the route).

**Note on test filenames:** server route tests are `server.test.ts`; do NOT put `.svelte.` in a test filename.

---

## Task 1: SEO config + JSON-LD builder — TDD

**Files:**

- Create: `src/lib/seo/config.ts`
- Create: `src/lib/seo/jsonld.test.ts`
- Create: `src/lib/seo/jsonld.ts`

- [ ] **Step 1: Create the config constants**

`src/lib/seo/config.ts`:

```ts
export const SITE_NAME = 'Missy Midwest';
export const DEFAULT_DESCRIPTION =
	'Missy Midwest — open-format DJ, vocalist & producer. Music, shows, merch & booking.';
export const DEFAULT_OG_IMAGE = '/landing/missy-fan-crop.webp';

/** Public social profile URLs — used for JSON-LD `sameAs`. Mirror of SocialLinks.svelte. */
export const SOCIAL_URLS = [
	'https://soundcloud.com/missymidwest',
	'https://www.instagram.com/missy.midwest/',
	'https://www.tiktok.com/@missy.midwestofficial',
	'https://www.twitch.tv/missymidwest',
	'https://www.facebook.com/MissyMidwest/',
	'https://www.youtube.com/channel/UCG4fK0SGXZpW6FJfGblgIqg'
];
```

- [ ] **Step 2: Write the failing test**

`src/lib/seo/jsonld.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { musicGroupJsonLd } from './jsonld';

describe('musicGroupJsonLd', () => {
	it('builds a MusicGroup schema with absolute url + image and social sameAs', () => {
		const ld = musicGroupJsonLd('https://missymidwest.com');
		expect(ld['@type']).toBe('MusicGroup');
		expect(ld.name).toBe('Missy Midwest');
		expect(ld.url).toBe('https://missymidwest.com');
		expect(ld.image).toBe('https://missymidwest.com/landing/missy-fan-crop.webp');
		expect(ld.sameAs).toContain('https://www.instagram.com/missy.midwest/');
		expect(ld.sameAs.length).toBeGreaterThanOrEqual(5);
	});
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/seo/jsonld.test.ts`
Expected: FAIL — cannot find `./jsonld`.

- [ ] **Step 4: Implement `jsonld.ts`**

```ts
import { SITE_NAME, DEFAULT_OG_IMAGE, SOCIAL_URLS } from './config';

export interface MusicGroupJsonLd {
	'@context': 'https://schema.org';
	'@type': 'MusicGroup';
	name: string;
	url: string;
	image: string;
	sameAs: string[];
}

/** Build the MusicGroup structured-data object for the given site origin. */
export function musicGroupJsonLd(origin: string): MusicGroupJsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'MusicGroup',
		name: SITE_NAME,
		url: origin,
		image: `${origin}${DEFAULT_OG_IMAGE}`,
		sameAs: SOCIAL_URLS
	};
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/seo/jsonld.test.ts`
Expected: PASS (1 test).

- [ ] **Step 6: Commit**

```bash
git add src/lib/seo/config.ts src/lib/seo/jsonld.ts src/lib/seo/jsonld.test.ts
git commit -m "feat(seo): add site config and MusicGroup json-ld builder"
```

---

## Task 2: Seo head component

**Files:**

- Create: `src/lib/seo/Seo.svelte` (use the `svelte-file-editor` subagent)

- [ ] **Step 1: Create `Seo.svelte`**

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import { SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE } from '$lib/seo/config';

	interface Props {
		title: string;
		description?: string;
		image?: string;
		type?: 'website' | 'article' | 'profile';
		noindex?: boolean;
	}
	let {
		title,
		description = DEFAULT_DESCRIPTION,
		image = DEFAULT_OG_IMAGE,
		type = 'website',
		noindex = false
	}: Props = $props();

	const origin = $derived(page.url.origin);
	const canonical = $derived(origin + page.url.pathname);
	// `image` may be root-relative (our assets) or already absolute (Stripe product URLs).
	const ogImage = $derived(image.startsWith('http') ? image : origin + image);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#if noindex}
		<meta name="robots" content="noindex" />
	{/if}
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/seo/Seo.svelte
git commit -m "feat(seo): add reusable Seo head component"
```

---

## Task 3: Apply `<Seo>` to all routes + Home JSON-LD

**Files (all via the `svelte-file-editor` subagent):**

- Modify: `src/routes/+page.svelte`, `src/routes/music/+page.svelte`, `src/routes/shows/+page.svelte`, `src/routes/contact/+page.svelte`, `src/routes/shop/+page.svelte`, `src/routes/shop/[group]/+page.svelte`, `src/routes/shop/success/+page.svelte`, `src/routes/shop/cancel/+page.svelte`

For each page: add `import Seo from '$lib/seo/Seo.svelte';` to the `<script>` and replace the existing `<svelte:head><title>…</title></svelte:head>` with a `<Seo … />` tag. Exact replacements:

- [ ] **Step 1: Home** — `src/routes/+page.svelte`. Add imports `import Seo from '$lib/seo/Seo.svelte';`, `import { page } from '$app/state';`, `import { musicGroupJsonLd } from '$lib/seo/jsonld';`, and `const jsonld = $derived(JSON.stringify(musicGroupJsonLd(page.url.origin)));`. Replace the `<svelte:head>` block with:

```svelte
<Seo
	title="Missy Midwest — DJ · Vocalist · Producer"
	description="Open-format DJ, vocalist & producer — genre-blending energy from the Heart of IL to festival stages beyond."
/>
<svelte:head>
	{@html `<script type="application/ld+json">${jsonld}</` + `script>`}
</svelte:head>
```

- [ ] **Step 2: Music** — `src/routes/music/+page.svelte`, replace head with:

```svelte
<Seo
	title="Music — Missy Midwest"
	description="Stream Missy Midwest's latest DJ sets and tracks."
/>
```

- [ ] **Step 3: Shows** — `src/routes/shows/+page.svelte`:

```svelte
<Seo
	title="Shows — Missy Midwest"
	description="Upcoming Missy Midwest shows and highlights from past festival sets."
/>
```

- [ ] **Step 4: Contact** — `src/routes/contact/+page.svelte`:

```svelte
<Seo
	title="Contact & Booking — Missy Midwest"
	description="Book Missy Midwest for festivals, residencies, workshops, and events."
/>
```

- [ ] **Step 5: Shop index** — `src/routes/shop/+page.svelte`:

```svelte
<Seo
	title="Shop — Missy Midwest"
	description="Official Missy Midwest merch — hats, tees, and more."
/>
```

- [ ] **Step 6: Shop group** — `src/routes/shop/[group]/+page.svelte` (dynamic, uses the product image):

```svelte
<Seo
	title={`${data.group.name} — Missy Midwest`}
	description={data.group.description || `Shop the ${data.group.name} from Missy Midwest.`}
	image={data.group.image}
/>
```

- [ ] **Step 7: Success + Cancel** (noindex) — `src/routes/shop/success/+page.svelte`:

```svelte
<Seo title="Order confirmed — Missy Midwest" noindex />
```

`src/routes/shop/cancel/+page.svelte`:

```svelte
<Seo title="Checkout cancelled — Missy Midwest" noindex />
```

- [ ] **Step 8: Typecheck**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 9: Commit**

```bash
git add "src/routes/**/+page.svelte"
git commit -m "feat(seo): apply Seo meta to all routes and json-ld on home"
```

---

## Task 4: sitemap.xml + robots.txt routes — TDD

**Files:**

- Create: `src/routes/sitemap.xml/server.test.ts`
- Create: `src/routes/sitemap.xml/+server.ts`
- Create: `src/routes/robots.txt/+server.ts`
- Delete: `static/robots.txt`

- [ ] **Step 1: Write the failing sitemap test**

`src/routes/sitemap.xml/server.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { listGroupsMock } = vi.hoisted(() => ({ listGroupsMock: vi.fn() }));
vi.mock('$lib/server/catalog', () => ({ listGroups: listGroupsMock }));

import { GET } from './+server';

function event() {
	return {
		url: new URL('https://missymidwest.com/sitemap.xml')
	} as unknown as Parameters<typeof GET>[0];
}

beforeEach(() => listGroupsMock.mockReset());

describe('GET /sitemap.xml', () => {
	it('lists static routes and shop group urls', async () => {
		listGroupsMock.mockResolvedValue({
			groups: [{ slug: 'classic-trucker' }, { slug: 'tour-tee' }]
		});
		const res = await GET(event());
		expect(res.status).toBe(200);
		expect(res.headers.get('content-type')).toContain('application/xml');
		const body = await res.text();
		expect(body).toContain('<loc>https://missymidwest.com/</loc>');
		expect(body).toContain('<loc>https://missymidwest.com/shop</loc>');
		expect(body).toContain('<loc>https://missymidwest.com/shop/classic-trucker</loc>');
		expect(body).toContain('<loc>https://missymidwest.com/shop/tour-tee</loc>');
	});

	it('degrades to static routes when the catalog errors', async () => {
		listGroupsMock.mockResolvedValue({ groups: [], error: 'stripe down' });
		const res = await GET(event());
		const body = await res.text();
		expect(body).toContain('<loc>https://missymidwest.com/</loc>');
		expect(body).not.toContain('/shop/');
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/routes/sitemap.xml/server.test.ts`
Expected: FAIL — cannot find `./+server`.

- [ ] **Step 3: Implement the sitemap route**

`src/routes/sitemap.xml/+server.ts`:

```ts
import { listGroups } from '$lib/server/catalog';
import type { RequestHandler } from './$types';

const STATIC_PATHS = ['/', '/music', '/shows', '/contact', '/shop'];

export const GET: RequestHandler = async ({ url }) => {
	const { groups } = await listGroups();
	const paths = [...STATIC_PATHS, ...groups.map((group) => `/shop/${group.slug}`)];
	const entries = paths.map((path) => `\t<url><loc>${url.origin}${path}</loc></url>`).join('\n');
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
	return new Response(body, {
		headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'max-age=3600' }
	});
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/routes/sitemap.xml/server.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Implement the robots route + delete the static file**

`src/routes/robots.txt/+server.ts`:

```ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const body = `User-agent: *\nAllow: /\n\nSitemap: ${url.origin}/sitemap.xml\n`;
	return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
```

Run: `git rm static/robots.txt`

- [ ] **Step 6: Typecheck + commit**

Run: `npm run check`
Expected: 0 errors.

```bash
git add src/routes/sitemap.xml/+server.ts src/routes/sitemap.xml/server.test.ts src/routes/robots.txt/+server.ts static/robots.txt
git commit -m "feat(seo): add dynamic sitemap.xml and robots.txt routes"
```

---

## Task 5: Lightbox component — TDD

**Files:**

- Create: `src/lib/components/Lightbox.test.ts`
- Create: `src/lib/components/Lightbox.svelte` (use the `svelte-file-editor` subagent)

- [ ] **Step 1: Write the failing test**

`src/lib/components/Lightbox.test.ts`:

```ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Lightbox from './Lightbox.svelte';

const photos = [
	{ src: '/a.webp', caption: 'Electric Forest' },
	{ src: '/b.webp', caption: 'Camp Taco' }
];

describe('Lightbox', () => {
	it('renders nothing when index is null', () => {
		render(Lightbox, { props: { photos, index: null, onClose: () => {}, onNavigate: () => {} } });
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('shows the photo and caption at the open index', () => {
		render(Lightbox, { props: { photos, index: 0, onClose: () => {}, onNavigate: () => {} } });
		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByText('Electric Forest')).toBeInTheDocument();
		expect(screen.getByRole('img')).toHaveAttribute('src', '/a.webp');
	});

	it('calls onClose when the close button is clicked', async () => {
		const onClose = vi.fn();
		render(Lightbox, { props: { photos, index: 0, onClose, onNavigate: () => {} } });
		await screen.getByRole('button', { name: /close/i }).click();
		expect(onClose).toHaveBeenCalled();
	});

	it('navigates to the next photo, wrapping from the last to the first', async () => {
		const onNavigate = vi.fn();
		render(Lightbox, { props: { photos, index: 1, onClose: () => {}, onNavigate } });
		await screen.getByRole('button', { name: /next/i }).click();
		expect(onNavigate).toHaveBeenCalledWith(0);
	});

	it('navigates to the previous photo, wrapping from the first to the last', async () => {
		const onNavigate = vi.fn();
		render(Lightbox, { props: { photos, index: 0, onClose: () => {}, onNavigate } });
		await screen.getByRole('button', { name: /previous/i }).click();
		expect(onNavigate).toHaveBeenCalledWith(1);
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/components/Lightbox.test.ts`
Expected: FAIL — cannot find `./Lightbox.svelte`.

- [ ] **Step 3: Implement `Lightbox.svelte`**

```svelte
<script lang="ts">
	export interface LightboxPhoto {
		src: string;
		caption: string;
	}

	interface Props {
		photos: LightboxPhoto[];
		index: number | null;
		onClose: () => void;
		onNavigate: (nextIndex: number) => void;
	}
	let { photos, index, onClose, onNavigate }: Props = $props();

	let dialogEl = $state<HTMLDivElement>();
	const current = $derived(index === null ? null : photos[index]);

	function prev() {
		if (index === null) return;
		onNavigate((index - 1 + photos.length) % photos.length);
	}
	function next() {
		if (index === null) return;
		onNavigate((index + 1) % photos.length);
	}
	function onKeydown(event: KeyboardEvent) {
		if (index === null) return;
		if (event.key === 'Escape') return onClose();
		if (event.key === 'ArrowLeft') return prev();
		if (event.key === 'ArrowRight') return next();
		if (event.key === 'Tab' && dialogEl) {
			const focusable = dialogEl.querySelectorAll<HTMLButtonElement>('button');
			if (focusable.length === 0) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}
	}

	$effect(() => {
		if (current) dialogEl?.focus();
	});
</script>

<svelte:window onkeydown={onKeydown} />

{#if current}
	<div
		bind:this={dialogEl}
		role="dialog"
		aria-modal="true"
		aria-label={current.caption}
		tabindex="-1"
		class="lightbox fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 outline-none"
	>
		<button
			type="button"
			aria-label="Dismiss"
			class="absolute inset-0 h-full w-full cursor-default"
			onclick={onClose}
		></button>
		<div class="relative z-10 flex max-h-full max-w-3xl flex-col items-center">
			<img src={current.src} alt={current.caption} class="max-h-[80vh] w-auto rounded-lg" />
			<p class="text-missy-classic-lavender mt-3 text-center text-sm">{current.caption}</p>
		</div>
		<button
			type="button"
			aria-label="Previous"
			onclick={prev}
			class="absolute left-3 z-20 px-3 text-4xl text-white/80 hover:text-white">‹</button
		>
		<button
			type="button"
			aria-label="Next"
			onclick={next}
			class="absolute right-3 z-20 px-3 text-4xl text-white/80 hover:text-white">›</button
		>
		<button
			type="button"
			aria-label="Close"
			onclick={onClose}
			class="absolute top-4 right-4 z-20 text-2xl text-white/80 hover:text-white">✕</button
		>
	</div>
{/if}

<style>
	@media (prefers-reduced-motion: no-preference) {
		.lightbox {
			animation: lightbox-in 0.2s ease-out;
		}
		@keyframes lightbox-in {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}
	}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/components/Lightbox.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/Lightbox.svelte src/lib/components/Lightbox.test.ts
git commit -m "feat(gallery): add accessible lightbox component"
```

---

## Task 6: Previous-events gallery → lightbox

**Files:**

- Modify: `src/lib/previous-events/PreviousEvents.svelte` (use the `svelte-file-editor` subagent)

- [ ] **Step 1: Rewrite `PreviousEvents.svelte`**

```svelte
<script lang="ts">
	import Lightbox from '$lib/components/Lightbox.svelte';

	const events = [
		{ slug: 'electric-forest', caption: 'Electric Forest' },
		{ slug: 'backwoods-2023', caption: 'Backwoods 2023' },
		{ slug: 'camp-taco', caption: 'Camp Taco' },
		{ slug: 'united-groove', caption: 'United Groove' },
		{ slug: 'her-set-her-sound', caption: 'Her Set Her Sound' },
		{ slug: 'paradise', caption: 'Paradise' },
		{ slug: 'neon-taco', caption: 'Neon Taco' },
		{ slug: 'tuckers-shuckers', caption: "Tucker's Shuckers" }
	];
	const photos = events.map((event) => ({
		src: `/archive/gig-photos/${event.slug}.webp`,
		caption: event.caption
	}));

	let open = $state<number | null>(null);
</script>

<section class="w-full max-w-screen-2xl px-8 py-16 md:px-14">
	<h3 class="missy-header mb-6 text-2xl">Previous events</h3>
	<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
		{#each photos as photo, i (photo.src)}
			<button
				type="button"
				aria-label={`View ${photo.caption}`}
				onclick={() => (open = i)}
				class="group block overflow-hidden rounded-lg"
			>
				<img
					src={photo.src}
					alt={`Missy Midwest live — ${photo.caption}`}
					loading="lazy"
					class="aspect-square w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
				/>
			</button>
		{/each}
	</div>
</section>

<Lightbox
	{photos}
	index={open}
	onClose={() => (open = null)}
	onNavigate={(next) => (open = next)}
/>
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/previous-events/PreviousEvents.svelte
git commit -m "feat(gallery): open previous-events photos in a lightbox"
```

---

## Task 7: Motion pass — reveal action + CSS + hero entrance

**Files:**

- Create: `src/lib/motion/reveal.ts`
- Modify: `src/app.css`
- Modify: `src/lib/landing/Hero.svelte`, `src/lib/bio/Bio.svelte`, `src/lib/home/ShopTeaser.svelte`, `src/lib/home/ShowsTeaser.svelte`, `src/lib/home/InstagramFeed.svelte` (all via the `svelte-file-editor` subagent)

- [ ] **Step 1: Create the reveal action**

`src/lib/motion/reveal.ts`:

```ts
import type { Action } from 'svelte/action';

/**
 * Reveal-on-scroll: marks the node with `data-reveal`, then sets `data-revealed="true"`
 * once it scrolls into view (and stops observing). CSS animates the transition; a
 * `prefers-reduced-motion` guard makes it a no-op for users who opt out. If
 * IntersectionObserver is unavailable, the node is revealed immediately (no hidden content).
 */
export const reveal: Action = (node) => {
	node.setAttribute('data-reveal', '');
	if (typeof IntersectionObserver === 'undefined') {
		node.setAttribute('data-revealed', 'true');
		return;
	}
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.setAttribute('data-revealed', 'true');
					observer.disconnect();
				}
			}
		},
		{ rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
	);
	observer.observe(node);
	return { destroy: () => observer.disconnect() };
};
```

- [ ] **Step 2: Add the motion CSS**

Append to `src/app.css`:

```css
[data-reveal] {
	opacity: 0;
	transform: translateY(12px);
	transition:
		opacity 0.6s ease-out,
		transform 0.6s ease-out;
}
[data-reveal][data-revealed='true'] {
	opacity: 1;
	transform: none;
}

@keyframes hero-rise {
	from {
		opacity: 0;
		transform: translateY(16px);
	}
	to {
		opacity: 1;
		transform: none;
	}
}
.hero-rise {
	animation: hero-rise 0.8s ease-out both;
}

@media (prefers-reduced-motion: reduce) {
	[data-reveal],
	[data-reveal][data-revealed='true'] {
		opacity: 1;
		transform: none;
		transition: none;
	}
	.hero-rise {
		animation: none;
	}
}
```

- [ ] **Step 3: Hero entrance** — `src/lib/landing/Hero.svelte`: add `class="… hero-rise"` to the inner content `<div class="relative z-10 …">` (the block holding the eyebrow/h1/buttons). No other change.

- [ ] **Step 4: Apply `use:reveal` to the home section components**

In each of `src/lib/bio/Bio.svelte`, `src/lib/home/ShopTeaser.svelte`, `src/lib/home/ShowsTeaser.svelte`, `src/lib/home/InstagramFeed.svelte`: add `import { reveal } from '$lib/motion/reveal';` to the `<script>`, and add `use:reveal` to that component's top-level `<section …>` element. (If a component renders nothing when empty — e.g. ShopTeaser hidden with no products — keep the existing guard; only add `use:reveal` to the rendered `<section>`.)

> Note: Task 9 rewrites `InstagramFeed.svelte` for Behold. Apply `use:reveal` to its `<section>` in whichever task runs second so it isn't lost — if Task 9 already ran, add `use:reveal` there; otherwise it carries over because Task 9's section keeps the attribute.

- [ ] **Step 5: Typecheck + build**

Run: `npm run check && npm run build`
Expected: svelte-check 0/0; build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/lib/motion/reveal.ts src/app.css src/lib/landing/Hero.svelte src/lib/bio/Bio.svelte src/lib/home/ShopTeaser.svelte src/lib/home/ShowsTeaser.svelte src/lib/home/InstagramFeed.svelte
git commit -m "feat(motion): add reduced-motion-aware scroll reveal and hero entrance"
```

---

## Task 8: Performance / image pass

**Files:**

- Modify: `src/app.html`

- [ ] **Step 1: Add preconnect + LCP preload to `<head>`**

In `src/app.html`, add these lines inside `<head>` (after the existing `<meta name="viewport" …>` and before `%sveltekit.head%`):

```html
<link rel="preconnect" href="https://w.behold.so" />
<link rel="preconnect" href="https://w.soundcloud.com" />
<link rel="preconnect" href="https://files.stripe.com" />
<link
	rel="preload"
	as="image"
	href="%sveltekit.assets%/landing/missy-fan-crop.webp"
	fetchpriority="high"
/>
```

(The hero LCP image is a CSS background, so it gets a `preload` rather than `fetchpriority` on an `<img>`. Below-fold gallery/teaser images already use `loading="lazy"` and `aspect-square` — no CLS work needed.)

- [ ] **Step 2: Build to confirm the asset path resolves**

Run: `npm run build`
Expected: build succeeds, no warnings about the preloaded asset.

- [ ] **Step 3: Commit**

```bash
git add src/app.html
git commit -m "perf: preconnect to embed/image hosts and preload the hero LCP image"
```

---

## Task 9: Behold-gated Instagram feed

**Files:**

- Modify: `src/lib/home/InstagramFeed.svelte` (use the `svelte-file-editor` subagent)
- Modify: `.env.example`

- [ ] **Step 1: Rewrite `InstagramFeed.svelte`**

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { reveal } from '$lib/motion/reveal';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';

	const feedId = env.PUBLIC_BEHOLD_FEED_ID;
	const tiles = Array.from({ length: 6 }, (_, i) => i);

	onMount(() => {
		if (!feedId) return;
		const src = 'https://w.behold.so/widget.js';
		if (document.querySelector(`script[src="${src}"]`)) return;
		const script = document.createElement('script');
		script.type = 'module';
		script.src = src;
		document.head.appendChild(script);
	});
</script>

<section use:reveal class="w-full max-w-screen-2xl px-8 py-16 md:px-14">
	<div class="flex items-end justify-between">
		<SectionHeading label="@missy.midwest" title="From the feed" />
		<Button href="https://www.instagram.com/missy.midwest/" label="Follow →" variant="outline" />
	</div>
	{#if feedId}
		<div class="mt-2">
			<behold-widget feed-id={feedId}></behold-widget>
		</div>
	{:else}
		<div class="mt-2 grid grid-cols-3 gap-2.5 md:grid-cols-6">
			{#each tiles as i (i)}
				<div
					class="from-missy-neon-lavender to-missy-magenta aspect-square rounded-lg bg-gradient-to-br opacity-80"
				></div>
			{/each}
		</div>
	{/if}
</section>
```

> If `svelte-check` flags `<behold-widget>` as an unknown element, that is expected for custom elements and is not an error; if it flags the `feed-id` attribute, keep it — Behold's web component reads the hyphenated attribute. The autofixer will confirm the component is otherwise clean.

- [ ] **Step 2: Add the env var to `.env.example`**

Under the `# --- Client-side …` section of `.env.example`, add:

```
# Behold.so Instagram feed ID (public). Create a free feed at behold.so; when set, the
# Home page renders the live widget instead of the placeholder grid.
PUBLIC_BEHOLD_FEED_ID=
```

- [ ] **Step 3: Typecheck + build**

Run: `npm run check && npm run build`
Expected: svelte-check 0/0 (custom-element note aside); build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/home/InstagramFeed.svelte .env.example
git commit -m "feat(home): env-gated Behold instagram feed with placeholder fallback"
```

---

## Task 10: E2E smoke + full verification

**Files:**

- Modify: `e2e/smoke.spec.ts`

- [ ] **Step 1: Add sitemap + lightbox smokes**

Append to `e2e/smoke.spec.ts`:

```ts
test('sitemap.xml is served and lists routes', async ({ request }) => {
	const res = await request.get('/sitemap.xml');
	expect(res.status()).toBe(200);
	const body = await res.text();
	expect(body).toContain('<urlset');
	expect(body).toContain('/shop');
});

test('robots.txt points at the sitemap', async ({ request }) => {
	const res = await request.get('/robots.txt');
	expect(res.status()).toBe(200);
	expect(await res.text()).toContain('Sitemap:');
});

test('previous-events lightbox opens and closes', async ({ page }) => {
	await page.goto('/shows');
	await page.getByRole('button', { name: /view electric forest/i }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).toHaveCount(0);
});
```

- [ ] **Step 2: Full unit suite**

Run: `npm test`
Expected: PASS — all prior tests plus the json-ld, sitemap, and lightbox suites.

- [ ] **Step 3: Coverage check on new logic**

Run: `npm run test:coverage`
Expected: `src/lib/seo/jsonld.ts` and `src/routes/sitemap.xml/+server.ts` at 80%+ line coverage.

- [ ] **Step 4: Typecheck, lint, build**

Run: `npm run check && npm run lint && npm run build`
Expected: svelte-check 0/0; prettier + eslint clean; build succeeds.

- [ ] **Step 5: E2E smoke (sandbox disabled — Chromium can't launch sandboxed)**

Run: `npm run test:e2e`
Expected: all smoke tests pass (home, shop, cart drawer, contact, sitemap, robots, lightbox).

- [ ] **Step 6: Commit**

```bash
git add e2e/smoke.spec.ts
git commit -m "test(polish): add sitemap, robots, and lightbox e2e smokes"
```

---

## Manual verification

- **Share previews:** after deploy, paste a page URL into Slack/X/iMessage — confirm the title, description, and image card render. (Default OG image is `.webp`; if any scraper misbehaves, add a 1200×630 JPG and repoint `DEFAULT_OG_IMAGE`.)
- **Motion + reduced-motion:** scroll Home/Shows; sections fade/slide in once. Enable the OS "Reduce motion" setting and reload — content appears with no movement.
- **Lightbox a11y:** open a gallery photo; Tab cycles within the dialog; ←/→ navigate; Esc closes and focus returns to the thumbnail.
- **Behold:** set `PUBLIC_BEHOLD_FEED_ID` in `.env`, reload Home — the live widget replaces the gradient grid.
- **Lighthouse:** run a mobile Lighthouse pass on Home; confirm LCP uses the preloaded hero image and CLS is ~0.

---

## Completion

After all tasks pass verification, use **superpowers:finishing-a-development-branch** to merge `phase3-polish` into `redesign`. That completes the redesign — the `redesign` → `main` go-live merge (and the go-live checklists in the Phase 2 + Phase 3 specs) is the only remaining step.

---

## Self-Review (completed against the Phase 3 spec)

**Spec coverage:** §3 SEO — `config.ts` + `Seo.svelte` (Tasks 1–2), applied to all routes + Home JSON-LD (Task 3), `sitemap.xml` + dynamic `robots.txt` (Task 4). §4 Gallery — `Lightbox.svelte` (Task 5), `PreviousEvents` rewrite (Task 6). §5 Motion — `reveal.ts` + CSS + reduced-motion guard + hero entrance + section reveals (Task 7). §6 Performance — preconnect + hero preload (Task 8). §7 Behold — env-gated feed (Task 9). §10 Testing — jsonld + sitemap + lightbox unit tests (Tasks 1, 4, 5); sitemap/robots/lightbox E2E (Task 10).

**Placeholder scan:** every code step is complete; no TBD/"handle errors"/"similar to". The `InstagramFeed` reveal note in Task 7 cross-references Task 9 explicitly rather than leaving it vague.

**Type consistency:** `LightboxPhoto { src, caption }` (Task 5) matches the `photos` array built in `PreviousEvents` (Task 6) and the `Lightbox` props. `musicGroupJsonLd(origin)` (Task 1) matches its Home call site (Task 3). `SOCIAL_URLS`/`DEFAULT_OG_IMAGE`/`SITE_NAME` from `config.ts` (Task 1) are consumed by `jsonld.ts` (Task 1) and `Seo.svelte` (Task 2). `PUBLIC_BEHOLD_FEED_ID` via `$env/dynamic/public` (Task 9) matches the spec's env decision.

**Intentional decisions:** the Home `{@html}` JSON-LD splits the closing `</script>` string to avoid prematurely terminating the Svelte `<script>` block — a standard SvelteKit JSON-LD idiom. `reveal` is progressive-enhancement (visible without JS / under reduced-motion). The hero LCP image is preloaded (CSS background, so no `<img fetchpriority>`). The default OG image stays `.webp` per the spec's documented limitation.

```

```
