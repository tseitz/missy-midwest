/** Master switch for the storefront. Flip to `true` to launch the shop. */
export const SHOP_ENABLED = true;

/**
 * Flat-rate US shipping, in cents. Three places must agree on this number: the
 * Stripe Checkout shipping option, the Product structured data Google reads,
 * and the published shipping policy. Google Merchant Center rejects a listing
 * whose feed price disagrees with the page, so keep this the single source.
 */
export const SHIPPING_RATE_CENTS = 1000;
