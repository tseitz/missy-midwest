# Phase 1 — Foundation + Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Project rule:** All `.svelte` and `.svelte.ts` files MUST be authored/edited via the `svelte-file-editor` subagent, which validates with `svelte-autofixer` before returning (see repo `CLAUDE.md`). When a task creates a component, hand the provided markup to that subagent and incorporate its corrected output.

**Goal:** Convert the single-page site into a redesigned, multi-page SvelteKit app (Home, Music, Shows, Shop-placeholder, Contact) with a reusable design system, shared header/footer, an auto-updating SoundCloud feed, and a test toolchain — all current features preserved. No Stripe yet.

**Architecture:** SvelteKit file-based routes under one `+layout.svelte` (sticky `Header` + new `Footer`). Pure logic (dates, calendar fetch/cache) lives in `$lib` modules with unit tests. Presentational components live in `$lib/components`. Calendar data is loaded server-side and shared between the Home "next shows" teaser and the full `/shows` page. Visual language follows the approved "Midwest Glow + a touch of bold" direction in `docs/superpowers/specs/2026-05-29-missy-midwest-redesign-design.md`.

**Tech Stack:** SvelteKit 2 + Svelte 5 (runes), Tailwind CSS v4, Vitest + @testing-library/svelte (unit/component), Playwright (E2E smoke), npm (this repo uses npm + `package-lock.json`, not pnpm).

---

## File structure (created/modified in this phase)

**Tooling**

- `vite.config.js` (modify) — add Vitest `test` config + browser resolve condition.
- `vitest.setup.ts` (create) — jest-dom matchers.
- `playwright.config.ts` (create) — E2E config.
- `package.json` (modify) — test deps + scripts.
- `e2e/smoke.spec.ts` (create) — navigation smoke test.

**Design system**

- `src/app.css` (modify) — gradient/glow utilities, button base, accent usage.
- `src/lib/components/Button.svelte` (create) — fill/outline CTA (anchor or button).
- `src/lib/components/SectionHeading.svelte` (create) — label + serif title.
- `src/lib/components/Footer.svelte` (create) — booking CTA, links, tips, socials.
- `src/lib/components/SocialLinks.svelte` (create) — extracted social icon row.

**Shared data / utils**

- `src/lib/utils/date.ts` (create) — `getOrdinalSuffix`, `formatDate`, `formatDateTime` (moved out of `UpcomingDates.svelte`).
- `src/lib/server/calendar.ts` (modify) — typed return + in-memory TTL cache + `getNextEvents(n)`.
- `src/lib/types/index.ts` (modify) — add `UpcomingEventsResult` type.

**Layout & navigation**

- `src/lib/header/Header.svelte` (modify) — sticky wordmark + page-link nav + socials.
- `src/lib/header/Nav.svelte` (modify) — page links (runes), drop scroll-logo math.
- `src/routes/+layout.svelte` (modify) — add `Footer`, runes `$props`.
- `src/routes/+layout.server.ts` (create) — load shared calendar events once.

**Pages**

- `src/routes/+page.svelte` (modify) — Home: Hero → About → ShopTeaser → ShowsTeaser → Instagram.
- `src/routes/+page.server.ts` (modify) — pass next-4 events to Home.
- `src/lib/landing/Hero.svelte` (create, replaces `Landing.svelte`) — redesigned hero.
- `src/lib/home/ShopTeaser.svelte` (create) — placeholder featured tiles (real data in Phase 2).
- `src/lib/home/InstagramFeed.svelte` (create) — Behold mount point (placeholder until Phase 3).
- `src/routes/shows/+page.svelte` (create) + `+page.server.ts` (create) — full calendar + gallery.
- `src/lib/previous-events/PreviousEvents.svelte` (modify) — static responsive gallery (revive).
- `src/routes/music/+page.svelte` (create) — featured embed + SoundCloud profile feed.
- `src/lib/music/SoundCloudFeed.svelte` (create) — profile widget iframe.
- `src/routes/contact/+page.svelte` (create) + `+page.server.ts` (create) — move Contact + PressKit.
- `src/routes/shop/+page.svelte` (create) — "coming soon" placeholder so nav works.
- `src/routes/+error.svelte` (modify) — runes + footer-aware layout.

**Removed**

- `src/routes/music/_audius_api.ts` (delete — dead commented stub).
- `src/lib/landing/Landing.svelte` (delete after Hero replaces it).
- Old single-page imports of `Music`, `Bio`, `Contact`, `Support` from `+page.svelte`.

---

## Task 1: Test toolchain (Vitest + Testing Library)

**Files:**

- Modify: `package.json`
- Modify: `vite.config.js`
- Create: `vitest.setup.ts`
- Create: `src/lib/utils/sanity.test.ts` (temporary smoke test, deleted in Task 7)

- [ ] **Step 1: Install dev dependencies**

Run:

```bash
npm install -D vitest@^2 jsdom @testing-library/svelte@^5 @testing-library/jest-dom @vitest/coverage-v8
```

Expected: packages added to `devDependencies`, no errors.

- [ ] **Step 2: Add test scripts to `package.json`**

In the `"scripts"` block add:

```json
"test": "vitest run",
"test:unit": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 3: Configure Vitest in `vite.config.js`**

Replace the file contents with:

```js
import tailwindcss from '@tailwindcss/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import viteImagemin from 'vite-plugin-imagemin';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson(), viteImagemin()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./vitest.setup.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// Svelte 5 components must resolve their browser build under test
		alias: process.env.VITEST ? [{ find: /^svelte$/, replacement: 'svelte' }] : []
	},
	resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined
});
```

- [ ] **Step 4: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: Create a temporary sanity test `src/lib/utils/sanity.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('toolchain', () => {
	it('runs', () => {
		expect(1 + 1).toBe(2);
	});
});
```

- [ ] **Step 6: Run tests to verify the toolchain works**

Run: `npm test`
Expected: PASS — 1 test passed.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.js vitest.setup.ts src/lib/utils/sanity.test.ts
git commit -m "chore: add vitest + testing-library toolchain"
```

---

## Task 2: Playwright E2E scaffold + smoke test

**Files:**

