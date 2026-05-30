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

## Environment

Copy `.env.example` to `.env` and fill in the values (Google Calendar service
account, Cloudflare Turnstile, EmailJS). Production values live in Netlify's
environment settings.

## Integrations

Google Calendar (shows), Cloudflare Turnstile + EmailJS (contact), SoundCloud
(music). See `docs/superpowers/specs/` for the full redesign spec and
`docs/superpowers/plans/` for the phased implementation plans.
