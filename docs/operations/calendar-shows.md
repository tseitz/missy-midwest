# Calendar → shows feed

The Upcoming shows on the home teaser and `/shows` are driven by a Google
Calendar, read server-side in [`src/lib/server/calendar.ts`](../../src/lib/server/calendar.ts).

## Source

- **Calendar:** `missy.midwestofficial@gmail.com`
- **Auth:** a Google **service account** (JWT), read-only, shared on the calendar
  with a "See all event details" role. Credentials are the
  `MISSY_CALENDAR_*` env vars (see `.env.example`); the same account also reads
  Drive for event posters.

## Public vs. private — how events are filtered

⚠️ **Key gotcha:** an authenticated service-account reader sees **everything** on
the calendar — including meetings the account was merely _invited_ to and events
marked Private. Google does **not** auto-filter by the per-event Visibility flag
for an authenticated reader (that filtering only happens for anonymous/public
access). So we filter in code. `getUpcomingEvents()` drops an event when **any**
of these is true, before it ever reaches the page:

1. **`status === 'cancelled'`** — cancelled instances of a recurring series are
   still returned when `singleEvents: true`.
2. **Organized by someone else** (`organizer.self !== true`) — personal meeting
   invites that landed on the calendar (e.g. a recurring tax-review call from an
   outside firm). Self-organized **and** unattributed events are kept, so this
   can never hide a gig the account created itself.
3. **`visibility` is `private` or `confidential`** — the manual opt-out.

### Workflow for Missy

- **Gigs:** create them on the calendar as normal — leave Visibility on
  **Default**. They show automatically. (We deliberately do _not_ require marking
  each gig "Public"; as of this writing all ~50 gigs are Default and none are
  Public, so a public-only filter would hide everything.)
- **Personal events you add yourself:** set Visibility to **Private** in the
  Google Calendar event editor → hidden from the site.
- **Invites from other people:** nothing to do — they're dropped automatically.

## Caching

Both pages set `cache-control: public, max-age=0, s-maxage=300,
stale-while-revalidate=3600`, and `getUpcomingEvents()` keeps a 5-minute
in-memory cache. So a calendar change can take up to ~5 min (plus the edge SWR
window) to appear. The browser isn't caching (`max-age=0`) — staleness lives in
the **shared Netlify edge CDN**, which is global, not per-visitor. To force it
immediately, **redeploy** (Netlify keys its CDN cache per-deploy).

## Inspecting what the feed sees

[`scripts/inspect-calendar.mjs`](../../scripts/inspect-calendar.mjs) dumps the
**raw, unfiltered** service-account view — every upcoming event with its
`status`, `visibility`, and `organizer` — so you can see what the filters are
acting on. Read-only; changes nothing.

```
node --env-file=.env scripts/inspect-calendar.mjs
```

(The site applies the filters above on top of this raw feed, so events shown here
won't necessarily appear on the site.)
