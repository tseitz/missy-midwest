/**
 * Master switch for the home page's Instagram section.
 *
 * When `false`, the section is hidden and `getInstagramFeed()` is skipped
 * entirely in the load — no doomed request, no wasted Behold views, no Sentry
 * reports. Same pattern as `SHOP_ENABLED`.
 *
 * Flip to `false` if the Behold account is paused at its free-tier view cap
 * (the feed returns 402 and the grid would render as empty placeholder tiles).
 * See [`docs/operations/instagram-behold.md`](../../../docs/operations/instagram-behold.md).
 */
export const INSTAGRAM_ENABLED = true;
