# Instagram feed (Behold)

The Instagram grid on the home page is served from **[Behold](https://behold.so)**,
a hosted Instagram-feed service, fetched server-side in
[`src/lib/server/instagram.ts`](../../src/lib/server/instagram.ts) and rendered by
[`src/lib/home/InstagramFeed.svelte`](../../src/lib/home/InstagramFeed.svelte).

## Kill switch

`INSTAGRAM_ENABLED` in [`src/lib/home/config.ts`](../../src/lib/home/config.ts)
gates the whole section — currently **`true`** (live). Flipping it to `false`
hides the section _and_ short-circuits `getInstagramFeed()` in
[`+page.server.ts`](../../src/routes/+page.server.ts), so a paused feed costs no
views and fires no Sentry reports. Same pattern as `SHOP_ENABLED`; the feed code
itself is untouched either way and stays under test.

Reach for it when the account is paused at the view cap (below) and the grid
would otherwise render as six empty placeholder tiles for days. It's a code
change — flip the constant, commit, push. No env-var or Behold-dashboard change.

_History: off from 2026-07-27 to 2026-08-08 after the July free-tier pause._

## Source

- **Service:** Behold, public JSON feed at `https://feeds.behold.so/<feed-id>`.
- **Config:** the `BEHOLD_FEED_ID` env var (see `.env.example`). Unset → the
  fetch is skipped entirely and the page renders the placeholder grid with no
  error. That's deliberate, so branch builds work without the key.
- **Instagram account type:** Behold can only connect Business or Media Creator
  Instagram accounts (an Instagram API restriction, not a Behold one).

We fetch server-side rather than using Behold's browser script so posts land in
the server-rendered HTML — better LCP/SEO, and no third-party JS on the page.

## ⚠️ Billing: the TTL sets the bill, not the traffic

**This is the thing to understand before touching the cache.**

Behold bills per **feed request**. One GET to `feeds.behold.so/<feed-id>` = one
"view", regardless of how many posts come back. Post images are served from
`scontent.cdninstagram.com` — Instagram's own CDN — so Behold never sees them and
can't count them. A page load with a warm cache costs **zero** views.

The consequence: **views are decoupled from visitors and coupled to our cache
TTL.** A single warm serverless instance spends `24h / TTL` views per day even
with zero traffic. And because the cache is a module-level variable inside an AWS
Lambda, cold starts and concurrent instances multiply that — Netlify gives us no
shared cache to hold it in.

| Plan    | Views/month | Cost   |
| ------- | ----------- | ------ |
| Free    | 1,200       | $0     |
| Starter | 15,000      | $10/mo |
| Pro     | 125,000     | $30/mo |

**We are on the free plan: 1,200 views/month ≈ 40/day.**

### What happens at the cap

On the free plan the account is **paused the moment you hit the limit, until the
beginning of the next UTC month.** The feed endpoint then returns
**`402 Payment Required`**, and Behold emails a notification. Paid plans are more
forgiving — they only pause after exceeding the limit two months running.

Nothing on our end can lift the pause. It self-heals at 00:00 UTC on the 1st.

### Current budget

| TTL                      | Value | Views/day (per warm instance) |
| ------------------------ | ----- | ----------------------------- |
| `CACHE_TTL_MS` (success) | 6 h   | 4                             |
| `FAILURE_CACHE_TTL_MS`   | 1 h   | 24 (only while failing)       |

~120 views/month baseline — about 10% of the cap, leaving headroom for instance
churn. Failures are cached too, or a paused feed re-fetches on every single
render: burning views, adding a dead round trip to the home page, and firing a
duplicate Sentry report per request.

**If you shorten `CACHE_TTL_MS`, do the arithmetic first.** The original 30-minute
TTL worked out to ~1,460 views/month — over the free cap on an empty site, which
is exactly how we got paused in July 2026.

Freshness costs us nothing here: the account posts a few times a week, so a 6h
TTL is invisible. It also stays well inside the few-day expiry on the signed
Instagram CDN image URLs — pinning the feed for days would serve broken images.

## Failure behaviour

Every failure mode degrades to the same place: `posts: []`, which renders the
branded placeholder grid. **The home page never breaks on a feed failure.**

Failures are validated with Zod in [`src/lib/home/instagram.ts`](../../src/lib/home/instagram.ts)
and reported through `reportFailure` (Sentry-gated) under the message prefix
`Instagram feed failure:`. Common causes:

- **`402 Payment Required`** — the view cap, above. Wait for the month to roll
  over, or upgrade to Starter.
- **Source disconnected** — Behold's access token was invalidated, usually by an
  Instagram password change. Fix by re-visiting the original auth link in the
  Behold dashboard.
- **Parse/validation error** — Behold's payload shape drifted. These retry on the
  short TTL rather than the 6h one so a fix lands promptly.

## Monitoring usage

Behold's Admin API exposes a `views` field per feed — an integer for the current
month by default, expandable to a per-day breakdown (single-feed requests return
up to twelve months). Worth checking there first if a 402 shows up unexpectedly,
or to verify the real burn rate against the estimate above.
