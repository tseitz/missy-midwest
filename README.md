# Missy Midwest

SvelteKit + Svelte 5 (runes) site for DJ Missy Midwest. Tailwind CSS v4,
deployed on Netlify. Package manager is **pnpm** (canonical — see CLAUDE.md).

## Pages

- `/` Home — hero, bio, shop teaser, upcoming shows, Instagram feed
- `/music` — featured mix + auto-updating SoundCloud catalog feed
- `/shows` — Google Calendar dates + past-event gallery (event posters are
  proxied and cached from Google Drive)
- `/shop` — Stripe merch storefront, currently behind a **"Coming Soon" gate**
  (`SHOP_ENABLED` in `src/lib/shop/config.ts`); flip it on at go-live
- `/contact` — booking form (Cloudflare Turnstile) + press kit

## Scripts

Always use `pnpm` — never `npm`/`yarn` (mixing managers corrupts `node_modules`).

- `pnpm dev` — dev server
- `pnpm build` / `pnpm preview` — production build / preview
- `pnpm test` — unit/component tests (Vitest); `pnpm test:coverage` for coverage
- `pnpm test:e2e` — Playwright smoke
- `pnpm check` — svelte-check; `pnpm lint` — prettier + eslint; `pnpm format`
- `pnpm images` — optimize/convert images under `static/` (sharp)

Node 24 + pnpm 11.5.0 are pinned via `mise.toml` (and `netlify.toml`); run
`mise install` once to match the toolchain.

## Integrations

| Area          | Service                                                     |
| ------------- | ----------------------------------------------------------- |
| Shows         | Google Calendar (service account, read-only)                |
| Event posters | Google Drive (cached proxy at `/api/event-poster/[fileId]`) |
| Music         | SoundCloud (featured track + profile feed)                  |
| Instagram     | Behold.so feed (server-fetched, Zod-validated)              |
| Shop          | Stripe Checkout (`/shop`, gated) + webhook for stock/email  |
| Email         | Resend (contact form + order notifications)                 |
| Spam          | Cloudflare Turnstile (contact form)                         |
| Monitoring    | Sentry (errors only, gated on DSN env vars)                 |

## Environment

Copy `.env.example` to `.env` and fill in the values — it documents every
variable (Google Calendar, Turnstile, Behold, Stripe, Resend, Sentry).
Production values live in Netlify's environment settings.

## Deploy

Netlify (`@sveltejs/adapter-netlify`). Pushing to `main` triggers a production
deploy.
