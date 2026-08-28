# Google Shopping tab (free listings)

How Missy Midwest merch gets onto Google's Search **Shopping** tab. Free — this
is not Google Ads.

## Why this exists

Google emailed Search Console (`sc-noreply@google.com`, 2026-08-24, "Your
products aren't on the Search Shopping tab") saying products from the site were
missing from the Shopping tab. The site is a custom SvelteKit + Stripe
storefront, so Google's one-click Shopify / WooCommerce connector does not
apply. We feed Google by hand instead.

## How the pieces fit

```
Stripe catalog  →  /shop/<group> page  →  Product JSON-LD in the HTML
                                              ↓  (Google crawls it)
                                       Merchant Center account
                                              ↓
                                       Search Shopping tab
```

Three things must all be true, and Merchant Center checks all three:

1. **Every product page carries Product structured data.** Built by
   `productJsonLd()` in `src/lib/seo/jsonld.ts`, rendered by
   `src/routes/shop/[group]/+page.svelte`.
2. **A shipping policy and a return policy are published on the site.**
   `/shipping-returns` (`src/routes/shipping-returns/+page.svelte`), linked from
   the footer and from every product page.
3. **A Merchant Center account is claimed for the domain and linked to Search
   Console.** Manual, browser-only — see the runbook below.

## The structured data

`productJsonLd(group, origin)` emits one of two shapes:

| Group                       | Shape          | Why                                                                                                      |
| --------------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| 1 variant                   | `Product`      | A `ProductGroup` that varies by nothing is invalid.                                                      |
| 2+ variants (color or size) | `ProductGroup` | Each variant has its own price and stock, so a sold-out color must list separately from an in-stock one. |

Every `Offer` carries the four fields Merchant Center will otherwise reject on:

- `price` / `priceCurrency` — bare decimal, no `$`, from the Stripe price.
- `availability` — `InStock` when stock > 0, else `OutOfStock`.
- `shippingDetails` — flat US rate from `SHIPPING_RATE_CENTS`.
- `hasMerchantReturnPolicy` — `MerchantReturnNotPermitted` (all sales final).

`SHIPPING_RATE_CENTS` lives in `src/lib/shop/config.ts` and is the single source
for the Stripe Checkout shipping option, the structured data, and the published
policy page. **Merchant Center suspends accounts whose feed price disagrees with
the page price**, so never fork this number.

We do not send GTINs. These are custom-made merch with no barcode; `brand` +
`sku` (the Stripe Product ID) is the accepted substitute. In Merchant Center,
answer "no" when asked whether products have GTINs.

## Runbook: first-time Merchant Center setup

Do this once, in a browser, signed in as the Google account that owns Search
Console for `missymidwest.com`.

1. **Deploy the structured data first.** Merchant Center reads live pages; it
   cannot see localhost. Confirm it shipped by running a product URL through the
   [Rich Results Test](https://search.google.com/test/rich-results) — it should
   report a valid `Product` or `ProductGroup`.
2. **Create the account** at
   [merchantcenter.google.com](https://merchantcenter.google.com). Business name
   `Missy Midwest`, country United States, currency USD.
3. **Claim the website.** Merchant Center → _Business info_ → _Website_. Because
   the domain is already verified in Search Console under the same Google
   account, this should verify with one click.
4. **Set shipping.** _Shipping and returns_ → add a US service, flat rate,
   matching `SHIPPING_RATE_CENTS`. Also add a **free** local-pickup service —
   Stripe Checkout offers it and Merchant Center wants every option declared.
5. **Set the return policy.** _Shipping and returns_ → _Returns_ → "no returns
   accepted". This must match `/shipping-returns` word for word in meaning, or
   the account gets flagged.
6. **Turn on automatic feeds.** _Products_ → _Feeds_ → _Automatic improvements /
   Website crawl_. This is what makes Google read the JSON-LD instead of
   requiring an uploaded spreadsheet feed.
7. **Link Search Console.** In Search Console → _Shopping_ → _Get started_, pick
   the Merchant Center account. (This is the button the original email linked
   to. It only works after step 2.)
8. **Wait.** Google crawls and reviews over roughly 3–5 business days. Check
   _Products_ → _Diagnostics_ for rejections.

## Runbook: after adding a new product

Nothing to do. New Stripe products flow into `/shop`, the sitemap, and the
structured data automatically. Google re-crawls on its own schedule; to hurry it
along, submit the product URL in Search Console → _URL inspection_ → _Request
indexing_.

## Failure modes

| Symptom                            | Cause                                                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| "Missing return policy"            | Step 5 not done, or `/shipping-returns` unreachable.                                                  |
| "Price mismatch"                   | Structured data and Stripe disagree — usually a stale build, or someone forked `SHIPPING_RATE_CENTS`. |
| "Missing value: gtin"              | A warning, not a rejection. Safe to ignore for custom merch.                                          |
| Product missing but page validates | Google has not crawled it yet, or the variant is `OutOfStock` — Google hides out-of-stock items.      |
| All products vanish                | `SHOP_ENABLED` is `false` in `src/lib/shop/config.ts`, so `/shop/<group>` redirects away.             |

## Related

- [shop-stripe.md](shop-stripe.md) — the catalog and inventory model behind all
  of this.