- Modify: `package.json`
- Create: `playwright.config.ts`
- Create: `e2e/smoke.spec.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Install Playwright**

Run:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Expected: chromium browser downloaded.

- [ ] **Step 2: Add E2E script to `package.json`**

In `"scripts"` add:

```json
"test:e2e": "playwright test"
```

- [ ] **Step 3: Create `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	use: { baseURL: 'http://localhost:4173' }
});
```

- [ ] **Step 4: Write the smoke test `e2e/smoke.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('home page loads and shows the brand wordmark', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('link', { name: /missy midwest/i }).first()).toBeVisible();
});
```

- [ ] **Step 5: Ignore Playwright artifacts in `.gitignore`**

Append:

```
/test-results
/playwright-report
/.playwright
```

- [ ] **Step 6: Run the smoke test (will be re-run after Home is rebuilt; expected to pass against current site too since the logo links home)**

Run: `npm run test:e2e`
Expected: PASS (the current header logo already links to `/`). If it fails on the wordmark name, it will pass after Task 8 — note and continue.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json playwright.config.ts e2e/smoke.spec.ts .gitignore
git commit -m "chore: add playwright e2e smoke scaffold"
```

---

## Task 3: Design tokens & global utilities

**Files:**

- Modify: `src/app.css`
- Modify: `src/app.html`

- [ ] **Step 1: Add gradient/glow/button utilities to `src/app.css`**

Append below the existing `@media` block:

```css
/* ---- Brand utilities (Midwest Glow + a touch of bold) ---- */
.text-glow {
	text-shadow: 0 0 28px rgba(255, 147, 193, 0.35);
}
.bg-glow-warm {
	background:
		radial-gradient(120% 80% at 78% -10%, var(--color-missy-blush) 0%, transparent 50%),
		linear-gradient(
			180deg,
			var(--color-missy-deep-purple) 0%,
			var(--color-missy-plum) 52%,
			var(--color-lake-sunset) 124%
		);
}
.text-gradient-sun {
	background: linear-gradient(90deg, var(--color-lake-sunrise), var(--color-missy-blush));
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}
.label-eyebrow {
	font-family: var(--font-obviously);
	font-size: 0.7rem;
	letter-spacing: 0.26em;
	text-transform: uppercase;
	font-weight: 700;
	color: var(--color-lake-sunrise);
}
```

- [ ] **Step 2: Fix stale `<meta name="description">` in `src/app.html`**

Replace line 5 (`content="Svelte demo app"`) with:

```html
<meta
	name="description"
	content="Missy Midwest — open-format DJ, vocalist & producer. Music, shows, merch & booking."
/>
```

- [ ] **Step 3: Verify the dev server still compiles**

Run: `npm run dev` then open the printed URL, confirm no console/build errors, then stop the server (Ctrl+C).
Expected: site renders as before with no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/app.css src/app.html
git commit -m "feat: add brand gradient/glow utilities and fix meta description"
```

---

## Task 4: `Button` component

**Files:**

- Create: `src/lib/components/Button.svelte`
- Create: `src/lib/components/Button.test.ts`

- [ ] **Step 1: Write the failing test `src/lib/components/Button.test.ts`**

```ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Button from './Button.svelte';

