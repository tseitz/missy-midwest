# missy-midwest knowledge base

Durable business, product, and operational knowledge for the site — the stuff
that isn't obvious from the code and that future-you (or whoever runs the shop)
will need. **Tracked in git.**

## What goes where

| Path                    | Tracked?   | For                                                     |
| ----------------------- | ---------- | ------------------------------------------------------- |
| `docs/operations/`      | ✅ yes     | Runbooks & how-to: shop/Stripe, deploys, integrations   |
| `docs/` (other folders) | ✅ yes     | Product notes, business decisions, reference            |
| `docs/superpowers/`     | ❌ ignored | Transient planning: implementation plans & design specs |

The split is enforced in `.gitignore`: everything under `docs/` is committed
**except** `docs/superpowers/`, which holds throwaway plans/specs.

## ⚠️ Never put secret _values_ in tracked docs

Netlify's build runs a secrets scanner over committed files. If an environment
variable's **value** (even a non-secret one like a from-address) appears in a
tracked file, the build fails. Reference env vars by **name** only, and use
obvious placeholders (`rk_live_xxx`, `whsec_xxx`) for examples. The canonical
list of variable names lives in `.env.example`.

## Index

- [operations/shop-stripe.md](operations/shop-stripe.md) — the Stripe-backed
  shop: how inventory works, the seed + stock scripts, adding products, and the
  test → live go-live runbook.
- [operations/calendar-shows.md](operations/calendar-shows.md) — the Google
  Calendar → shows feed: how events are filtered (public/private, invites), the
  Missy workflow for hiding personal events, caching, and the inspect script.
