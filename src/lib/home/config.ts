/**
 * Master switch for the home page's Instagram section.
 *
 * TEMPORARILY OFF (2026-07-27): the Behold account hit its free-tier view cap
 * and is paused until 00:00 UTC on 2026-08-01, so the feed returns 402 and the
 * section renders as six empty placeholder tiles. Rather than show that for a
 * few days, we hide the section outright — which also stops the doomed request
 * and the Sentry reports it generates.
 *
 * **Flip back to `true` on/after 2026-08-01.** See
 * [`docs/operations/instagram-behold.md`](../../../docs/operations/instagram-behold.md).
 */
export const INSTAGRAM_ENABLED = false;