describe('Button', () => {
	it('renders an anchor when href is provided', () => {
		render(Button, { props: { href: '/shop', label: 'Shop' } });
		const link = screen.getByRole('link', { name: 'Shop' });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '/shop');
	});

	it('renders a button when no href is provided', () => {
		render(Button, { props: { label: 'Submit' } });
		expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
	});

	it('applies the outline variant class', () => {
		render(Button, { props: { label: 'More', variant: 'outline' } });
		expect(screen.getByText('More')).toHaveClass('btn-outline');
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- Button`
Expected: FAIL — cannot resolve `./Button.svelte`.

- [ ] **Step 3: Create `src/lib/components/Button.svelte` (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	interface Props {
		label: string;
		href?: string;
		variant?: 'fill' | 'outline';
		type?: 'button' | 'submit';
		disabled?: boolean;
		onclick?: () => void;
	}
	let {
		label,
		href,
		variant = 'fill',
		type = 'button',
		disabled = false,
		onclick
	}: Props = $props();

	const cls = `btn btn-${variant}`;
</script>

{#if href}
	<a {href} class={cls}>{label}</a>
{:else}
	<button class={cls} {type} {disabled} {onclick}>{label}</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-obviously);
		font-weight: 700;
		font-size: 0.85rem;
		padding: 0.7rem 1.4rem;
		border-radius: 999px;
		text-decoration: none;
		cursor: pointer;
		transition:
			transform 0.15s ease-out,
			box-shadow 0.15s ease-out;
	}
	.btn:hover {
		transform: translateY(-1px);
		border-bottom: none;
	}
	.btn-fill {
		background: linear-gradient(90deg, var(--color-missy-blush), var(--color-lake-sunrise));
		color: #3a1233;
		box-shadow: 0 6px 22px rgba(248, 151, 29, 0.4);
	}
	.btn-outline {
		background: transparent;
		border: 1px solid var(--color-missy-classic-lavender);
		color: var(--color-missy-classic-lavender);
	}
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- Button`
Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/Button.svelte src/lib/components/Button.test.ts
git commit -m "feat: add Button component"
```

---

## Task 5: `SectionHeading` component

**Files:**

- Create: `src/lib/components/SectionHeading.svelte`
- Create: `src/lib/components/SectionHeading.test.ts`

- [ ] **Step 1: Write the failing test `src/lib/components/SectionHeading.test.ts`**

```ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import SectionHeading from './SectionHeading.svelte';

describe('SectionHeading', () => {
	it('renders the eyebrow label and title', () => {
		render(SectionHeading, { props: { label: 'Shop', title: 'Rep the brand' } });
		expect(screen.getByText('Shop')).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Rep the brand' })).toBeInTheDocument();
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- SectionHeading`
Expected: FAIL — cannot resolve component.

- [ ] **Step 3: Create `src/lib/components/SectionHeading.svelte` (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	interface Props {
		label: string;
		title: string;
	}
	let { label, title }: Props = $props();
</script>

<div class="mb-6">
	<div class="label-eyebrow">{label}</div>
	<h2 class="mt-2 text-4xl md:text-5xl">{title}</h2>
</div>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- SectionHeading`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/SectionHeading.svelte src/lib/components/SectionHeading.test.ts
git commit -m "feat: add SectionHeading component"
```

---

## Task 6: `SocialLinks` + `Footer` components

**Files:**

- Create: `src/lib/components/SocialLinks.svelte`
- Create: `src/lib/components/Footer.svelte`
- Create: `src/lib/components/Footer.test.ts`

- [ ] **Step 1: Write the failing test `src/lib/components/Footer.test.ts`**

```ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Footer from './Footer.svelte';

describe('Footer', () => {
	it('shows the booking CTA and tip links', () => {
		render(Footer);
		expect(screen.getByRole('link', { name: /book missy/i })).toHaveAttribute('href', '/contact');
		expect(screen.getByText(/@missymidwest/i)).toBeInTheDocument();
	});

	it('links to the four primary pages', () => {
		render(Footer);
		for (const name of ['Music', 'Shows', 'Shop', 'Contact']) {
			expect(screen.getByRole('link', { name })).toBeInTheDocument();
		}
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- Footer`
Expected: FAIL — cannot resolve component.

- [ ] **Step 3: Create `src/lib/components/SocialLinks.svelte` (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	import {
		SiSoundcloud,
		SiTiktok,
		SiTwitch,
		SiInstagram,
		SiFacebook,
		SiYoutube
	} from '@icons-pack/svelte-simple-icons';

	interface Props {
		size?: number;
	}
	let { size = 24 }: Props = $props();

	const color = 'var(--color-missy-classic-lavender)';
	const socials = [
		{ href: 'https://soundcloud.com/missymidwest', Icon: SiSoundcloud, label: 'SoundCloud' },
		{ href: 'https://www.instagram.com/missy.midwest/', Icon: SiInstagram, label: 'Instagram' },
		{ href: 'https://www.tiktok.com/@missy.midwestofficial', Icon: SiTiktok, label: 'TikTok' },
		{ href: 'https://www.twitch.tv/missymidwest', Icon: SiTwitch, label: 'Twitch' },
		{ href: 'https://www.facebook.com/MissyMidwest/', Icon: SiFacebook, label: 'Facebook' },
		{
			href: 'https://www.youtube.com/channel/UCG4fK0SGXZpW6FJfGblgIqg',
			Icon: SiYoutube,
			label: 'YouTube'
		}
	];
</script>

<div class="flex items-center gap-4">
	{#each socials as { href, Icon, label } (href)}
		<a {href} target="_blank" rel="noreferrer" aria-label={label} class="social">
			<Icon {size} {color} />
		</a>
	{/each}
</div>

<style>
	.social:hover {
		transform: scale(1.1);
		transition: transform 0.1s ease-out;
		border-bottom: none;
	}
</style>
```

- [ ] **Step 4: Create `src/lib/components/Footer.svelte` (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	import Button from './Button.svelte';
	import SocialLinks from './SocialLinks.svelte';

	const year = 2026;
	const explore = [
		{ href: '/music', label: 'Music' },
		{ href: '/shows', label: 'Shows' },
		{ href: '/shop', label: 'Shop' },
		{ href: '/contact', label: 'Contact' }
	];
</script>

<footer class="border-missy-classic-lavender/15 w-full border-t bg-[#100c1a]">
	<div class="mx-auto grid w-full max-w-screen-2xl gap-10 px-8 py-12 md:grid-cols-3 md:px-14">
		<div>
			<div class="missy-header text-2xl text-white">Missy Midwest</div>
			<p class="mt-3 max-w-xs text-sm opacity-80">
				Booking, residencies &amp; workshops — let's make something loud.
			</p>
			<div class="mt-4">
				<Button href="/contact" label="Book Missy →" variant="fill" />
			</div>
		</div>

		<div>
			<h4 class="label-eyebrow mb-3">Explore</h4>
			<ul class="space-y-2 text-sm">
				{#each explore as link (link.href)}
					<li><a href={link.href}>{link.label}</a></li>
				{/each}
			</ul>
		</div>

		<div>
			<h4 class="label-eyebrow mb-3">Support &amp; Follow</h4>
			<ul class="space-y-2 text-sm">
				<li>
					<a href="https://venmo.com/u/missymidwest" target="_blank" rel="noreferrer"
						>Venmo @missymidwest</a
					>
				</li>
				<li>
					<a href="https://cash.app/$missymidwest" target="_blank" rel="noreferrer"
						>Cash App $missymidwest</a
					>
				</li>
			</ul>
			<div class="mt-4"><SocialLinks size={22} /></div>
		</div>
	</div>
	<div class="bg-[#0c0913] py-4 text-center text-xs opacity-50">
		© {year} Missy Midwest · Jordan Brooke Music LLC
	</div>
</footer>
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- Footer`
Expected: PASS — 2 tests.

- [ ] **Step 6: Commit**

```bash
git add src/lib/components/SocialLinks.svelte src/lib/components/Footer.svelte src/lib/components/Footer.test.ts
git commit -m "feat: add SocialLinks and Footer components"
```

---

## Task 7: Date utilities (extracted + tested)

**Files:**

- Create: `src/lib/utils/date.ts`
- Create: `src/lib/utils/date.test.ts`
- Delete: `src/lib/utils/sanity.test.ts`

- [ ] **Step 1: Write the failing test `src/lib/utils/date.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { getOrdinalSuffix, formatDate, formatDateTime } from './date';

describe('getOrdinalSuffix', () => {
	it('handles 1/2/3 and teens', () => {
		expect(getOrdinalSuffix(1)).toBe('st');
		expect(getOrdinalSuffix(2)).toBe('nd');
		expect(getOrdinalSuffix(3)).toBe('rd');
		expect(getOrdinalSuffix(11)).toBe('th');
		expect(getOrdinalSuffix(21)).toBe('st');
		expect(getOrdinalSuffix(4)).toBe('th');
	});
});

describe('formatDate', () => {
	it('parses a date-only string as local (no UTC off-by-one)', () => {
		// June 14, 2026 must not roll back to the 13th in negative-UTC zones
		expect(formatDate('2026-06-14')).toBe('June 14th 2026');
	});
});

describe('formatDateTime', () => {
	it('includes the time portion', () => {
		const out = formatDateTime('2026-06-14T20:30:00-05:00');
		expect(out).toContain('June 14th 2026 at');
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- date`
Expected: FAIL — cannot resolve `./date`.

- [ ] **Step 3: Create `src/lib/utils/date.ts`**

```ts
/** Ordinal suffix for a day of month (1 -> "st", 11 -> "th"). */
export function getOrdinalSuffix(day: number): string {
	if (day > 3 && day < 21) return 'th';
	switch (day % 10) {
		case 1:
			return 'st';
		case 2:
			return 'nd';
		case 3:
			return 'rd';
		default:
			return 'th';
	}
}

/**
 * Format a date as "Month Day{ordinal} Year".
 * Date-only strings (YYYY-MM-DD) are parsed as LOCAL midnight to avoid the
 * UTC off-by-one that affects timezones behind UTC.
 */
export function formatDate(dateString: string): string {
	const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
	let date: Date;
	if (isDateOnly) {
		const [y, m, d] = dateString.split('-').map(Number);
		date = new Date(y, m - 1, d);
	} else {
		date = new Date(dateString);
	}
	const month = date.toLocaleDateString('en-US', { month: 'long' });
	const day = date.getDate();
	const year = date.getFullYear();
	return `${month} ${day}${getOrdinalSuffix(day)} ${year}`;
}

/** Format a full datetime as "Month Day{ordinal} Year at h:mm AM/PM". */
export function formatDateTime(dateTimeString: string): string {
	const date = new Date(dateTimeString);
	const time = date.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});
	return `${formatDate(dateTimeString)} at ${time}`;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- date`
Expected: PASS — 3 tests.

> Note: if `formatDate('2026-06-14')` asserts in a CI runner whose locale isn't `en-US`, the test still passes because the format is pinned to `'en-US'` explicitly.

- [ ] **Step 5: Delete the temporary sanity test**

Run: `git rm src/lib/utils/sanity.test.ts`

- [ ] **Step 6: Commit**

```bash
git add src/lib/utils/date.ts src/lib/utils/date.test.ts
git commit -m "feat: extract and test date utilities"
```

---

## Task 8: Typed, cached calendar service + shared layout load

**Files:**

- Modify: `src/lib/types/index.ts`
- Modify: `src/lib/server/calendar.ts`
- Create: `src/lib/server/calendar.test.ts`
- Create: `src/routes/+layout.server.ts`

- [ ] **Step 1: Add the result type to `src/lib/types/index.ts`**

Append:

```ts
export interface UpcomingEventsResult {
	events: CalendarEvent[];
	error?: string;
}
```

- [ ] **Step 2: Write the failing test `src/lib/server/calendar.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const listMock = vi.fn();

vi.mock('googleapis', () => ({
	google: {
		calendar: () => ({ events: { list: listMock } }),
		auth: { JWT: class {} }
	}
}));

vi.mock('$env/static/private', () => ({
	MISSY_CALENDAR_CLIENT_EMAIL: 'svc@example.com',
	MISSY_CALENDAR_PRIVATE_KEY: 'key'
}));

import { getUpcomingEvents, getNextEvents, __clearCalendarCache } from './calendar';

beforeEach(() => {
	listMock.mockReset();
	__clearCalendarCache();
});

describe('getUpcomingEvents', () => {
	it('returns the events array on success', async () => {
		listMock.mockResolvedValue({ data: { items: [{ id: '1' }, { id: '2' }] } });
		const result = await getUpcomingEvents();
		expect(result.events).toHaveLength(2);
		expect(result.error).toBeUndefined();
	});

	it('returns an error message and empty events on failure', async () => {
		listMock.mockRejectedValue(new Error('boom'));
		const result = await getUpcomingEvents();
		expect(result.events).toEqual([]);
		expect(result.error).toBe('boom');
	});

	it('caches results within the TTL (one API call for two reads)', async () => {
		listMock.mockResolvedValue({ data: { items: [{ id: '1' }] } });
		await getUpcomingEvents();
		await getUpcomingEvents();
		expect(listMock).toHaveBeenCalledTimes(1);
	});
});

describe('getNextEvents', () => {
	it('returns at most n events', async () => {
		listMock.mockResolvedValue({ data: { items: [{ id: '1' }, { id: '2' }, { id: '3' }] } });
		const next = await getNextEvents(2);
		expect(next.events).toHaveLength(2);
	});
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- calendar`
Expected: FAIL — `getNextEvents` / `__clearCalendarCache` not exported.

- [ ] **Step 4: Rewrite `src/lib/server/calendar.ts`**

```ts
import { google } from 'googleapis';
import { MISSY_CALENDAR_CLIENT_EMAIL, MISSY_CALENDAR_PRIVATE_KEY } from '$env/static/private';
import type { CalendarEvent, UpcomingEventsResult } from '$lib/types/index';

const calendar = google.calendar('v3');
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { at: number; result: UpcomingEventsResult } | null = null;

/** Test-only: reset the in-memory cache. */
export function __clearCalendarCache(): void {
	cache = null;
}

/** Fetch upcoming events from Google Calendar (cached for 5 minutes). */
export async function getUpcomingEvents(): Promise<UpcomingEventsResult> {
	if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
		return cache.result;
	}

	try {
		const client = new google.auth.JWT(
			MISSY_CALENDAR_CLIENT_EMAIL,
			undefined,
			MISSY_CALENDAR_PRIVATE_KEY.replace(/\\n/g, '\n'),
			['https://www.googleapis.com/auth/calendar.readonly']
		);

		const response = await calendar.events.list({
			auth: client,
			calendarId: 'missy.midwestofficial@gmail.com',
			timeMin: new Date().toISOString(),
			singleEvents: true,
			orderBy: 'startTime'
		});

		const result: UpcomingEventsResult = {
			events: (response.data.items ?? []) as CalendarEvent[]
		};
		cache = { at: Date.now(), result };
		return result;
	} catch (error) {
		console.error('Calendar API error:', error);
		return {
			events: [],
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

/** Return at most `n` upcoming events (for the Home teaser). */
export async function getNextEvents(n: number): Promise<UpcomingEventsResult> {
	const result = await getUpcomingEvents();
	return { events: result.events.slice(0, n), error: result.error };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- calendar`
Expected: PASS — 4 tests.

- [ ] **Step 6: Create `src/routes/+layout.server.ts` (loads events once for all pages)**

```ts
import { getUpcomingEvents } from '$lib/server/calendar';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const { events, error } = await getUpcomingEvents();
	return { events, calendarError: error };
};
```

- [ ] **Step 7: Run the full suite + typecheck**

Run: `npm test && npm run check`
Expected: tests PASS; `svelte-check` reports 0 errors.

- [ ] **Step 8: Commit**

```bash
git add src/lib/types/index.ts src/lib/server/calendar.ts src/lib/server/calendar.test.ts src/routes/+layout.server.ts
git commit -m "feat: typed cached calendar service + shared layout load"
```

---

## Task 9: Redesigned Header/Nav (page links) + layout with Footer

**Files:**

- Modify: `src/lib/header/Nav.svelte`
- Modify: `src/lib/header/Header.svelte`
- Modify: `src/routes/+layout.svelte`

- [ ] **Step 1: Rewrite `src/lib/header/Nav.svelte` as runes page-link nav (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	import { page } from '$app/state';

	const routes = [
		{ href: '/music', label: 'MUSIC' },
		{ href: '/shows', label: 'SHOWS' },
		{ href: '/shop', label: 'SHOP' },
		{ href: '/contact', label: 'CONTACT' }
	];
</script>

<nav>
	<ul class="flex items-center gap-5 lg:gap-8">
		{#each routes as route (route.href)}
			<li>
				<a
					href={route.href}
					class="nav-link"
					aria-current={page.url.pathname === route.href ? 'page' : undefined}
				>
					{route.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.nav-link {
		font-family: var(--font-cochin);
		font-size: 0.8rem;
		letter-spacing: 0.14em;
		color: var(--color-slate-50);
	}
	.nav-link:hover,
	.nav-link[aria-current='page'] {
		color: var(--color-missy-classic-lavender);
		border-bottom: none;
	}
</style>
```

- [ ] **Step 2: Rewrite `src/lib/header/Header.svelte` (sticky wordmark + nav + socials, runes) (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	import Nav from '$lib/header/Nav.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
</script>

<header
	class="bg-missy-deep-purple/85 border-missy-classic-lavender/15 sticky top-0 z-30 w-full border-b backdrop-blur-md"
>
	<div class="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
		<div class="hidden md:block"><SocialLinks size={22} /></div>
		<a href="/" class="missy-header text-lg tracking-wide text-white md:text-xl">MISSY MIDWEST</a>
		<Nav />
	</div>
</header>
```

- [ ] **Step 3: Update `src/routes/+layout.svelte` to runes + Footer**

```svelte
<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<Header />

<main class="bg-missy-deep-purple flex min-h-screen w-full flex-col items-center">
	{@render children()}
</main>

<Footer />
```

- [ ] **Step 4: Verify dev build + run smoke E2E**

Run: `npm run dev` (confirm header shows wordmark + page links, no errors), stop server, then:
Run: `npm run test:e2e`
Expected: smoke test PASS (wordmark link visible).

- [ ] **Step 5: Commit**

```bash
git add src/lib/header/Nav.svelte src/lib/header/Header.svelte src/routes/+layout.svelte
git commit -m "feat: page-link header/nav with sticky wordmark and footer layout"
```

---

## Task 10: Hero + Home page rebuild

**Files:**

- Create: `src/lib/landing/Hero.svelte`
- Create: `src/lib/home/ShopTeaser.svelte`
- Create: `src/lib/home/InstagramFeed.svelte`
- Create: `src/lib/home/ShowsTeaser.svelte`
- Modify: `src/routes/+page.server.ts`
- Modify: `src/routes/+page.svelte`
- Delete: `src/lib/landing/Landing.svelte`

- [ ] **Step 1: Create `src/lib/landing/Hero.svelte` (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	import Button from '$lib/components/Button.svelte';
</script>

<section class="bg-glow-warm relative w-full overflow-hidden" style="min-height: 78vh;">
	<div
		class="absolute inset-0 bg-[url('/landing/missy-fan-crop.webp')] bg-cover bg-center opacity-40 mix-blend-luminosity"
		aria-hidden="true"
	></div>
	<div
		class="relative z-10 mx-auto flex max-w-screen-2xl flex-col justify-center px-8 md:px-14"
		style="min-height: 78vh;"
	>
		<div class="label-eyebrow mb-3">Open-Format DJ · Vocalist · Producer</div>
		<h1 class="missy-header text-glow text-6xl leading-[0.86] text-white md:text-8xl lg:text-9xl">
			Missy <span class="text-gradient-sun">Midwest</span>
		</h1>
		<p class="mt-5 max-w-md text-base opacity-90 md:text-lg">
			Genre-blending energy from the Heart of IL to the Lake of the Ozarks and festival stages
			beyond.
		</p>
		<div class="mt-7 flex gap-4">
			<Button href="/music" label="▶ Listen now" variant="fill" />
			<Button href="/shop" label="Shop the merch" variant="outline" />
		</div>
	</div>
</section>
```

- [ ] **Step 2: Create `src/lib/home/ShowsTeaser.svelte` (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';
	import { formatDate, formatDateTime } from '$lib/utils/date';
	import type { CalendarEvent } from '$lib/types/index';

	interface Props {
		events: CalendarEvent[];
	}
	let { events }: Props = $props();
</script>

<section class="w-full max-w-screen-2xl px-8 py-16 md:px-14">
	<div class="flex items-end justify-between">
		<SectionHeading label="Live" title="Upcoming shows" />
		<Button href="/shows" label="All dates →" variant="outline" />
	</div>

	{#if events.length > 0}
		<div class="mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each events as show (show.id)}
				<a
					href={show.htmlLink}
					target="_blank"
					rel="noopener noreferrer"
					class="border-missy-classic-lavender/15 bg-missy-deep-purple/40 hover:shadow-missy-classic-lavender/20 block rounded-xl border p-5 hover:shadow-lg"
				>
					<p class="text-sm text-violet-200">
						{#if show.start.dateTime}{formatDateTime(show.start.dateTime)}{:else}{formatDate(
								show.start?.date || ''
							)}{/if}
					</p>
					<p class="missy-header mt-2 text-xl">{show.summary}</p>
					<p class="mt-1 text-xs opacity-65">{show.location}</p>
				</a>
			{/each}
		</div>
	{:else}
		<p class="opacity-80">No scheduled shows right now — <a href="/contact">book Missy</a>.</p>
	{/if}
</section>
```

- [ ] **Step 3: Create `src/lib/home/ShopTeaser.svelte` (placeholder until Phase 2) (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';

	// Phase 2 replaces this static list with featured products from Stripe.
	const featured = [
		{ name: 'Lavender Trucker', price: '$32', grad: 'from-missy-neon-lavender to-missy-blush' },
		{ name: 'Sunset Dad Hat', price: '$30', grad: 'from-missy-deep-purple to-lake-sunrise' },
		{ name: 'Tour Tee', price: '$28', grad: 'from-missy-magenta to-lake-sunset' }
	];
</script>

<section class="w-full max-w-screen-2xl px-8 py-16 md:px-14">
	<div class="flex items-end justify-between">
		<SectionHeading label="Shop" title="Rep the brand" />
		<Button href="/shop" label="View all →" variant="outline" />
	</div>
	<div class="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
		{#each featured as item (item.name)}
			<a
				href="/shop"
				class="border-missy-classic-lavender/12 overflow-hidden rounded-2xl border bg-[#1d1830]"
			>
				<div class={`h-52 bg-gradient-to-br ${item.grad}`}></div>
				<div class="flex items-center justify-between px-4 py-4">
					<div>
						<div class="text-sm font-semibold">{item.name}</div>
						<div class="text-missy-classic-lavender text-sm">{item.price}</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
</section>
```

- [ ] **Step 4: Create `src/lib/home/InstagramFeed.svelte` (Behold mount, placeholder until Phase 3) (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';

	// Phase 3 swaps this gradient grid for the live Behold.so widget.
	const tiles = Array.from({ length: 6 });
</script>

<section class="w-full max-w-screen-2xl px-8 py-16 md:px-14">
	<div class="flex items-end justify-between">
		<SectionHeading label="@missy.midwest" title="From the feed" />
		<Button href="https://www.instagram.com/missy.midwest/" label="Follow →" variant="outline" />
	</div>
	<div class="mt-2 grid grid-cols-3 gap-2.5 md:grid-cols-6">
		{#each tiles as _, i (i)}
			<div
				class="from-missy-neon-lavender to-missy-magenta aspect-square rounded-lg bg-gradient-to-br opacity-80"
			></div>
		{/each}
	</div>
</section>
```

- [ ] **Step 5: Update `src/routes/+page.server.ts` to pass the next 4 events**

```ts
import { getNextEvents } from '$lib/server/calendar';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { events } = await getNextEvents(4);
	return { nextShows: events };
};
```

- [ ] **Step 6: Rewrite `src/routes/+page.svelte` (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	import Hero from '$lib/landing/Hero.svelte';
	import Bio from '$lib/bio/Bio.svelte';
	import ShopTeaser from '$lib/home/ShopTeaser.svelte';
	import ShowsTeaser from '$lib/home/ShowsTeaser.svelte';
	import InstagramFeed from '$lib/home/InstagramFeed.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Missy Midwest — DJ · Vocalist · Producer</title>
</svelte:head>

<Hero />
<div class="flex w-full flex-col items-center">
	<Bio />
	<ShopTeaser />
	<ShowsTeaser events={data.nextShows} />
	<InstagramFeed />
</div>
```

- [ ] **Step 7: Convert `src/lib/bio/Bio.svelte` to a runes-friendly "About" block**

Keep its existing markup/content, but remove the page-level wrapper assumptions. No prop changes are required (it has none). Ensure it still uses `<section id="bio">` and the `max-w-screen-2xl` wrapper. (Hand the existing file to the svelte-file-editor subagent only if `svelte-check` flags it; otherwise leave as-is.)

- [ ] **Step 8: Delete the old Landing component**

Run: `git rm src/lib/landing/Landing.svelte`

- [ ] **Step 9: Verify build, typecheck, and E2E**

Run: `npm run check && npm run build && npm run test:e2e`
Expected: 0 type errors, successful build, smoke E2E PASS.

- [ ] **Step 10: Commit**

```bash
git add src/lib/landing/Hero.svelte src/lib/home/ src/routes/+page.svelte src/routes/+page.server.ts
git commit -m "feat: rebuild Home (hero, about, shop/shows teasers, instagram)"
```

---

## Task 11: `/shows` page (full calendar + previous-events gallery)

**Files:**

- Create: `src/routes/shows/+page.server.ts`
- Create: `src/routes/shows/+page.svelte`
- Modify: `src/lib/upcoming-dates/UpcomingDates.svelte`
- Modify: `src/lib/previous-events/PreviousEvents.svelte`

- [ ] **Step 1: Create `src/routes/shows/+page.server.ts`**

```ts
import { getUpcomingEvents } from '$lib/server/calendar';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { events } = await getUpcomingEvents();
	return { events };
};
```

- [ ] **Step 2: Refactor `src/lib/upcoming-dates/UpcomingDates.svelte` to use the date utils + runes props (via svelte-file-editor subagent)**

Replace the `<script>` block's inline date helpers with imports, and switch to `$props()`:

```svelte
<script lang="ts">
	import { formatDate, formatDateTime } from '$lib/utils/date';
	import type { CalendarEvent } from '$lib/types/index';

	interface Props {
		events: CalendarEvent[];
	}
	let { events }: Props = $props();
</script>
```

Keep the existing `<section id="dates">` markup and the attachment/thumbnail logic exactly as-is below the script (it already renders event cards with Google Drive thumbnails).

- [ ] **Step 3: Revive `src/lib/previous-events/PreviousEvents.svelte` as a static responsive gallery (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	// Curated past-gig photos already in /static/archive/gig-photos
	const photos = [
		'electric-forest',
		'backwoods-2023',
		'camp-taco',
		'united-groove',
		'her-set-her-sound',
		'paradise',
		'neon-taco',
		'tuckers-shuckers'
	];
</script>

<section class="w-full max-w-screen-2xl px-8 py-16 md:px-14">
	<h3 class="missy-header mb-6 text-2xl">Previous events</h3>
	<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
		{#each photos as slug (slug)}
			<img
				src={`/archive/gig-photos/${slug}.webp`}
				alt={`Missy Midwest live — ${slug.replaceAll('-', ' ')}`}
				loading="lazy"
				class="aspect-square w-full rounded-lg object-cover opacity-90 transition-opacity hover:opacity-100"
			/>
		{/each}
	</div>
</section>
```

- [ ] **Step 4: Create `src/routes/shows/+page.svelte` (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	import UpcomingDates from '$lib/upcoming-dates/UpcomingDates.svelte';
	import PreviousEvents from '$lib/previous-events/PreviousEvents.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Shows — Missy Midwest</title>
</svelte:head>

<div class="flex w-full flex-col items-center">
	<UpcomingDates events={data.events} />
	<PreviousEvents />
</div>
```

- [ ] **Step 5: Verify the gallery image paths exist**

Run: `ls static/archive/gig-photos/ | grep -E 'electric-forest|camp-taco|paradise'`
Expected: matching `.webp` files listed. (Adjust the `photos` slugs in Step 3 to real filenames if any are missing.)

- [ ] **Step 6: Build + typecheck**

Run: `npm run check && npm run build`
Expected: 0 errors, successful build.

- [ ] **Step 7: Commit**

```bash
git add src/routes/shows/ src/lib/upcoming-dates/UpcomingDates.svelte src/lib/previous-events/PreviousEvents.svelte
git commit -m "feat: add /shows page with full calendar and previous-events gallery"
```

---

## Task 12: `/music` page (featured embed + auto SoundCloud feed)

**Files:**

- Create: `src/lib/music/SoundCloudFeed.svelte`
- Create: `src/lib/music/SoundCloudFeed.test.ts`
- Create: `src/routes/music/+page.svelte`
- Delete: `src/routes/music/_audius_api.ts`

- [ ] **Step 1: Write the failing test `src/lib/music/SoundCloudFeed.test.ts`**

```ts
import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import SoundCloudFeed from './SoundCloudFeed.svelte';

describe('SoundCloudFeed', () => {
	it('embeds the artist profile so new uploads appear automatically', () => {
		const { container } = render(SoundCloudFeed);
		const iframe = container.querySelector('iframe');
		expect(iframe).not.toBeNull();
		// The widget points at the user profile (not a single track id)
		expect(decodeURIComponent(iframe!.getAttribute('src') || '')).toContain(
			'soundcloud.com/missymidwest'
		);
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- SoundCloudFeed`
Expected: FAIL — cannot resolve component.

- [ ] **Step 3: Create `src/lib/music/SoundCloudFeed.svelte` (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	// Profile widget: auto-lists Missy's latest uploads — no API key, no manual updates.
	const profile = encodeURIComponent('https://soundcloud.com/missymidwest');
	const color = '%23cbb1fa';
	const src =
		`https://w.soundcloud.com/player/?url=${profile}` +
		`&color=${color}&auto_play=false&hide_related=true&show_comments=false` +
		`&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
</script>

<div class="mx-auto w-full max-w-3xl">
	<iframe
		title="Missy Midwest — latest on SoundCloud"
		width="100%"
		height="450"
		scrolling="no"
		frameborder="no"
		allow="autoplay"
		class="rounded-md"
		{src}
	></iframe>
</div>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- SoundCloudFeed`
Expected: PASS.

- [ ] **Step 5: Create `src/routes/music/+page.svelte` (featured embed + feed) (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import SoundCloudFeed from '$lib/music/SoundCloudFeed.svelte';

	// Curated featured track/mix (swap the track id anytime).
	const featuredTrack = '2107042845';
	const featuredSrc =
		`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${featuredTrack}` +
		`&color=%23cbb1fa&auto_play=false&hide_related=true&show_comments=false&show_user=true&visual=true`;
</script>

<svelte:head>
	<title>Music — Missy Midwest</title>
</svelte:head>

<div class="flex w-full max-w-screen-2xl flex-col items-center px-8 py-16 md:px-14">
	<div class="w-full">
		<SectionHeading label="Featured" title="Latest mix" />
		<div class="mx-auto mb-16 w-full max-w-3xl">
			<iframe
				title="Featured mix"
				width="100%"
				height="450"
				scrolling="no"
				frameborder="no"
				allow="autoplay"
				class="rounded-md"
				src={featuredSrc}
			></iframe>
		</div>

		<SectionHeading label="SoundCloud" title="Everything she's posted" />
		<SoundCloudFeed />
	</div>
</div>
```

- [ ] **Step 6: Delete the dead Audius stub**

Run: `git rm src/routes/music/_audius_api.ts`

- [ ] **Step 7: Build + typecheck**

Run: `npm run check && npm run build`
Expected: 0 errors, successful build.

- [ ] **Step 8: Commit**

```bash
git add src/lib/music/ src/routes/music/+page.svelte
git commit -m "feat: add /music page with featured embed and auto SoundCloud feed"
```

---

## Task 13: `/contact` page (move Contact form + Press Kit)

**Files:**

- Create: `src/routes/contact/+page.server.ts`
- Create: `src/routes/contact/+page.svelte`
- Modify: `src/lib/contact/Contact.svelte` (only if `svelte-check` flags issues after the move)
- Modify: `src/lib/press-kit/PressKit.svelte` (verify asset paths)
- Modify: `src/routes/+page.server.ts` (remove the now-unused `contact` action — it moves to `/contact`)

- [ ] **Step 1: Create `src/routes/contact/+page.server.ts` (move the Turnstile action here verbatim)**

```ts
import { fail } from '@sveltejs/kit';
import { validateTurnstileToken } from '$lib/server/turnstile';
import type { Actions } from './$types';

export const actions: Actions = {
	contact: async ({ request }) => {
		const formData = await request.formData();
		const turnstileToken = formData.get('cf-turnstile-response')?.toString() || '';

		if (!turnstileToken || !(await validateTurnstileToken(turnstileToken))) {
			return fail(400, {
				success: false,
				message: 'Invalid CAPTCHA. Sorry robot. Please retry if you are in fact, human.'
			});
		}

		return {
			success: true,
			message: 'Message sent! Thanks for your submission :)'
		};
	}
};
```

> Note: this preserves the existing EmailJS client-send flow for Phase 1. Phase 2 replaces it with server-side Resend.

- [ ] **Step 2: Create `src/routes/contact/+page.svelte` (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	import Contact from '$lib/contact/Contact.svelte';
	import PressKit from '$lib/press-kit/PressKit.svelte';
</script>

<svelte:head>
	<title>Contact &amp; Booking — Missy Midwest</title>
</svelte:head>

<div class="flex w-full flex-col items-center px-8 md:px-14">
	<Contact />
	<PressKit />
</div>
```

- [ ] **Step 3: Remove the duplicate `contact` action from `src/routes/+page.server.ts`**

The Home loader (Task 10, Step 5) now only loads `nextShows`. Confirm `src/routes/+page.server.ts` contains no `actions` export (it was replaced in Task 10). If a stale `actions` block remains, delete it so the action lives only at `/contact`.

- [ ] **Step 4: Verify Press Kit asset paths resolve**

Run: `ls static/press-kit/`
Expected: confirm `missy-midwest-press-kit.pdf` exists. For any `PressKit.svelte` link whose target is missing (e.g. `missy-presskit-bio.txt`, `missy-profile.jpg`), either add the asset or remove that tile. Note any removed tiles in the commit message.

- [ ] **Step 5: Build + typecheck + run unit suite**

Run: `npm run check && npm test && npm run build`
Expected: 0 type errors, all unit tests PASS, successful build.

- [ ] **Step 6: Commit**

```bash
git add src/routes/contact/ src/lib/press-kit/PressKit.svelte src/routes/+page.server.ts
git commit -m "feat: move contact form and press kit to /contact"
```

---

## Task 14: `/shop` placeholder + `/error` refresh + cleanup

**Files:**

- Create: `src/routes/shop/+page.svelte`
- Modify: `src/routes/+error.svelte`
- Modify: `README.md`

- [ ] **Step 1: Create `src/routes/shop/+page.svelte` ("coming soon" so nav works) (via svelte-file-editor subagent)**

```svelte
<script lang="ts">
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';
</script>

<svelte:head>
	<title>Shop — Missy Midwest</title>
</svelte:head>

<section class="flex w-full max-w-screen-2xl flex-col items-center px-8 py-28 text-center md:px-14">
	<SectionHeading label="Shop" title="Merch is on the way" />
	<p class="max-w-md opacity-85">
		Hats and tees are dropping soon. In the meantime, catch a show or say hi.
	</p>
	<div class="mt-6 flex gap-4">
		<Button href="/shows" label="See shows" variant="fill" />
		<Button href="/contact" label="Get in touch" variant="outline" />
	</div>
</section>
```

- [ ] **Step 2: Convert `src/routes/+error.svelte` to runes (via svelte-file-editor subagent)**

Replace the `<script>` block (keep the rest of the markup/styles):

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const errorMessage = $derived(page.error?.message || 'Something went wrong');
	const is404 = $derived(page.status === 404);

	function goHome() {
		goto('/');
	}
</script>
```

Then update the two button handlers' markup to use `onclick={goHome}` and `onclick={() => history.back()}` (already present), and replace `{errorMessage}` / `{is404}` usages — they now reference the `$derived` values directly.

- [ ] **Step 3: Update `README.md` with the new structure**

Replace the README body with a short project overview:

```markdown
# Missy Midwest

SvelteKit + Svelte 5 (runes) site for DJ Missy Midwest. Tailwind CSS v4, deployed on Netlify.

## Pages

- `/` Home — hero, about, shop & shows teasers, Instagram feed
- `/music` — featured mix + auto-updating SoundCloud profile feed
- `/shows` — Google Calendar dates + past-event gallery
- `/shop` — merch (Stripe — Phase 2)
- `/contact` — booking form (Turnstile) + press kit

## Scripts

- `npm run dev` — dev server
- `npm test` — unit/component tests (Vitest)
- `npm run test:e2e` — Playwright smoke
- `npm run check` — svelte-check
- `npm run build` — production build

## Integrations

Google Calendar (shows), Cloudflare Turnstile + EmailJS (contact), SoundCloud (music).
See `docs/superpowers/specs/` for the full redesign spec and `docs/superpowers/plans/` for phased plans.
```

- [ ] **Step 4: Full verification pass**

Run: `npm run lint && npm run check && npm test && npm run build && npm run test:e2e`
Expected: lint clean, 0 type errors, all unit tests PASS, build succeeds, smoke E2E PASS.

- [ ] **Step 5: Manual click-through**

Run: `npm run dev`, then visit `/`, `/music`, `/shows`, `/shop`, `/contact` and a bogus URL (e.g. `/nope`). Confirm: header/nav active states, footer present on every page, hero renders, shows load (or show the empty state), contact form submits, 404 page renders. Stop the server.
Expected: every route renders with no console errors.

- [ ] **Step 6: Commit**

```bash
git add src/routes/shop/+page.svelte src/routes/+error.svelte README.md
git commit -m "feat: add shop placeholder, modernize error page, update README"
```

---

## Self-review (completed during planning)

- **Spec §3 (visual direction):** tokens/utilities (Task 3), Hero glow + gradient headline (Task 10), serif headings via `SectionHeading` (Task 5). ✓
- **Spec §4 (routes):** Home, `/music`, `/shows`, `/shop` (placeholder this phase), `/contact` created (Tasks 10–14); `/shop/[group]` + checkout/webhook are **Phase 2** by design. ✓
- **Spec §6 (music):** SoundCloud profile feed replaces hardcoded track embeds (Task 12). ✓
- **Spec §6 (calendar caching):** TTL cache + shared layout load (Task 8). ✓
- **Spec §6 (tips/socials):** Footer (Task 6). ✓
- **Spec §6 (Instagram/Behold):** mount-point placeholder now (Task 10), live widget is **Phase 3**. ✓
- **Spec §6 (Resend) + §5 (Stripe):** intentionally **deferred to Phase 2** — contact keeps EmailJS this phase (Task 13 note). ✓
- **Spec §10 (testing):** Vitest + Testing Library + Playwright (Tasks 1–2); unit tests for date utils, calendar service, and components throughout. ✓
- **Runes migration:** Nav, Header, layout, error page, reused section components moved to runes (Tasks 9, 11, 13, 14). ✓
- **Type consistency:** `UpcomingEventsResult { events; error? }` defined in Task 8 and consumed identically in `+layout.server.ts`, `+page.server.ts`, `shows/+page.server.ts`. `getNextEvents(n)` signature matches its use in Task 10. `Button` props (`label/href/variant/type/disabled/onclick`) used consistently in Tasks 6, 10, 14. ✓
- **Placeholder scan:** no TBD/TODO; deferred items are explicitly labeled as later phases with rationale, not omitted work. ✓

```

```
